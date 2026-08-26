import { supabase } from "./supabase-client.js";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
};

// Create service role client for admin operations (bypasses RLS)
const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", "http://127.0.0.1:54321");
const supabaseServiceKey = getEnvVar(
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
  "<YOUR-SUPABASE-KEY>"
);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
});

// Test service role access on initialization (silent)
// supabaseAdmin
//   .from("users")
//   .select("id")
//   .limit(1)
//   .then(({ error }) => {
//     if (error) {
//       console.error("Service role client initialization failed:", error);
//     }
//   });


// OpenAI
const openaiKey =  getEnvVar("VITE_OPENAI_API_KEY");
const openaiHost =  getEnvVar("VITE_OPENAI_API_HOST");


/**
 * Base Entity class that provides CRUD operations compatible with Backend SDK
 */
export class CustomEntity {
  constructor(tableName, useServiceRole = false) {
    this.tableName = tableName;
    this.supabase = useServiceRole ? supabaseAdmin : supabase;
    this.useServiceRole = useServiceRole;
  }

  /**
   * Map Backend field names to Supabase field names
   * @param {string} field - Field name to map
   * @returns {string} Mapped field name
   */
  mapFieldName(field) {
    const fieldMappings = {
      created_date: "created_at",
      updated_date: "updated_at",
      // Add any other field mappings as needed
    };
    return fieldMappings[field] || field;
  }

  /**
   * Map data object fields from Backend to Supabase format
   * @param {Object} data - Data object to map
   * @returns {Object} Mapped data object
   */
  mapDataFields(data) {
    if (!data || typeof data !== "object") return data;

    const mapped = {};
    Object.entries(data).forEach(([key, value]) => {
      const mappedKey = this.mapFieldName(key);
      mapped[mappedKey] = value;
    });
    return mapped;
  }

  /**
   * Map Supabase field names back to Backend field names in results
   * @param {Array|Object} data - Data to map
   * @returns {Array|Object} Mapped data
   */
  mapResultFields(data) {
    if (!data) return data;

    const reverseFieldMappings = {
      created_at: "created_date",
      updated_at: "updated_date",
    };

    const mapObject = (obj) => {
      const mapped = {};
      for (const [key, value] of Object.entries(obj)) {
        const mappedKey = reverseFieldMappings[key] || key;
        mapped[mappedKey] = value;
      }
      return mapped;
    };

    if (Array.isArray(data)) {
      return data.map(mapObject);
    } else {
      return mapObject(data);
    }
  }

  /**
   * List all records with optional ordering and limit
   * @param {string} orderBy - Field to order by (prefix with '-' for descending)
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Array of records
   */
  async list(orderBy = "created_at", limit = null) {
    let query = this.supabase.from(this.tableName).select("*");

    if (orderBy) {
      if (orderBy.startsWith("-")) {
        const field = this.mapFieldName(orderBy.substring(1));
        query = query.order(field, { ascending: false });
      } else {
        const field = this.mapFieldName(orderBy);
        query = query.order(field, { ascending: true });
      }
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(
          `Table ${this.tableName} does not exist, returning empty array`
        );
        return [];
      }
      throw error;
    }
    return this.mapResultFields(data) || [];
  }

  /**
   * Filter records based on conditions
   * @param {Object} conditions - Filter conditions
   * @param {string} orderBy - Field to order by (prefix with '-' for descending)
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Array of filtered records
   */
  async filter(conditions = {}, orderBy = "created_at", limit = null) {
    let query = this.supabase.from(this.tableName).select("*");

    // Apply filter conditions with field mapping
    Object.entries(conditions).forEach(([key, value]) => {
      const mappedKey = this.mapFieldName(key);
      if (Array.isArray(value)) {
        query = query.in(mappedKey, value);
      } else {
        query = query.eq(mappedKey, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      if (orderBy.startsWith("-")) {
        const field = this.mapFieldName(orderBy.substring(1));
        query = query.order(field, { ascending: false });
      } else {
        const field = this.mapFieldName(orderBy);
        query = query.order(field, { ascending: true });
      }
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(
          `Table ${this.tableName} does not exist, returning empty array`
        );
        return [];
      }
      console.error(`Filter error for ${this.tableName}:`, error);
      throw error;
    }
    return this.mapResultFields(data) || [];
  }

  /**
   * Get a single record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object>} Single record
   */
  async get(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(`Table ${this.tableName} does not exist, returning null`);
        return null;
      }
      console.error(`Get error for ${this.tableName}:`, error);
      throw error;
    }

    return data ? this.mapResultFields(data) : null;
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    // Map field names from Backend to Supabase format
    const mappedData = this.mapDataFields(data);

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(mappedData)
      .select()
      .single();

    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(
          `Table ${this.tableName} does not exist, cannot create record`
        );
        throw new Error(
          `Table ${this.tableName} is not available in this environment`
        );
      }
      console.error(`Create error for ${this.tableName}:`, error);
      throw error;
    }
    return this.mapResultFields(result);
  }

  /**
   * Update a record by ID
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    // Map field names from Backend to Supabase format
    const mappedData = this.mapDataFields(data);

    // Always add updated_at timestamp
    mappedData.updated_at = new Date().toISOString();

    // Update the record
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(mappedData)
      .eq("id", id)
      .select()
      .maybeSingle(); // Use maybeSingle instead of single to handle no rows gracefully

    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(
          `Table ${this.tableName} does not exist, cannot update record`
        );
        return null;
      }
      console.error(`Update error for ${this.tableName}:`, error);
      throw error;
    }

    // If no rows were updated, return null to match Backend behavior
    if (!result) {
      return null;
    }

    return this.mapResultFields(result);
  }

  /**
   * Delete a record by ID
   * @param {string} id - Record ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      // Handle missing table gracefully for legacy entities
      if (
        error.code === "PGRST205" &&
        error.message.includes("Could not find the table")
      ) {
        console.warn(
          `Table ${this.tableName} does not exist, cannot delete record`
        );
        return;
      }
      throw error;
    }
  }
}

/**
 * User Entity with authentication methods
 */
