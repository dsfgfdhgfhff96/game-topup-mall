import { AlipaySdk } from 'alipay-sdk'

let alipaySdk: AlipaySdk | null = null

export function getAlipay(): AlipaySdk {
  if (alipaySdk) return alipaySdk

  const appId = process.env.ALIPAY_APP_ID
  const privateKey = process.env.ALIPAY_PRIVATE_KEY
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY

  if (!appId || !privateKey || !alipayPublicKey) {
    throw new Error('支付宝配置缺失，请检查环境变量 ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY')
  }

  alipaySdk = new AlipaySdk({
    appId,
    privateKey,
    alipayPublicKey,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
  })

  return alipaySdk
}
