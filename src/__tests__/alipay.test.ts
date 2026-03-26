import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { execSync } from 'child_process'

// Mock alipay-sdk — 使用 class 以支持 new 调用
vi.mock('alipay-sdk', () => {
  const MockAlipaySdk = vi.fn(function (this: Record<string, unknown>, config: Record<string, unknown>) {
    this.appId = config.appId
    this._config = config
  })
  return { AlipaySdk: MockAlipaySdk }
})

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}))

const mockedExecSync = vi.mocked(execSync)

describe('alipay.ts - getAlipay', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    mockedExecSync.mockReset()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('应从环境变量读取密钥（优先）', async () => {
    process.env.ALIPAY_APP_ID = 'test-app-id'
    process.env.ALIPAY_PRIVATE_KEY = 'test-private-key'
    process.env.ALIPAY_PUBLIC_KEY = 'test-public-key'
    process.env.ALIPAY_GATEWAY = 'https://openapi.alipay.com/gateway.do'

    const { getAlipay } = await import('@/lib/alipay')
    const sdk = getAlipay()

    expect(sdk).toBeDefined()
    expect(mockedExecSync).not.toHaveBeenCalled()
  })

  it('环境变量为空时应回退到 Vaultwarden (bw CLI)', async () => {
    process.env.ALIPAY_APP_ID = ''
    process.env.ALIPAY_PRIVATE_KEY = ''
    process.env.ALIPAY_PUBLIC_KEY = ''

    mockedExecSync.mockImplementation((cmd: string) => {
      const cmdStr = String(cmd)
      if (cmdStr.includes('appid')) return 'bw-app-id\n'
      if (cmdStr.includes('private')) return 'bw-private-key\n'
      if (cmdStr.includes('aliypay-public')) return 'bw-public-key\n'
      return ''
    })

    const { getAlipay } = await import('@/lib/alipay')
    const sdk = getAlipay()

    expect(sdk).toBeDefined()
    expect(mockedExecSync).toHaveBeenCalledTimes(3)
    expect(mockedExecSync).toHaveBeenCalledWith(
      'bw get password "appid"',
      expect.objectContaining({ encoding: 'utf-8', timeout: 10000 }),
    )
    expect(mockedExecSync).toHaveBeenCalledWith(
      'bw get password "private"',
      expect.objectContaining({ encoding: 'utf-8' }),
    )
    expect(mockedExecSync).toHaveBeenCalledWith(
      'bw get password "aliypay-public"',
      expect.objectContaining({ encoding: 'utf-8' }),
    )
  })

  it('bw 返回空值时应抛出错误', async () => {
    process.env.ALIPAY_APP_ID = ''
    process.env.ALIPAY_PRIVATE_KEY = ''
    process.env.ALIPAY_PUBLIC_KEY = ''

    mockedExecSync.mockReturnValue('')

    const { getAlipay } = await import('@/lib/alipay')

    expect(() => getAlipay()).toThrow('Vaultwarden 条目 "appid" 为空')
  })

  it('bw CLI 不可用时应抛出明确错误', async () => {
    process.env.ALIPAY_APP_ID = ''
    process.env.ALIPAY_PRIVATE_KEY = ''
    process.env.ALIPAY_PUBLIC_KEY = ''

    mockedExecSync.mockImplementation(() => {
      throw new Error('command not found: bw')
    })

    const { getAlipay } = await import('@/lib/alipay')

    expect(() => getAlipay()).toThrow('无法获取 ALIPAY_APP_ID')
    expect(() => getAlipay()).toThrow('Vaultwarden 读取失败')
  })

  it('应使用单例模式（第二次调用不重新创建）', async () => {
    process.env.ALIPAY_APP_ID = 'test-app-id'
    process.env.ALIPAY_PRIVATE_KEY = 'test-private-key'
    process.env.ALIPAY_PUBLIC_KEY = 'test-public-key'

    const { getAlipay } = await import('@/lib/alipay')
    const sdk1 = getAlipay()
    const sdk2 = getAlipay()

    expect(sdk1).toBe(sdk2)
  })

  it('默认网关应为生产环境', async () => {
    process.env.ALIPAY_APP_ID = 'test-app-id'
    process.env.ALIPAY_PRIVATE_KEY = 'test-private-key'
    process.env.ALIPAY_PUBLIC_KEY = 'test-public-key'
    delete process.env.ALIPAY_GATEWAY

    const { AlipaySdk } = await import('alipay-sdk')
    const { getAlipay } = await import('@/lib/alipay')
    getAlipay()

    expect(AlipaySdk).toHaveBeenCalledWith(
      expect.objectContaining({
        gateway: 'https://openapi.alipay.com/gateway.do',
      }),
    )
  })
})