export class UserEntity extends CustomEntity {
  constructor() {
    super("users", true); // Use service role for user operations to bypass RLS when needed
  }

  /**
   * Get a user by ID using service role (bypasses RLS)
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async get(id) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }

    return data ? this.mapResultFields(data) : null;
  }

  /**
   * Get current authenticated user data
   * @returns {Promise<Object>} Current user data
   */
  async me() {
    try {
      // Use the regular supabase client for auth, but admin client for database operations
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        // Handle specific auth errors more gracefully
        if (
          authError.message?.includes(
            "User from sub claim in JWT does not exist"
          )
        ) {
          // Clear the invalid session and throw not authenticated
          await supabase.auth.signOut();
          throw new Error("Not authenticated");
        }
        // Only log unexpected auth errors, not session missing errors
        if (!authError.message?.includes("Auth session missing")) {
          console.error("Auth error:", authError);
        }
        throw new Error("Not authenticated");
      }

      if (!user) throw new Error("Not authenticated");

      // Use admin client (this.supabase) for database operations to bypass RLS
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // Use maybeSingle to handle no rows gracefully

      if (error) {
        console.error("Error fetching user:", error);
        throw error;
      }

      // If user doesn't exist in users table, create from auth user
      if (!data) {
        const newUser = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          email_verified: user.email_confirmed_at ? true : false,
          role: user.email === "dev@localhost.com" ? "admin" : "user", // Make dev user an admin
        };

        const { data: createdUser, error: createError } = await this.supabase
          .from("users")
          .insert(newUser)
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
        return this.mapResultFields(createdUser);
      }

      // Ensure dev user is always an admin
      if (user.email === "dev@localhost.com" && data.role !== "admin") {
        const { data: updatedUser, error: updateError } = await this.supabase
          .from("users")
          .update({ role: "admin" })
          .eq("id", user.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating dev user to admin:", updateError);
        } else {
          console.log("Updated dev user to admin role");
          return this.mapResultFields(updatedUser);
        }
      }

