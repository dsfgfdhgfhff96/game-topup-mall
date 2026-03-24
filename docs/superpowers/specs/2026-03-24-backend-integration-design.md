# 极速卡 - 后端集成与核心功能 设计规格文档

**日期**：2026-03-24
**基于**：[前端设计文档](./2026-03-23-game-card-mall-design.md)
**目标**：在现有前端基础上，对接 Supabase 后端，实现真实的用户系统、订单系统、自动发卡密和支付宝沙箱支付

---

## 1. 项目概览

### 1.1 目标

将极速卡从纯前端 mock 系统升级为具备真实后端能力的商城，核心要求：
- **用户看不出是 demo 网站**，所有交互流程真实完整
- **最小化外部配置**，仅需配置支付宝沙箱
- **充分利用已部署的 Supabase 服务**，避免重复建设

### 1.2 核心功能清单

| 功能 | 描述 |
|------|------|
| 注册/登录 | Supabase Auth，邮箱+密码，免邮箱验证 |
| 实名认证 | 仿真UI，姓名+身份证格式校验，存 user_metadata |
| 下单 | 创建订单 → 跳转支付 → 支付回调 → 自动发卡密 |
| 支付 | 支付宝沙箱，当面付/电脑网站支付 |
| 自动发卡密 | 支付成功后数据库触发器自动分配卡密 |
| 订单列表 | 用户查看自己的历史订单和卡密信息 |
| 退款申请 | 用户提交退款原因，管理员在 Studio 审批 |

### 1.3 技术架构

```
┌─────────────────────────────────────────────────┐
│                    前端 (Next.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 用户页面  │ │ 订单页面  │ │ 结账/支付页面     │ │
│  └────┬─────┘ └────┬─────┘ └───────┬──────────┘ │
│       │            │               │             │
│  ┌────┴────────────┴───────────────┴──────────┐  │
│  │         Supabase Client (supabase-js)       │  │
│  └────────────────────┬───────────────────────┘  │
│                       │                          │
│  ┌────────────────────┴───────────────────────┐  │
│  │         Next.js API Routes                  │  │
│  │   /api/checkout  → 创建支付宝订单           │  │
│  │   /api/alipay/notify → 支付回调             │  │
│  │   /api/alipay/return → 支付跳转返回         │  │
│  └────────────────────┬───────────────────────┘  │
└───────────────────────│──────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │    Supabase (52.195.10.215)│
          │  ┌───────────────────────┐ │
          │  │ Auth (GoTrue)         │ │
          │  │ 邮箱+密码, 免验证     │ │
          │  ├───────────────────────┤ │
          │  │ PostgreSQL            │ │
          │  │ orders / order_items  │ │
          │  │ card_codes            │ │
          │  │ + RLS + 触发器        │ │
          │  ├───────────────────────┤ │
          │  │ PostgREST (REST API)  │ │
          │  │ 自动生成 CRUD 接口    │ │
          │  └───────────────────────┘ │
          └───────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │   支付宝沙箱 (外部服务)     │
          │   当面付 / 电脑网站支付     │
          └───────────────────────────┘
```

### 1.4 不变的部分

- 商品数据：保持前端 mock（`src/data/` 目录）
- 商品展示页面：保持现有实现
- 购物车：保持 localStorage 方案
- UI 组件库：保持现有组件

---

## 2. 数据库设计

### 2.1 表结构

#### `orders` — 订单主表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default gen_random_uuid() | 主键 |
| order_no | text | UNIQUE, NOT NULL | 业务订单号，如 SC20260324001 |
| user_id | uuid | NOT NULL, FK → auth.users(id) | 下单用户 |
| status | text | NOT NULL, default 'pending_payment' | 订单状态 |
| total_price | numeric(10,2) | NOT NULL | 订单总金额 |
| pay_method | text | default 'alipay' | 支付方式 |
| game_account | text | NOT NULL | 充值游戏账号 |
| alipay_trade_no | text | | 支付宝交易号 |
| refund_reason | text | | 退款原因（用户填写） |
| paid_at | timestamptz | | 支付时间 |
| created_at | timestamptz | default now() | 创建时间 |
| updated_at | timestamptz | default now() | 更新时间 |

**status 枚举值：**
- `pending_payment` — 待支付
- `paid` — 已支付（待发货）
- `completed` — 已完成（已发卡密）
- `refund_requested` — 退款申请中
- `refunded` — 已退款
- `cancelled` — 已取消（超时未支付）

