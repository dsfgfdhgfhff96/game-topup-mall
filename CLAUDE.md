# 极速卡 - 游戏充值商城

## Supabase 自托管配置

### 服务器信息
- 服务器 IP：13.159.177.126
- 系统：Ubuntu 24.04（AWS EC2）
- 部署方式：Docker Compose
- 配置目录：`/home/ubuntu/supabase-docker/docker/`
- SSH：`ssh ubuntu@13.159.177.126`

### 访问地址
| 服务 | URL |
|------|-----|
| Studio 管理面板 | http://13.159.177.126:3000 |
| API 网关（Kong） | http://13.159.177.126:8000 |
| REST API | http://13.159.177.126:8000/rest/v1/ |
| Auth API | http://13.159.177.126:8000/auth/v1/ |
| Realtime | ws://13.159.177.126:8000/realtime/v1/ |
| PostgreSQL | 13.159.177.126:5432 |

### Dashboard 登录
- 用户名：`supabase`
- 密码：`373a55f8e87bf4e73983f68ccb6f9138`

### 密钥配置
- **POSTGRES_PASSWORD**：`be49d5c2dd46f9ba850332b6e9c0fba9`
- **JWT_SECRET**：`om/LFvxHopkP+UWFsXYhCBBd9OLnSHiAj3xJa6g7`
- **ANON_KEY**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MjU1NDc2LCJleHAiOjE5MzE5MzU0NzZ9.peUKeMALmtNcdcfxwjvh1N2LN9knsH2tz3hA49Ab_wM`
- **SERVICE_ROLE_KEY**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzQyNTU0NzYsImV4cCI6MTkzMTkzNTQ3Nn0.ZOWEiyzIQaIqVUU6DAsSWYtTor4498vhMc_CJkySmkc`

### 前端对接配置
```env
NEXT_PUBLIC_SUPABASE_URL=http://13.159.177.126:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MjU1NDc2LCJleHAiOjE5MzE5MzU0NzZ9.peUKeMALmtNcdcfxwjvh1N2LN9knsH2tz3hA49Ab_wM
```

### 已部署的服务
- PostgreSQL（数据库）
- GoTrue（认证服务）
- PostgREST（REST API）
- Realtime（实时订阅）
- Studio（管理面板）
- Kong（API 网关）
- pg-meta（数据库元数据）
- Logflare（日志分析，Studio 依赖）

### 常用运维命令
```bash
# SSH 连接
ssh ubuntu@13.159.177.126

# 查看服务状态
cd /home/ubuntu/supabase-docker/docker && docker compose ps

# 重启所有服务
docker compose restart

# 查看日志
docker compose logs -f [服务名]

# 停止所有服务
docker compose down

# 启动所有服务
docker compose up -d
```

## SSH 连接规范

### 跳板机（必须通过跳板机访问所有服务器）
- IP：13.214.90.18
- 用户：work1
- 认证：密钥登录（已配置）

### 连接方式（优先级从高到低）

**方式1：通过 VPN 代理连接跳板机（优先）**
```bash
# Claude Code bash 环境
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18

# Windows PowerShell（需先加 PATH）
$env:PATH = "E:\Program Files\Git\mingw64\bin;" + $env:PATH
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18
```

**方式2：通过跳板机跳转到目标服务器**
```bash
# 跳转到前端服务器（47.109.189.34）
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" -J work1@13.214.90.18 root@47.109.189.34

# 跳转到 Supabase 服务器（13.159.177.126）
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" -J work1@13.214.90.18 ubuntu@13.159.177.126
```

### 服务器清单
| 服务器 | IP | 用户 | 用途 |
|--------|-----|------|------|
| 跳板机 | 13.214.90.18 | work1 | SSH 跳板，所有服务器访问入口 |
| 前端服务器 | 47.109.189.34 | root | 极速卡游戏充值商城前端 |
| Supabase 服务器 | 13.159.177.126 | ubuntu | 后端数据库与 API 服务 |

### 重要规则
- **禁止直连**：所有服务器 SSH 连接必须通过跳板机 13.214.90.18
- **VPN 代理**：本地端口 7897（SOCKS5），使用 `connect` 命令代理
- **认证方式**：统一使用密钥认证，禁止密码登录

## 前端部署