      return this.mapResultFields(data);
    } catch (error) {
      // Handle various auth-related errors gracefully
      if (
        error.message?.includes("403") ||
        error.message?.includes("Forbidden") ||
        error.message?.includes("User from sub claim in JWT does not exist") ||
        error.message?.includes("AuthApiError")
      ) {
        // Clear any invalid session
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore sign out errors
        }
        throw new Error("Not authenticated");
      }
      throw error;
    }
  }

  /**
   * Update current user's data
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateMyUserData(userData) {
    // Use regular supabase client for auth, but admin client for database operations
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await this.supabase
      .from("users")
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .maybeSingle(); // Use maybeSingle to handle no rows gracefully

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    // If no rows were updated, return null
    if (!data) {
      return null;
    }

    return this.mapResultFields(data);
  }

  /**
   * Sign in with OAuth provider or development mode
   * @param {string} provider - OAuth provider (google, github, etc.) or 'dev' for development
   * @returns {Promise<void>}
   */
  async login(provider = "dev") {
    // For local development, use a simple email/password flow
    if (provider === "dev") {
      // Create a development user if it doesn't exist
      const devEmail = "dev@localhost.com";
      const devPassword = "dev123456";

      try {
        // Try to sign in first using regular supabase client
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: devEmail,
            password: devPassword,
          });

        if (signInError) {
          console.log(
            "Sign in failed, attempting to create user:",
            signInError.message
          );

          // User doesn't exist, create it
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: devEmail,
              password: devPassword,
              options: {
                data: {
                  full_name: "Development User",
                  role: "admin", // Set as admin in user metadata
                },
              },
            });

          if (signUpError) {
            console.error("Sign up failed:", signUpError);
            throw signUpError;
          }

          console.log("User created successfully:", signUpData);

          // For local development, we might need to confirm the user manually
          // or the user might be auto-confirmed depending on Supabase settings
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            console.log(
              "User created but not confirmed. In production, check email for confirmation."
            );
          }

          // Try to sign in again after signup
          const { data: signInAfterSignUpData, error: signInAfterSignUpError } =
            await supabase.auth.signInWithPassword({
              email: devEmail,
              password: devPassword,
            });

          if (signInAfterSignUpError) {
            console.error(
              "Sign in after signup failed:",
              signInAfterSignUpError
            );
            throw signInAfterSignUpError;
          }

          console.log(
            "Successfully signed in after signup:",
            signInAfterSignUpData
          );
        } else {
          console.log("Successfully signed in:", signInData);
        }

        // Refresh the page to ensure authentication state is properly loaded
        window.location.reload();
      } catch (error) {
        console.error("Development login failed:", error);
        throw error;
      }
      return;
    }

    // For production, use OAuth with regular supabase client
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        // Clear invalid session if needed
        if (
          authError.message?.includes(
            "User from sub claim in JWT does not exist"
          )
        ) {
          await supabase.auth.signOut();
        }
        return false;
      }

      return !!user;
    } catch {
      return false;
    }
  }

  /**
   * Get current user data if authenticated, null if not
   * @returns {Promise<Object|null>} Current user data or null
   */
  async getCurrentUser() {
    try {
      return await this.me();
    } catch (error) {
      if (error.message === "Not authenticated") {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all users (admin function using service role)
   * @param {string} orderBy - Field to order by
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of users
   */
  async list(orderBy = "created_at", limit = null) {
    return super.list(orderBy, limit);
  }

  /**
   * Filter users (admin function using service role)
   * @param {Object} conditions - Filter conditions
   * @param {string} orderBy - Field to order by
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of filtered users
   */
  async filter(conditions = {}, orderBy = "created_at", limit = null) {
    return super.filter(conditions, orderBy, limit);
  }
}

/**
 * Convert PascalCase entity name to snake_case table name
 * @param {string} entityName - Entity name in PascalCase
 * @returns {string} Table name in snake_case
 */
function entityNameToTableName(entityName) {
  return entityName
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

/**
 * Determine if an entity should use service role based on common patterns
 * @param {string} entityName - Entity name
 * @returns {boolean} Whether to use service role
 */
function shouldUseServiceRole(entityName) {
  const serviceRoleEntities = [
    "user",
    "transaction",
    "usermembership",
    "payment",
    "order",
    "subscription",
    "admin",
    "audit",
    "log",
  ];

  return serviceRoleEntities.some((pattern) =>
    entityName.toLowerCase().includes(pattern)
  );
}

/**
 * Create a dynamic entities proxy that creates entities on-demand
 */
function createEntitiesProxy() {
  const entityCache = new Map();

  return new Proxy(
    {},
    {
      get(_, entityName) {
        if (typeof entityName !== "string") return undefined;

        // Return cached entity if it exists
        if (entityCache.has(entityName)) {
          return entityCache.get(entityName);
        }

        // Create new entity on-demand
        const tableName = entityNameToTableName(entityName);
        const useServiceRole = shouldUseServiceRole(entityName);
        const entity = new CustomEntity(tableName, useServiceRole);

        // Cache the entity for future use
        entityCache.set(entityName, entity);

        console.log(
          `Created entity: ${entityName} -> ${tableName} (service role: ${useServiceRole})`
        );

        return entity;
      },

      has(_, entityName) {
        return typeof entityName === "string";
      },

      ownKeys() {
        return Array.from(entityCache.keys());
      },
    }
  );
}

/**
 * Create custom client that mimics Backend SDK structure
 */
export function createCustomClient() {
  return {
    entities: createEntitiesProxy(),
    auth: new UserEntity(),
    functions: {
      // Placeholder functions that can be implemented later
      verifyHcaptcha: async () => {
        // TODO: Implement hCaptcha verification
        console.warn("verifyHcaptcha not yet implemented");
        return { success: true };
      },
    },
    integrations: {
      Core: {
        InvokeLLM: async ({
          prompt,
          add_context_from_internet = false,
          response_json_schema = null,
          file_urls = null,
        }) => {
          console.warn("InvokeLLM called with:", {
            prompt,
            add_context_from_internet,
            response_json_schema,
            file_urls,
          });

          // TODO: Replace with actual OpenAI API call
          // Example implementation:
          console.log("OpenAI Host: ", openaiHost);
          const openai = new OpenAI({ 
            apiKey: openaiKey,
            baseURL: openaiHost,
            dangerouslyAllowBrowser: true
          });
          const response = await openai.chat.completions.create({
            model: "qwen-flash",
            messages: [
               { role: "system", content: "根据用户需求内容回答且必须以JSON格式返回." },
               { role: "user", content: prompt }
            ],
            response_format: response_json_schema ? { type: "json_object" } : undefined
          });
          const ret = JSON.parse(response.choices[0].message.content || '{}');
          console.log(ret);
          return ret;
          if (response_json_schema) {
            return {
              data: {
                message:
                  "This would be structured data matching the provided schema",
                note: "LLM integration not yet implemented",
              },
            };
          } else {
            return {
              response:
                "This would be the LLM response text. LLM integration not yet implemented.",
            };
          }
        },

        SendEmail: async ({
          to,
          subject,
          body,
          from_name = "Peace Adventures",
        }) => {
          console.warn("SendEmail called with:", {
            to,
            subject,
            body,
            from_name,
          });

          // TODO: Replace with actual email service (Resend, SendGrid, etc.)
          // Example with Resend:
          // const resend = new Resend(process.env.RESEND_API_KEY);
          // const result = await resend.emails.send({
          //   from: `${from_name} <noreply@yourdomain.com>`,
          //   to: [to],
          //   subject: subject,
          //   html: body
          // });

          return {
            status: "sent",
            message_id: `mock_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 11)}`,
            note: "Email integration not yet implemented - email would have been sent",
          };
        },

        UploadFile: async ({ file }) => {
          console.warn(
            "UploadFile called with file:",
            file?.name,
            file?.size,
            file?.type
          );

          // TODO: Replace with Supabase Storage upload
          // Example implementation:
          // const fileName = `${Date.now()}_${file.name}`;
          // const { data, error } = await supabase.storage
          //   .from('uploads')
          //   .upload(fileName, file);
          //
          // if (error) throw error;
          //
          // const { data: { publicUrl } } = supabase.storage
          //   .from('uploads')
          //   .getPublicUrl(fileName);
          //
          // return { file_url: publicUrl };

          // Mock response for now
          const mockUrl = `https://mock-storage.supabase.co/uploads/${Date.now()}_${
            file?.name || "file"
          }`;
          return {
            file_url: mockUrl,
            note: "File upload integration not yet implemented - this is a mock URL",
          };
        },

        GenerateImage: async ({ prompt }) => {
          console.warn("GenerateImage called with prompt:", prompt);

          // TODO: Replace with actual AI image generation (DALL-E, Stability AI, etc.)
          // Example with OpenAI DALL-E:
          // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          // const response = await openai.images.generate({
          //   model: "dall-e-3",
          //   prompt: prompt,
          //   size: "1024x1024",
          //   quality: "standard",
          //   n: 1,
          // });
          //
          // return { url: response.data[0].url };

          // Mock response for now
          const mockUrl = `https://mock-ai-images.com/generated/${Date.now()}.png`;
          return {
            url: mockUrl,
            note: "Image generation integration not yet implemented - this is a mock URL",
          };
        },

        ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
          console.warn("ExtractDataFromUploadedFile called with:", {
            file_url,
            json_schema,
          });

          // TODO: Replace with actual OCR/document processing service
          // Example with AWS Textract or custom OCR solution:
          // const textract = new AWS.Textract();
          // const result = await textract.analyzeDocument({
          //   Document: { S3Object: { Bucket: bucket, Name: key } },
          //   FeatureTypes: ['TABLES', 'FORMS']
          // }).promise();
          //
          // Process and structure the result according to json_schema

          // Mock response for now
          return {
            status: "success",
            details: null,
            output: json_schema?.type === "array" ? [] : {},
            note: "File data extraction integration not yet implemented - this is a mock response",
          };
        },
      },
    },
  };
}

// Export the default client instance
export const customClient = createCustomClient();