#### `order_items` — 订单明细

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default gen_random_uuid() | 主键 |
| order_id | uuid | NOT NULL, FK → orders(id) ON DELETE CASCADE | 所属订单 |
| product_id | text | NOT NULL | 商品ID（对应 mock 数据） |
| product_name | text | NOT NULL | 商品名称（冗余存储） |
| game_name | text | NOT NULL | 游戏名称 |
| spec_id | text | NOT NULL | 规格ID |
| spec_label | text | NOT NULL | 规格描述，如 "648元宝" |
| price | numeric(10,2) | NOT NULL | 单价 |
| quantity | integer | NOT NULL, default 1 | 数量 |
| card_code | text | | 卡密内容（发货后填入） |

#### `card_codes` — 卡密库

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default gen_random_uuid() | 主键 |
| product_id | text | NOT NULL | 对应商品ID |
| spec_id | text | NOT NULL | 对应规格ID |
| code | text | NOT NULL | 卡密内容 |
| status | text | NOT NULL, default 'available' | available / sold |
| order_item_id | uuid | FK → order_items(id) | 售出后关联 |
| created_at | timestamptz | default now() | 创建时间 |

### 2.2 数据库函数

#### `generate_order_no()` — 生成订单号

```sql
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS text AS $$
DECLARE
  seq_val integer;
BEGIN
  -- 基于日期 + 自增序列
  seq_val := nextval('order_no_seq');
  RETURN 'SC' || to_char(now(), 'YYYYMMDD') || lpad(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

#### `assign_card_codes()` — 自动发卡密触发器函数

```sql
CREATE OR REPLACE FUNCTION assign_card_codes()
RETURNS trigger AS $$
BEGIN
  -- 当订单状态从其他状态变为 'paid' 时触发
  IF NEW.status = 'paid' AND OLD.status = 'pending_payment' THEN
    -- 为每个 order_item 分配卡密
    UPDATE order_items oi SET
      card_code = cc.code
    FROM (
      SELECT DISTINCT ON (oi2.id) oi2.id AS item_id, cc2.id AS code_id, cc2.code
      FROM order_items oi2
      JOIN card_codes cc2 ON cc2.product_id = oi2.product_id
        AND cc2.spec_id = oi2.spec_id
        AND cc2.status = 'available'
      WHERE oi2.order_id = NEW.id
      ORDER BY oi2.id, cc2.created_at
      FOR UPDATE OF cc2 SKIP LOCKED
    ) cc
    WHERE oi.id = cc.item_id;

    -- 标记卡密为已售
    UPDATE card_codes SET
      status = 'sold',
      order_item_id = oi.id
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.card_code = card_codes.code
      AND card_codes.status = 'available';

    -- 更新订单状态为已完成
    NEW.status := 'completed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_assign_card_codes
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_card_codes();
```

### 2.3 RLS 策略

```sql
-- orders: 用户只能查看/创建自己的订单
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户查看自己的订单" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户创建订单" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户申请退款" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('completed')
    AND refund_reason IS NOT NULL
  );

-- order_items: 跟随订单权限
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户查看自己的订单明细" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "用户创建订单明细" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- card_codes: 用户不可直接访问（通过 order_items.card_code 间接获取）
ALTER TABLE card_codes ENABLE ROW LEVEL SECURITY;
-- 不创建任何用户策略，仅服务端/触发器可操作
```

### 2.4 索引

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_card_codes_available ON card_codes(product_id, spec_id) WHERE status = 'available';
```

---

## 3. 用户系统

### 3.1 注册流程

```
用户输入邮箱+密码 → Supabase Auth signUp → 自动确认（免邮箱验证）→ 注册成功 → 自动登录
```

- 密码要求：最少 6 位
- 注册时可填写昵称，存入 `user_metadata.nickname`
- 默认头像由前端根据昵称首字生成

### 3.2 登录流程

```
用户输入邮箱+密码 → Supabase Auth signInWithPassword → 返回 session → 前端存储 → 跳转
```

- 登录失败显示友好错误信息（邮箱不存在 / 密码错误）
- 登录状态通过 Supabase `onAuthStateChange` 监听，自动恢复

### 3.3 实名认证

```
用户进入个人中心 → 点击"实名认证" → 填写姓名+身份证号
→ 前端格式校验（18位身份证规则）→ 显示 loading "验证中..."（1.5秒延迟）
→ 写入 user_metadata → 显示"认证成功"
```

**user_metadata 结构：**
```json
{
  "nickname": "玩家001",
  "real_name": "张**",
  "id_card_last4": "1234",
  "is_verified": true,
  "verified_at": "2026-03-24T10:00:00Z"
}
```