### 服务器信息
- 前端服务器：47.109.189.34（root）
- 内存：955MB（极小，**禁止在服务器上执行 npm install 或 next build**，会 OOM 导致服务器重启）
- 项目目录：`/opt/mall/`
- 运行目录：`/opt/mall/.next/standalone/`
- 进程管理：nohup 启动 node server.js（standalone 模式）
- 支付宝密钥：通过服务器 `.env.local` 配置（当前为沙箱环境，切换正式环境时需更新 `.env.local` 中的 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY、ALIPAY_PUBLIC_KEY 和 ALIPAY_GATEWAY）

### 部署流程（本地构建 + 上传产物）

**必须在本地构建后上传，严禁在服务器上构建。**

```bash
# 步骤1：本地构建 standalone 产物
cd D:/Github/Github/mall
npx next build

# 步骤2：打包产物（含 static 和 public）
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
tar czf /tmp/deploy.tar.gz -C .next/standalone .

# 步骤3：上传到跳板机（本地 -> 跳板机）
cat /tmp/deploy.tar.gz | ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "cat > /tmp/deploy.tar.gz"

# 步骤4：从跳板机传到前端服务器并部署（跳板机 -> 前端服务器）
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "scp /tmp/deploy.tar.gz root@47.109.189.34:/tmp/deploy.tar.gz"

# 步骤5：SSH 到前端服务器执行部署
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "ssh root@47.109.189.34 'bash -s'" <<'DEPLOY'
set -e
pkill -f next-server 2>/dev/null || true
sleep 2
cd /opt/mall
rm -rf .next/standalone
mkdir -p .next/standalone
tar xzf /tmp/deploy.tar.gz -C .next/standalone
cp .env.local .next/standalone/ 2>/dev/null || true

# Node 18 polyfill（alipay-sdk 需要全局 File 对象，Node 18 没有）
if ! grep -q "globalThis.File" .next/standalone/server.js; then
  sed -i '1i\if (typeof globalThis.File === "undefined") { const { Blob } = require("buffer"); globalThis.File = class File extends Blob { constructor(chunks, name, opts) { super(chunks, opts); this.name = name; this.lastModified = opts?.lastModified || Date.now(); } }; }' .next/standalone/server.js
fi

# 支付宝密钥由 .env.local 提供
# 当前为沙箱环境，切换正式环境时需更新服务器 /opt/mall/.env.local：
#   ALIPAY_APP_ID=正式应用ID
#   ALIPAY_PRIVATE_KEY=正式私钥
#   ALIPAY_PUBLIC_KEY=正式公钥
#   ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

cd .next/standalone
HOSTNAME=0.0.0.0 PORT=3000 nohup node server.js > /tmp/next.log 2>&1 &
disown
sleep 3
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/ && echo " DEPLOY_OK" || echo " DEPLOY_FAIL"
DEPLOY
```

### 新增依赖处理
服务器禁止 `npm install`。如需添加新的 npm 包：
1. 本地安装后 `npx next build`，standalone 产物会自动打包所需依赖
2. 如果是纯 JS 包也可手动打包上传：`tar czf /tmp/pkg.tar.gz -C node_modules <包名>` 然后传到服务器 node_modules

### 环境变量
服务器 `.env.local` 位于 `/opt/mall/.env.local`，部署时会自动拷贝到 standalone 目录。

### 部署后清理
部署完成后必须清理临时文件：
```bash
# 清理本地
rm -f /tmp/deploy.tar.gz /tmp/standalone.tar.gz /tmp/zod.tar.gz

# 清理跳板机
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "rm -f /tmp/deploy.tar.gz"

# 清理前端服务器
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "ssh root@47.109.189.34 'rm -f /tmp/deploy.tar.gz'"
```

### 数据库变更部署
数据库 SQL 通过 Supabase 服务器的 docker exec 执行：
```bash
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 \
  "ssh ubuntu@13.159.177.126 \"docker exec -i supabase-db psql -U postgres -d postgres\"" <<'SQL'
-- 在这里写 SQL
SQL
```

### 常用运维
```bash
# 通过跳板机连接前端服务器
ssh -o "ProxyCommand=connect -S 127.0.0.1:7897 %h %p" work1@13.214.90.18 "ssh root@47.109.189.34 '命令'"

# 查看日志
... 'tail -100 /tmp/next.log'

# 查看进程
... 'ps aux | grep next'

# 重启服务（不重新构建）
... 'bash /opt/mall/deploy-standalone.sh'
```
