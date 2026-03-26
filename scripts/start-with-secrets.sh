#!/bin/bash
# 极速卡商城 - 生产启动脚本（systemd 用）
# 从 Vaultwarden 读取支付宝密钥，注入环境变量后启动 Node.js
set -e

LOG_PREFIX="[mall-startup]"

# 1. 读取 BW_SESSION
if [ -f /root/.bw_session ]; then
  export BW_SESSION="$(cat /root/.bw_session)"
else
  echo "$LOG_PREFIX [错误] /root/.bw_session 文件不存在" >&2
  exit 1
fi

# 2. 检查 bw 状态
BW_STATUS=$(bw status 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$BW_STATUS" != "unlocked" ]; then
  echo "$LOG_PREFIX [错误] Vaultwarden 未解锁 (status=$BW_STATUS)" >&2
  echo "$LOG_PREFIX [提示] 请手动执行:" >&2
  echo "$LOG_PREFIX   export BW_SESSION=\$(bw unlock --raw)" >&2
  echo "$LOG_PREFIX   echo \$BW_SESSION > /root/.bw_session" >&2
  echo "$LOG_PREFIX   systemctl restart mall" >&2
  exit 1
fi

# 3. 读取支付宝密钥
echo "$LOG_PREFIX 从 Vaultwarden 读取支付宝配置..."
export ALIPAY_APP_ID=$(bw get password "appid")
export ALIPAY_PRIVATE_KEY=$(bw get password "private")
export ALIPAY_PUBLIC_KEY=$(bw get password "aliypay-public")

if [ -z "$ALIPAY_APP_ID" ] || [ -z "$ALIPAY_PRIVATE_KEY" ] || [ -z "$ALIPAY_PUBLIC_KEY" ]; then
  echo "$LOG_PREFIX [错误] 支付宝密钥读取失败" >&2
  exit 1
fi

echo "$LOG_PREFIX 支付宝配置已加载 (APPID: $ALIPAY_APP_ID)"

# 4. 加载 .env.local
if [ -f /opt/mall/.env.local ]; then
  set -a
  source /opt/mall/.env.local
  set +a
fi

# 5. 启动 Node.js（exec 替换当前进程，让 systemd 直接管理 node PID）
# standalone 模式：构建输出在 .next/standalone/，server.js 需要从该目录运行
echo "$LOG_PREFIX 启动 Next.js 服务..."
cd /opt/mall/.next/standalone
exec node -r /opt/mall/scripts/node18-polyfill.js server.js
