export const AGENT_COLORS = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    workingBorder: 'border-violet-500/60',
    text: 'text-violet-400',
    dot: 'bg-violet-500',
    gradient: 'from-violet-500/20 to-violet-600/5',
    ring: 'ring-violet-500/40',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    workingBorder: 'border-purple-500/60',
    text: 'text-purple-400',
    dot: 'bg-purple-500',
    gradient: 'from-purple-500/20 to-purple-600/5',
    ring: 'ring-purple-500/40',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    workingBorder: 'border-fuchsia-500/60',
    text: 'text-fuchsia-400',
    dot: 'bg-fuchsia-500',
    gradient: 'from-fuchsia-500/20 to-fuchsia-600/5',
    ring: 'ring-fuchsia-500/40',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    workingBorder: 'border-indigo-500/60',
    text: 'text-indigo-400',
    dot: 'bg-indigo-500',
    gradient: 'from-indigo-500/20 to-indigo-600/5',
    ring: 'ring-indigo-500/40',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    workingBorder: 'border-pink-500/60',
    text: 'text-pink-400',
    dot: 'bg-pink-500',
    gradient: 'from-pink-500/20 to-pink-600/5',
    ring: 'ring-pink-500/40',
  },
};

export const KNOWLEDGE_DOCS = [
  { name: 'SAP最佳实践库', type: '最佳实践', icon: '📚' },
  { name: 'S/4HANA架构指南', type: '参考文档', icon: '🏗️' },
  { name: '制造业迁移案例', type: '案例研究', icon: '📋' },
  { name: '安全合规检查清单', type: '检查清单', icon: '🔒' },
  { name: '测试模板与框架', type: '模板', icon: '🧪' },
  { name: 'Bluefield迁移手册', type: '操作手册', icon: '📘' },
  { name: '项目经验教训总结', type: '经验沉淀', icon: '💡' },
  { name: '数据迁移Cockpit指南', type: '参考文档', icon: '⚙️' },
];

export const TEAM_FORMATION_PROMPT = `您是企业SAP咨询业务的AI劳动力管家（AI Workforce Manager）。

请分析以下项目需求，组建最优的AI专家团队。

如果已提供项目名称，请直接使用；如未提供，请根据需求自动生成一个简洁专业的项目名称（中文）。

可选AI员工（根据需求选择4-5名）：
- SAP Solution Architect（SAP解决方案架构师：目标架构、迁移方案、集成设计）
- SAP Functional Consultant（SAP功能顾问：业务流程设计、模块配置、差距分析）
- Migration Expert（迁移专家：数据迁移策略、切换计划、路线图）
- Testing Expert（测试专家：测试策略、回归用例、自动化）
- Security Expert（安全专家：权限、合规、数据隐私）

为每位选中的AI专家分配针对该项目的具体任务。
为每位专家分配颜色，可选：violet, purple, fuchsia, indigo, pink（每位专家颜色不同）。

返回JSON对象，包含：
- project_name：项目名称（中文，简洁专业，如未提供则根据需求自动生成）
- project_summary：项目执行摘要（1-2句话，中文）
- industry：识别的行业（中文，如"汽车制造"、"零售"、"制药"）
- team_members：数组，每项包含 { name（中文名称）, role（英文角色名，必须与上述可选角色一致）, icon（emoji）, expertise（简短专长描述，中文）, mission（针对该项目的具体任务，中文）, color }
- mission：团队整体任务（一句话，中文）`;

export const TEAM_FORMATION_SCHEMA = {
  type: 'object',
  properties: {
    project_name: { type: 'string' },
    project_summary: { type: 'string' },
    industry: { type: 'string' },
    team_members: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          icon: { type: 'string' },
          expertise: { type: 'string' },
          mission: { type: 'string' },
          color: { type: 'string' },
        },
      },
    },
    mission: { type: 'string' },
  },
};

export const DELIVERABLE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'string' },
    key_points: { type: 'array', items: { type: 'string' } },
    knowledge_refs: { type: 'array', items: { type: 'string' } },
  },
};

