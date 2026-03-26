#!/bin/bash
# 生产环境启动脚本
# 从 Vaultwarden 读取支付宝密钥并注入环境变量后启动 Next.js

set -e

echo "=== 极速卡商城 - 生产启动 ==="

# 检查 bw CLI
if ! command -v bw &> /dev/null; then
  echo "[错误] bw CLI 未安装"
  exit 1
fi

# 检查 BW_SESSION
if [ -z "$BW_SESSION" ]; then
  echo "[警告] BW_SESSION 未设置，尝试从 ~/.bashrc 加载..."
  source ~/.bashrc 2>/dev/null || true

  if [ -z "$BW_SESSION" ]; then
    echo "[提示] 需要解锁 Vaultwarden，请输入主密码："
    BW_SESSION=$(bw unlock --raw)
    export BW_SESSION
  fi
fi

# 验证 bw 状态
BW_STATUS=$(bw status 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$BW_STATUS" = "locked" ]; then
  echo "[提示] Vaultwarden 已锁定，请输入主密码解锁："
  BW_SESSION=$(bw unlock --raw)
  export BW_SESSION
fi

echo "[1/4] 从 Vaultwarden 读取支付宝配置..."

export ALIPAY_APP_ID=$(bw get password "appid")
export ALIPAY_PRIVATE_KEY=$(bw get password "private")
export ALIPAY_PUBLIC_KEY=$(bw get password "aliypay-public")

# 验证密钥已读取
if [ -z "$ALIPAY_APP_ID" ] || [ -z "$ALIPAY_PRIVATE_KEY" ] || [ -z "$ALIPAY_PUBLIC_KEY" ]; then
  echo "[错误] 无法从 Vaultwarden 读取支付宝密钥"
  exit 1
fi

echo "[2/4] 支付宝配置已加载 (APPID: $ALIPAY_APP_ID)"
echo "[3/4] 构建应用..."

npm run build

echo "[4/4] 启动 Next.js 生产服务..."

exec npm run start
