# 极速卡 - 游戏充值点卡商城 设计规格文档

**日期**：2026-03-23
**项目名称**：极速卡 (SpeedCard)
**定位**：游戏充值点卡销售展示平台，纯前端静态数据，看起来真实的商业网站

---

## 1. 项目概览

### 1.1 目标
构建一个外观专业、数据真实感强的游戏充值点卡商城网站，部署到 Linux 服务器（47.109.189.34），通过 http://47.109.189.34 访问。

### 1.2 技术栈
- **框架**：Next.js 14（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **状态**：React useState / useContext（无外部状态库）
- **认证**：localStorage 模拟（任意账号密码可登录）
- **数据**：TypeScript 静态数据文件（无数据库、无 API）
- **部署**：PM2 + Nginx 反向代理，Node.js 运行时

### 1.3 部署环境
- 跳板机：52.199.230.238（Windows，Administrator）
- 目标服务器：47.109.189.34（Ubuntu 22.04，root）
- 访问地址：http://47.109.189.34
- 进程管理：PM2
- Web 服务：Nginx（80 端口反代 3000 端口）

---

## 2. 视觉设计规范

### 2.1 配色方案（深色游戏主题）
```
背景色：
  主背景：#0a0a0f
  卡片背景：#111118
  次级背景：#1a1a24

主色调：
  紫色主色：#6c5ce7
  渐变终点：#00cec9（青色）
  主色渐变：linear-gradient(135deg, #6c5ce7, #00cec9)

高亮色：
  粉红强调：#fd79a8
  金黄强调：#fdcb6e
  成功绿：#00b894
  危险红：#d63031

文字色：
  主文字：#ffffff
  次要文字：#a0a0b0
  辅助文字：#606070

边框色：
  默认边框：#2a2a35
  高亮边框：#6c5ce7
```

### 2.2 字体
- 主字体：系统默认（-apple-system, BlinkMacSystemFont, 'Segoe UI'）
- 数字/价格：等宽字体效果（font-variant-numeric: tabular-nums）

### 2.3 特效
- 卡片 hover：轻微上浮 + 边框发光（box-shadow: 0 0 20px rgba(108,92,231,0.4)）
- 按钮：渐变背景 + hover 亮度提升
- 价格：金黄色渐变文字
- 热门标签：粉红色胶囊标签

---

## 3. 页面结构

### 3.1 路由映射
```
/                    首页
/products            商品列表页
/products/[id]       商品详情页
/cart                购物车页
/checkout            结账页
/user                用户中心（登录/注册/个人信息/订单）
/help                帮助中心
```

### 3.2 公共组件
- **Header**：Logo（极速卡）+ 导航链接 + 搜索框 + 购物车图标（含数量徽标）+ 用户头像/登录按钮
- **Footer**：快速链接 + 联系信息 + ICP备案号 + 版权

### 3.3 首页（/）
布局结构：
1. **Banner 轮播**（3张）：王者荣耀充值活动 / Steam 夏日特卖 / 原神新版本礼包
2. **游戏分类入口**（10个图标）：王者荣耀、原神、和平精英、英雄联盟、Steam、PUBG、Minecraft、Roblox、天涯明月刀、剑网三
   （首页展示热门前8个，商品列表筛选栏展示全部10个）
3. **限时特惠区**：倒计时 + 4个折扣商品
4. **热门商品**：12个商品卡片网格
5. **新品上架**：横向滚动卡片
6. **用户评价**：3条轮播评价

### 3.4 商品列表页（/products）
- 左侧筛选栏：游戏分类、价格区间、评分筛选
- 顶部：搜索框 + 排序（销量/价格升降/评分）
- 主区域：商品卡片网格（响应式 2-4列）
- 分页：每页 20 个

### 3.5 商品详情页（/products/[id]）
- 左：商品大图（游戏截图风格）
- 右：商品名、评分、销量、价格
- 规格选择：面值选择按钮（如 6元宝 / 98元宝 / 328元宝 / 648元宝）
- 购买数量 + 加入购物车 / 立即购买
- 购买须知（可折叠）
- 用户评论（5条，带头像、评分、内容）

### 3.6 购物车页（/cart）
- 商品列表（图片 + 名称 + 规格 + 单价）
- 数量调整（+ / - 按钮）
- 删除按钮
- 右侧汇总：总价 + 去结算按钮

### 3.7 结账页（/checkout）
- 填写游戏账号
- 支付方式选择：支付宝 / 微信支付 / 银行卡
- 订单确认摘要
- 提交订单按钮（显示模拟成功弹窗）

### 3.8 用户中心（/user）
- 未登录：登录/注册表单（localStorage 模拟，任意账号密码）
- 已登录：
  - 用户信息（头像、昵称、账户余额）
  - 订单历史列表（静态模拟数据）
  - 退出登录

### 3.9 帮助中心（/help）
- FAQ 折叠面板（10条常见问题）
- 联系客服（QQ、微信、邮箱）
- 客服时间：周一至周日 9:00-22:00

---

## 4. 数据设计

### 4.1 数据文件结构
```
src/data/
  products.ts    # 商品数据（60+ 条）
  categories.ts  # 游戏分类
  reviews.ts     # 用户评论
  banners.ts     # Banner 数据
  orders.ts      # 模拟订单历史
```

### 4.2 商品数据结构
```typescript
interface Product {
  id: string
  gameId: string           // 游戏标识
  gameName: string         // 游戏名称
  name: string             // 商品名称
  description: string      // 描述
  image: string            // 图片URL（使用游戏官方封面风格占位）
  specs: ProductSpec[]     // 规格列表（面值）
  defaultPrice: number     // 展示价格
  originalPrice: number    // 划线原价
  sales: number            // 销量（1000-50000）
  rating: number           // 评分（4.5-5.0）
  reviewCount: number      // 评论数
  stock: string            // '充足' 或具体数字
  tags: string[]           // 标签（'热门'/'限时'/'新品'）
  category: string         // 分类
}

interface ProductSpec {
  id: string
  label: string            // 如 '6元宝'
  price: number            // 实际价格
  originalPrice: number    // 原价
}
```