- 身份证号不完整存储，仅存后4位（安全考虑）
- 姓名脱敏显示（张**）
- 认证后不可修改（前端锁定）
- **下单前必须完成实名认证**

### 3.4 前端 Auth 改造

替换现有 `AuthContext`：
- 移除 localStorage 模拟登录逻辑
- 接入 Supabase Auth SDK
- `onAuthStateChange` 监听登录状态
- session 自动刷新

---

## 4. 订单系统

### 4.1 下单流程

```
购物车 → 点击"去结算"
→ 检查登录状态（未登录跳转登录页）
→ 检查实名认证（未认证弹窗引导）
→ 结账页面：填写游戏账号、确认商品、选择支付方式
→ 点击"立即支付"
→ 前端调用 POST /api/checkout
→ API Route 用 service_role 创建 orders + order_items
→ API Route 调用支付宝 SDK 创建交易
→ 返回支付宝支付页面 URL
→ 前端跳转支付宝收银台
```

### 4.2 支付流程（支付宝沙箱）

```
┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 前端  │───→│ /api/    │───→│ 支付宝    │───→│ 用户在    │
│      │    │ checkout │    │ 沙箱API   │    │ 沙箱页面  │
│      │    │          │    │ 创建交易   │    │ 完成支付  │
└──────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                  │
                    ┌─────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│              支付宝异步通知                             │
│  POST /api/alipay/notify                             │
│  1. 验签                                              │
│  2. 核对订单号和金额                                    │
│  3. UPDATE orders SET status='paid' (触发自动发卡密)    │
│  4. 返回 "success"                                    │
└──────────────────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────────────────┐
│              支付宝同步跳转                             │
│  GET /api/alipay/return                              │
│  → 重定向到 /order/[orderId]?pay=success             │
│  → 前端显示支付成功页面                                │
└──────────────────────────────────────────────────────┘
```

### 4.3 支付宝沙箱配置

需要用户提供：
- `ALIPAY_APP_ID` — 沙箱应用 AppID
- `ALIPAY_PRIVATE_KEY` — 应用私钥
- `ALIPAY_PUBLIC_KEY` — 支付宝公钥

环境变量：
```env
ALIPAY_APP_ID=沙箱AppID
ALIPAY_PRIVATE_KEY=应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=http://47.109.189.34/api/alipay/notify
ALIPAY_RETURN_URL=http://47.109.189.34/api/alipay/return
```

使用 `alipay-sdk` npm 包对接。

### 4.4 自动发卡密

支付成功 → 支付回调更新订单状态为 `paid` → 数据库触发器自动：
1. 从 `card_codes` 表找到匹配的可用卡密
2. 将卡密写入 `order_items.card_code`
3. 标记 `card_codes.status = 'sold'`
4. 将订单状态更新为 `completed`

**卡密库存不足时：** 订单停留在 `paid` 状态，管理员在 Studio 手动处理。

### 4.5 订单超时取消

使用 PostgreSQL 定时函数（pg_cron 或应用层轮询）：
- 超过 30 分钟未支付的订单自动标记为 `cancelled`
- 暂用简单方案：前端查询时过滤，不做后端定时任务

---

## 5. 订单列表与详情

### 5.1 订单列表页

路由：`/user/orders` 或在 `/user` 页面内展示

**展示信息：**
- 订单号、下单时间
- 商品名称、规格、数量
- 订单金额
- 订单状态（彩色标签）
- 操作按钮（查看详情 / 申请退款 / 取消订单）

**排序：** 按创建时间倒序

**筛选：** 按状态筛选（全部 / 待支付 / 已完成 / 退款中）

### 5.2 订单详情页

路由：`/order/[id]`

**展示信息：**
- 订单基本信息（订单号、时间、状态、支付方式）
- 充值账号
- 商品明细（名称、规格、单价、数量）
- **卡密信息**（已完成的订单显示，可复制）
- 支付信息（支付宝交易号）
- 退款信息（如有）

### 5.3 退款申请

- 仅 `completed` 状态的订单可申请退款
- 用户填写退款原因
- 提交后订单状态变为 `refund_requested`
- 管理员在 Supabase Studio 中审批（改状态为 `refunded` 或回退为 `completed`）

---

## 6. 页面改造清单

### 6.1 新增页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 订单详情 | `/order/[id]` | 展示订单信息和卡密 |
| 支付成功 | `/order/[id]?pay=success` | 支付跳转后的成功页面 |