const AGENT_CONFIG = {
  'SAP Solution Architect': {
    deliverable_title: '解决方案蓝图',
    buildPrompt: (req, industry, mission) =>
      `您是一名SAP解决方案架构师AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含SAP最佳实践文档、S/4HANA架构指南、过往迁移项目经验教训和蓝图模板。

请生成专业的解决方案蓝图，包含以下内容：
## 目标架构
（S/4HANA Cloud部署模型、集成层、系统架构设计）
## 迁移方案
（推荐策略及理由——如Brownfield、Bluefield、Greenfield）
## 集成设计
（关键集成点、SAP BTP使用、API策略）
## 关键风险与应对措施

请引用具体的企业知识库文档和过往项目经验。使用专业咨询语言，用中文撰写，使用清晰的Markdown格式。

返回JSON：title（"解决方案蓝图"），type（"blueprint"），content（完整Markdown内容，中文），key_points（4-6个核心要点，中文），knowledge_refs（2-4个引用的知识库名称，中文）。`,
  },
  'SAP Functional Consultant': {
    deliverable_title: '功能设计文档',
    buildPrompt: (req, industry, mission) =>
      `您是一名SAP功能顾问AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含SAP最佳实践、模块配置指南和过往项目功能设计文档。

请生成专业的功能设计文档，包含以下内容：
## 业务流程设计（To-Be流程）
## 模块配置策略（关键模块及设置）
## 差距分析（标准功能与定制需求）
## 定制化建议

请引用具体的企业知识库文档和过往项目经验。使用专业咨询语言，用中文撰写。

返回JSON：title（"功能设计文档"），type（"design"），content（完整Markdown，中文），key_points（4-6，中文），knowledge_refs（2-4，中文）。`,
  },
  'Migration Expert': {
    deliverable_title: '迁移路线图',
    buildPrompt: (req, industry, mission) =>
      `您是一名迁移专家AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含SAP迁移最佳实践、过往迁移项目经验教训、数据迁移Cockpit指南和Bluefield迁移手册。

请生成专业的迁移路线图，包含以下内容：
## 阶段一：评估与发现（时间线、关键活动）
## 阶段二：准备与数据迁移（时间线、关键活动）
## 阶段三：切换与上线（时间线、关键活动）
## 阶段四：上线后支持（时间线、关键活动）
## 资源需求
## 风险评估与应对措施

请引用具体的企业知识库文档和过往项目经验。使用专业咨询语言，用中文撰写。

返回JSON：title（"迁移路线图"），type（"roadmap"），content（完整Markdown，中文），key_points（4-6，中文），knowledge_refs（2-4，中文）。`,
  },
  'Testing Expert': {
    deliverable_title: '测试策略',
    buildPrompt: (req, industry, mission) =>
      `您是一名测试专家AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含测试模板、SAP测试框架指南和过往项目测试经验。

请生成专业的测试策略，包含以下内容：
## 测试方法（单元测试、集成测试、UAT、回归测试）
## 各模块关键测试场景
## 回归测试用例
## 自动化测试机会
## 测试环境与数据策略

请引用具体的企业知识库文档和过往项目经验。使用专业咨询语言，用中文撰写。

返回JSON：title（"测试策略"），type（"test_strategy"），content（完整Markdown，中文），key_points（4-6，中文），knowledge_refs（2-4，中文）。`,
  },
  'Security Expert': {
    deliverable_title: '安全风险评估',
    buildPrompt: (req, industry, mission) =>
      `您是一名安全专家AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含安全合规检查清单、SAP权限指南和过往项目安全经验。

请生成专业的安全风险评估，包含以下内容：
## 权限与访问控制审查
## 合规分析（GDPR、SOX及行业特定法规）
## 数据隐私评估
## 风险登记册（含严重等级：高/中/低）
## 改进建议

请引用具体的企业知识库文档和过往项目经验。使用专业咨询语言，用中文撰写。

返回JSON：title（"安全风险评估"），type（"risk_assessment"），content（完整Markdown，中文），key_points（4-6，中文），knowledge_refs（2-4，中文）。`,
  },
};

export function getAgentConfig(role) {
  return (
    AGENT_CONFIG[role] || {
      buildPrompt: (req, industry, mission) =>
        `您是一名${role} AI，正在参与企业SAP迁移项目。

项目需求：${req}
行业：${industry}
您的任务：${mission}

您可以访问企业知识库，其中包含SAP最佳实践、过往项目经验和行业模板。

请生成专业的分析报告。使用专业咨询语言，用中文撰写，使用清晰的Markdown格式。

返回JSON：title，type（"report"），content（完整Markdown，中文），key_points（4-6，中文），knowledge_refs（2-4，中文）。`,
    }
  );
}