### 4.3 游戏分类与商品数量
| 游戏 | 商品数 | 代表商品 |
|------|--------|---------|
| 王者荣耀 | 8 | 点券充值（6/98/328/648元） |
| 原神 | 8 | 创世结晶（60/300/980/1980） |
| 和平精英 | 6 | UC 充值 |
| 英雄联盟 | 6 | RP 点数 |
| Steam | 8 | Steam 钱包码（50/100/200/500元） |
| PUBG | 4 | G币充值 |
| Minecraft | 4 | 正版账号/DLC |
| Roblox | 4 | Robux 充值 |
| 天涯明月刀 | 4 | 元宝充值 |
| 剑网三 | 4 | 剑灵石充值 |

---

## 5. 项目目录结构

```
mall/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局（Header + Footer）
│   │   ├── page.tsx             # 首页
│   │   ├── products/
│   │   │   ├── page.tsx         # 商品列表
│   │   │   └── [id]/page.tsx    # 商品详情
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── user/page.tsx
│   │   └── help/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── BannerSlider.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── FlashSale.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ReviewSlider.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── SortBar.tsx
│   │   ├── cart/
│   │   │   └── CartItem.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── StarRating.tsx
│   ├── data/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── reviews.ts
│   │   ├── banners.ts
│   │   └── orders.ts
│   ├── hooks/
│   │   ├── useCart.ts           # 购物车 hook（localStorage）
│   │   └── useAuth.ts           # 认证 hook（localStorage）
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   └── lib/
│       └── utils.ts             # 工具函数
├── public/
│   └── images/                  # 静态图片
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 6. 关键实现细节

### 6.1 购物车（localStorage 持久化）
```typescript
// useCart hook 管理购物车状态，数据存入 localStorage
// 跨页面共享：通过 React Context 传递
```

### 6.2 认证模拟
```typescript
// useAuth hook：任意用户名+密码组合均可登录
// 登录状态存入 localStorage（key: 'speedcard_user'）
// 登出时清除 localStorage
```

### 6.3 图片处理
- 使用 CSS 渐变 + 游戏 Logo 文字代替真实图片（避免版权问题）
- 每个游戏分配一个特征颜色渐变背景（纯 CSS，无需 img 标签）
- `image` 字段仅作为备用，实际渲染使用 `gameId` 对应的渐变色
- `next.config.js` 中 `images.unoptimized: true`，避免外部域名白名单问题

### 6.4 CartItem 数据结构
```typescript
interface CartItem {
  productId: string
  specId: string
  quantity: number
  // 冗余展示字段
  productName: string
  gameName: string
  specLabel: string
  price: number
  gameId: string  // 用于渲染渐变色
}
// 同一商品的不同规格视为不同购物车条目（specId 不同则独立存储）
```

### 6.5 响应式断点
- Mobile：< 768px（单列布局，底部导航栏）
- Tablet：768px-1024px（双列）
- Desktop：> 1024px（4列商品网格）

---

## 7. 页脚信息

```
版权：© 2026 极速卡 版权所有
ICP备案：粤ICP备2024183726号
联系邮箱：support@speedcard.cn
客服时间：周一至周日 9:00-22:00
地址：广东省深圳市南山区科技园
```

---

## 8. 部署流程

### 8.1 前置条件（目标服务器）
```bash
# 检查并安装 Node.js 18+
node -v || (curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs)
# 检查并安装 PM2
pm2 -v || npm install -g pm2
# 检查并安装 Nginx
nginx -v || apt-get install -y nginx
# 创建部署目录
mkdir -p /opt/mall
```

### 8.2 next.config.js 关键配置
```js
// 启用 standalone 模式，避免服务器端 npm install
const nextConfig = {
  output: 'standalone',
}
```

### 8.3 部署步骤
```bash
# 1. 本地构建（使用 standalone 模式）
npm run build

# 2. 打包 standalone 产物（包含所有依赖）
tar -czf dist.tar.gz .next/standalone .next/static public

# 3. 上传跳板机
scp dist.tar.gz Administrator@52.199.230.238:/tmp/

# 4. 转发到目标服务器
ssh Administrator@52.199.230.238 'scp /tmp/dist.tar.gz root@47.109.189.34:/opt/mall/'

# 5. 服务器解压并启动（standalone 无需 npm install）
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "cd /opt/mall && tar -xzf dist.tar.gz && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && cd .next/standalone && pm2 restart mall || pm2 start node --name mall -- server.js"'

# 6. Nginx 配置
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "cat > /etc/nginx/sites-available/mall << EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/mall /etc/nginx/sites-enabled/mall
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx"'

# 7. PM2 开机自启
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "pm2 save && pm2 startup systemd -u root --hp /root | tail -1 | bash"'
```

---

## 9. 验收标准

- [ ] http://47.109.189.34 可以正常访问首页
- [ ] 所有 6 个静态路由（/、/products、/cart、/checkout、/user、/help）正常
- [ ] 动态路由 /products/[id] 至少抽查 5 个商品详情页正常
- [ ] PC 端（1440px）和移动端（375px）布局正常
- [ ] 购物车功能正常（加入、删除、数量调整）
- [ ] 登录/登出功能正常（任意账号密码）
- [ ] 无任何 demo/示例/placeholder 文字
- [ ] 网站名称"极速卡"正确显示
- [ ] 页脚 ICP 备案信息正确显示