### 6.2 改造页面

| 页面 | 改造内容 |
|------|---------|
| `/user` | 替换 mock 登录为 Supabase Auth；新增实名认证模块；订单列表改为从 Supabase 读取 |
| `/checkout` | 新增实名认证检查；对接真实支付宝沙箱；调用 API Route 创建订单 |
| Layout | AuthContext 改为 Supabase Auth；Header 用户状态从 Supabase 读取 |

### 6.3 新增 API Routes

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/checkout` | POST | 创建订单 + 发起支付宝交易 |
| `/api/alipay/notify` | POST | 支付宝异步回调（验签+更新订单） |
| `/api/alipay/return` | GET | 支付宝同步跳转（重定向到订单页） |

### 6.4 新增依赖

```json
{
  "@supabase/supabase-js": "^2",
  "alipay-sdk": "^3"
}
```

---

## 7. Supabase 配置变更

### 7.1 Auth 配置

在 Supabase Docker `.env` 中设置：
```env
GOTRUE_MAILER_AUTOCONFIRM=true
```

重启 GoTrue 服务使配置生效。

### 7.2 卡密预置数据

通过 Supabase Studio 或 SQL 批量插入卡密：

```sql
-- 示例：为王者荣耀 648元宝 预置卡密
INSERT INTO card_codes (product_id, spec_id, code) VALUES
('wangzhe-yuanbao', 'spec-648', 'WZRY-648-A001-XXXX-YYYY'),
('wangzhe-yuanbao', 'spec-648', 'WZRY-648-A002-XXXX-YYYY'),
-- ... 更多卡密
;
```

每个商品规格建议预置 10-20 个卡密，确保演示时不会库存不足。

---

## 8. 安全设计

### 8.1 前端安全

- 支付宝密钥仅在 API Route（服务端）使用，不暴露给前端
- 使用 Supabase `anon_key` 访问数据库，RLS 控制权限
- 身份证号不完整存储

### 8.2 后端安全

- 支付回调必须验签，防止伪造
- 订单创建时校验金额与商品 mock 数据一致
- RLS 确保用户只能操作自己的数据
- `card_codes` 表用户不可直接访问

### 8.3 支付安全

- 异步通知（notify）为准，同步跳转（return）仅用于 UI 展示
- 回调中核对 `out_trade_no`（订单号）和 `total_amount`（金额）
- 防止重复回调：检查订单当前状态

---

## 9. 文件结构变更

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # 浏览器端 Supabase 客户端
│   │   └── server.ts          # 服务端 Supabase 客户端（service_role）
│   └── alipay.ts              # 支付宝 SDK 初始化
├── contexts/
│   └── AuthContext.tsx         # 改造：接入 Supabase Auth
├── app/
│   ├── api/
│   │   ├── checkout/route.ts   # 创建订单+发起支付
│   │   └── alipay/
│   │       ├── notify/route.ts # 支付宝异步回调
│   │       └── return/route.ts # 支付宝同步跳转
│   ├── order/
│   │   └── [id]/page.tsx       # 订单详情页
│   ├── user/page.tsx           # 改造：实名认证+真实订单
│   └── checkout/page.tsx       # 改造：对接真实支付
└── types/index.ts              # 新增订单相关类型
```

---

## 10. 用户体验要求

### 10.1 真实感设计

- 支付页面跳转要有 loading 过渡（"正在跳转支付宝..."）
- 实名认证要有"验证中"的 loading 动画（1.5秒模拟延迟）
- 订单状态变更用颜色标签区分（待支付-黄色、已完成-绿色、退款中-红色）
- 卡密信息带一键复制按钮
- 支付成功页面显示订单号、金额、卡密（如已发放）

### 10.2 错误处理

- 网络错误：友好提示 + 重试按钮
- 支付超时：引导用户查看订单状态
- 卡密不足：显示"订单处理中，请稍候"（不暴露库存问题）
- 登录过期：自动跳转登录页

---

## 11. 外部配置清单

| 配置项 | 由谁提供 | 说明 |
|--------|---------|------|
| Supabase URL / Key | 已有 | CLAUDE.md 中已记录 |
| 支付宝沙箱 AppID | 用户 | 注册支付宝开放平台获取 |
| 支付宝应用私钥 | 用户 | 沙箱环境生成 |
| 支付宝公钥 | 用户 | 沙箱环境获取 |
| GOTRUE_MAILER_AUTOCONFIRM | 部署配置 | 设为 true，SSH 到服务器修改 |