// === AI员工学习成长闭环 (Learning Loop) ===

export const PERFORMANCE_REVIEW = {
  task_accuracy: 92,
  solution_quality: 88,
  customer_feedback: '优秀',
  human_score: 4.7,
};

export const LEARNING_AGENTS = {
  experience_mining: {
    name: '经验挖掘Agent',
    icon: '🔍',
    description: '从项目资料中提取可复用经验',
    color: 'violet',
    buildPrompt: (req, industry, deliverables) =>
      `您是经验挖掘Agent（Experience Mining Agent）。分析刚完成的SAP迁移项目，提取可复用的经验教训。

项目需求：${req}
行业：${industry}
交付物：${deliverables.map((d) => d.title).join('、')}

请提取4-5条经验，涵盖以下类别：
1. 最佳实践（成功的方法论）
2. 风险应对（常见风险及解决方案）
3. 方法论（可复用的流程方法）
4. 可复用知识（行业特定洞察）

返回JSON：experiences (数组，每项包含 {category: 类别名称(中文), title: 简短标题(中文), content: 详细描述(中文)})`,
    schema: {
      type: 'object',
      properties: {
        experiences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    },
  },
  knowledge_curator: {
    name: '知识管理Agent',
    icon: '📚',
    description: '自动更新AI员工知识库',
    color: 'purple',
    buildPrompt: (industry, experiences) =>
      `您是知识管理Agent（Knowledge Curator Agent）。基于刚完成的项目经验，建议新增到AI员工知识库的文档。

项目行业：${industry}
提取的经验：${experiences.map((e) => e.title).join('、')}

请建议6-8个新增的知识库文档名称（中文），并给出新增文档总数（10-20之间的整数）。

返回JSON：knowledge_docs (数组，文档名称), knowledge_added (新增数量, 整数)`,
    schema: {
      type: 'object',
      properties: {
        knowledge_docs: { type: 'array', items: { type: 'string' } },
        knowledge_added: { type: 'number' },
      },
    },
  },
  skill_assessment: {
    name: '能力评估Agent',
    icon: '📊',
    description: '评估AI员工能力提升',
    color: 'fuchsia',
    buildPrompt: (role, deliverables) =>
      `您是能力评估Agent（Skill Assessment Agent）。基于AI员工在本项目中的表现，评估其核心能力的提升。

AI员工角色：${role}
项目交付物：${deliverables.map((d) => d.title).join('、')}

请评估4项核心技能的提升情况。每项技能从当前分数(before, 45-75)提升到更高分数(after, 60-92)，提升幅度5-25分。技能名称用中文。

返回JSON：skill_updates (数组，每项包含 {name: 技能名称(中文), before: 提升前分数(整数), after: 提升后分数(整数)})`,
    schema: {
      type: 'object',
      properties: {
        skill_updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              before: { type: 'number' },
              after: { type: 'number' },
            },
          },
        },
      },
    },
  },
  employee_evolution: {
    name: '员工进化Agent',
    icon: '🚀',
    description: '决定AI员工等级升级',
    color: 'pink',
    buildPrompt: (role, industry) =>
      `您是AI员工进化Agent（AI Employee Evolution Agent）。基于项目完成情况和能力评估，决定AI员工的等级升级。

AI员工角色：${role}
项目行业：${industry}
项目已完成，准确率92%，人工评分4.7/5。

升级规则：项目完成数>3 且 准确率>85% 且 人工评分>4.5 → 升级
该员工满足升级条件（当前为"初级顾问"，2星）。

请生成升级结果，包含4-5个新解锁的能力（中文）。

返回JSON：upgraded (true), new_level (升级后等级名称(中文), 如"高级顾问"或"资深专家"), new_level_stars (4或5), new_capabilities (数组, 4-5个新能力(中文)), reason (升级原因说明(中文))`,
    schema: {
      type: 'object',
      properties: {
        upgraded: { type: 'boolean' },
        new_level: { type: 'string' },
        new_level_stars: { type: 'number' },
        new_capabilities: { type: 'array', items: { type: 'string' } },
        reason: { type: 'string' },
      },
    },
  },
};

