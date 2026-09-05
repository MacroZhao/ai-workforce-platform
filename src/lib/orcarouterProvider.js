// Lightweight OrcaRouter provider for browser usage (dev/demo).
// Default model: "orcarouter/auto"
// Usage: import { generate, openReferral } from '@/lib/orcarouterProvider'

const BASE_URL = 'https://api.orcarouter.ai/v1' // 根据 OrcaRouter 官方文档调整（示例）
const REFERRAL_URL = 'https://www.orcarouter.ai/ref/ref_4fa1c66b79aa32c0d4ea'

function getApiKey() {
  return import.meta.env.VITE_ORCAROUTER_API_KEY || null
}

/**
 * generate(prompt, options)
 * - prompt: string
 * - options: object, optional (max_tokens, temperature, model, etc.)
 *
 * Default model is "orcarouter/auto" unless options.model 指定了其它值.
 *
 * 注意：OrcaRouter 的真实请求字段名/路径可能与此示例不同，请根据官方文档调整 payload 形状与端点。
 */
export async function generate(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('VITE_ORCAROUTER_API_KEY 未设置（参见 README）')
  }

  const payload = {
    model: options.model || 'orcarouter/auto',
    input: prompt,
    ...options // 允许覆盖或传入额外参数
  }

  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OrcaRouter API error: ${res.status} ${text}`)
  }

  return res.json()
}

export function openReferral() {
  window.open(REFERRAL_URL, '_blank', 'noopener,noreferrer')
}
