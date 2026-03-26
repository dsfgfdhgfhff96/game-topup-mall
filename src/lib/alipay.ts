import { AlipaySdk } from 'alipay-sdk'
import { execSync } from 'child_process'

let alipaySdk: AlipaySdk | null = null

/**
 * 从 Vaultwarden (bw CLI) 读取密钥，如果环境变量未设置则回退到 bw
 */
function getSecret(envKey: string, bwEntry: string): string {
  const envValue = process.env[envKey]
  if (envValue) return envValue

  try {
    const value = execSync(`bw get password "${bwEntry}"`, {
      encoding: 'utf-8',
      timeout: 10000,
    }).trim()

    if (!value) {
      throw new Error(`Vaultwarden 条目 "${bwEntry}" 为空`)
    }

    return value
  } catch (err) {
    throw new Error(
      `无法获取 ${envKey}：环境变量未设置，且 Vaultwarden 读取失败（bw get password "${bwEntry}"）。` +
      `请确保 bw 已解锁（BW_SESSION 已设置）。原始错误: ${err}`
    )
  }
}

export function getAlipay(): AlipaySdk {
  if (alipaySdk) return alipaySdk

  const appId = getSecret('ALIPAY_APP_ID', 'appid')
  const privateKey = getSecret('ALIPAY_PRIVATE_KEY', 'private')
  const alipayPublicKey = getSecret('ALIPAY_PUBLIC_KEY', 'aliypay-public')

  alipaySdk = new AlipaySdk({
    appId,
    privateKey,
    alipayPublicKey,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  })

  return alipaySdk
}