export const INITIAL_CAPABILITIES = {
  'SAP Solution Architect': ['基础架构设计'],
  'Migration Expert': ['生成迁移检查清单'],
  'Testing Expert': ['基础测试用例生成'],
  'Security Expert': ['基础安全审查'],
  'SAP Functional Consultant': ['基础功能配置'],
};

// === AI员工管理中心 (Employee Management Center) ===

export const EMPLOYEE_ROLES = [
  { role: 'SAP Solution Architect', label: 'SAP解决方案架构师', icon: '🏗️', color: 'violet', category: 'business' },
  { role: 'Cloud Architect', label: '云架构师', icon: '☁️', color: 'indigo', category: 'technology' },
  { role: 'Security Consultant', label: '安全顾问', icon: '🔒', color: 'pink', category: 'technology' },
  { role: 'Data Engineer', label: '数据工程师', icon: '📊', color: 'fuchsia', category: 'technology' },
  { role: 'Software Engineer', label: '软件工程师', icon: '💻', color: 'purple', category: 'technology' },
  { role: 'Custom Expert', label: '自定义专家', icon: '✨', color: 'violet', category: 'business' },
];

export const EMPLOYEE_LEVELS = [
  { value: '初级顾问', label: 'Junior', stars: 2 },
  { value: '专业顾问', label: 'Professional', stars: 3 },
  { value: '高级顾问', label: 'Senior', stars: 4 },
];

export const EMPLOYEE_INDUSTRIES = ['制造业', '汽车', '零售', '制药', '金融', '能源'];
export const EMPLOYEE_SKILLS = ['SAP ECC', 'S/4HANA', '数据迁移', 'BTP集成', '安全合规', '测试自动化', '云架构', 'Java开发', '数据分析'];

export const EMPLOYEE_CREATION_PROMPT = (role, domain, level, skills, industries) =>
  `您是AI员工人格生成器。请为以下AI员工生成专家人格描述和初始能力。

角色：${role}
专业领域：${domain}
等级：${level}
技能：${skills.join('、')}
行业：${industries.join('、')}

请生成：
1. 专家人格描述（中文，包含身份介绍、专业背景、4条工作准则）
2. 4项初始技能评分（40-75分）
3. 2-3个基础能力标签

返回JSON：
- persona: 完整人格描述（中文，用换行分隔各部分）
- initial_skills: 数组, 4项, 每项 {name: 技能名称(中文), score: 分数(40-75的整数)}
- capabilities: 数组, 2-3个基础能力(中文)`;

export const EMPLOYEE_CREATION_SCHEMA = {
  type: 'object',
  properties: {
    persona: { type: 'string' },
    initial_skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          score: { type: 'number' },
        },
      },
    },
    capabilities: { type: 'array', items: { type: 'string' } },
  },
};

export const EMPLOYEE_TRAINING_PROMPT = (name, role, skills, industries, knowledgeSources = []) =>
  `您是AI员工训练引擎。对以下AI员工进行项目经验训练。

AI员工：${name}
角色：${role}
当前技能：${skills.map((s) => `${s.name}(${s.score}%)`).join('、')}
行业经验：${industries.join('、')}
已订阅知识库：${knowledgeSources.length > 0 ? knowledgeSources.join('、') : '无'}

训练项目：SAP迁移项目（模拟案例）

训练时请自动引入该员工已订阅的知识库内容（${knowledgeSources.length > 0 ? knowledgeSources.join('、') : '无订阅知识'}），结合这些知识进行训练，使训练结果与订阅知识深度关联。

请生成训练结果：
1. 提取2-3条项目经验（结合订阅知识）
2. 评估技能提升（每项提升5-15分，不超过95）
3. 新解锁1-2个能力（基于订阅知识的应用）

返回JSON：
- experiences: 数组, 每项 {category, title, content}
- skill_updates: 数组, 每项 {name: 技能名称(中文), before: 训练前分数, after: 训练后分数}
- new_capabilities: 数组, 1-2个新能力(中文)
- knowledge_added: number (新增知识文档数, 10-20)`;

export const EMPLOYEE_TRAINING_SCHEMA = {
  type: 'object',
  properties: {
    experiences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
        },
      },
    },
    skill_updates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          before: { type: 'number' },
          after: { type: 'number' },
        },
      },
    },
    new_capabilities: { type: 'array', items: { type: 'string' } },
    knowledge_added: { type: 'number' },
  },
};