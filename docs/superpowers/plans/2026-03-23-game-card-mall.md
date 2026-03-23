# 极速卡 - 游戏充值点卡商城 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个外观专业的游戏充值点卡商城网站"极速卡"，部署到 47.109.189.34 服务器。

**Architecture:** Next.js 14 App Router + TypeScript + Tailwind CSS 纯前端应用。静态数据文件提供商品信息，React Context + localStorage 管理购物车和用户登录状态。PM2 + Nginx 部署到 Ubuntu 服务器。

**与 Spec 的偏差说明：**
- hooks 层：Spec 定义了 `src/hooks/useCart.ts` 和 `useAuth.ts`，本计划将 hook 逻辑直接内置于 Context 文件中（导出自定义 hook `useCart()` 和 `useAuth()`），避免不必要的文件拆分。
- `ProductGrid.tsx`：Spec 定义单一文件，本计划拆分为 `HotProducts.tsx`（热门商品网格）和 `NewArrivals.tsx`（新品横向滚动），职责更清晰。
- `tailwind.config.ts`：Spec 写 `.js`，Next.js 14 TypeScript 项目默认生成 `.ts`，保持 `.ts`。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, PM2, Nginx

**Spec:** `docs/superpowers/specs/2026-03-23-game-card-mall-design.md`

---

## 文件结构

```
mall/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 首页
│   │   ├── globals.css             # 全局样式
│   │   ├── products/
│   │   │   ├── page.tsx            # 商品列表
│   │   │   └── [id]/page.tsx       # 商品详情
│   │   ├── cart/page.tsx           # 购物车
│   │   ├── checkout/page.tsx       # 结账
│   │   ├── user/page.tsx           # 用户中心
│   │   └── help/page.tsx           # 帮助中心
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 顶部导航
│   │   │   └── Footer.tsx          # 页脚
│   │   ├── home/
│   │   │   ├── BannerSlider.tsx    # Banner 轮播
│   │   │   ├── CategoryGrid.tsx    # 游戏分类入口
│   │   │   ├── FlashSale.tsx       # 限时特惠
│   │   │   ├── HotProducts.tsx     # 热门商品
│   │   │   ├── NewArrivals.tsx     # 新品上架
│   │   │   └── ReviewSlider.tsx    # 用户评价
│   │   ├── products/
│   │   │   ├── ProductCard.tsx     # 商品卡片
│   │   │   ├── FilterPanel.tsx     # 筛选面板
│   │   │   └── SortBar.tsx         # 排序栏
│   │   ├── cart/
│   │   │   └── CartItem.tsx        # 购物车条目
│   │   └── ui/
│   │       ├── Button.tsx          # 通用按钮
│   │       ├── Badge.tsx           # 徽标
│   │       ├── StarRating.tsx      # 星级评分
│   │       ├── Toast.tsx           # 消息提示
│   │       └── Modal.tsx           # 弹窗
│   ├── contexts/
│   │   ├── CartContext.tsx         # 购物车上下文
│   │   └── AuthContext.tsx         # 认证上下文
│   ├── data/
│   │   ├── categories.ts          # 游戏分类数据
│   │   ├── products.ts            # 商品数据（60+条）
│   │   ├── reviews.ts             # 用户评论数据
│   │   ├── banners.ts             # Banner 数据
│   │   └── orders.ts              # 模拟订单数据
│   ├── types/
│   │   └── index.ts               # 类型定义
│   └── lib/
│       └── utils.ts               # 工具函数
├── public/
│   └── favicon.ico
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: 项目脚手架与配置

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd D:/Github/Github/mall
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

- [ ] **Step 2: 配置 next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
```

- [ ] **Step 3: 配置 Tailwind 深色主题**

在 `tailwind.config.ts` 中扩展颜色：
```ts
// 添加自定义颜色
colors: {
  bg: { primary: '#0a0a0f', card: '#111118', secondary: '#1a1a24' },
  accent: { purple: '#6c5ce7', cyan: '#00cec9', pink: '#fd79a8', gold: '#fdcb6e', green: '#00b894', red: '#d63031' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  border: { default: '#2a2a35', highlight: '#6c5ce7' },
}
```

- [ ] **Step 4: 编写全局样式 globals.css**

深色背景、渐变效果、滚动条样式、动画关键帧。

- [ ] **Step 5: 编写根布局 layout.tsx**

包含全局 Providers（Auth + Cart Context）、Header、Footer、字体配置。

- [ ] **Step 6: 验证开发服务器启动**

```bash
npm run dev
```
访问 localhost:3000 确认空白深色页面正常渲染。

- [ ] **Step 7: 提交**

```bash
git init && git add -A && git commit -m "chore: 初始化Next.js项目与Tailwind深色主题配置"
```

---

## Task 2: 类型定义与静态数据

**Files:**
- Create: `src/types/index.ts`, `src/lib/utils.ts`, `src/data/categories.ts`, `src/data/products.ts`, `src/data/reviews.ts`, `src/data/banners.ts`, `src/data/orders.ts`

- [ ] **Step 1: 定义 TypeScript 类型**

`src/types/index.ts` — Product, ProductSpec, Category, Review, Banner, CartItem, Order, User 接口定义。

- [ ] **Step 2: 编写工具函数**

`src/lib/utils.ts` — 价格格式化 `formatPrice()`、评分格式化、生成订单号、类名合并 `cn()` 等。

- [ ] **Step 3: 编写游戏分类数据**

`src/data/categories.ts` — 10 个游戏分类，每个包含 id、name、icon（emoji）、color（渐变色）、description。

- [ ] **Step 4: 编写商品数据**

`src/data/products.ts` — 60+ 条商品，覆盖 10 款游戏。每条含完整的 specs（面值）、真实感价格、销量（1000-50000）、评分（4.5-5.0）。

商品数据示例：
- 王者荣耀：点券 6/98/328/648 元宝，价格分别为 0.6/9.5/31.8/64.8 元
- 原神：创世结晶 60/300/980/1980，价格分别为 6/30/98/198 元
- Steam：钱包码 50/100/200/500 元，价格分别为 48.5/97/194/485 元

- [ ] **Step 5: 编写评论数据**

`src/data/reviews.ts` — 30+ 条评论，绑定 productId，包含用户名、头像占位、评分、内容、日期。评论内容要真实自然。

- [ ] **Step 6: 编写 Banner 和订单数据**

`src/data/banners.ts` — 3 张 Banner（王者荣耀活动 / Steam 特卖 / 原神礼包）。
`src/data/orders.ts` — 5 条模拟历史订单。

- [ ] **Step 7: 提交**

```bash
git add src/types src/lib src/data && git commit -m "feat: 添加类型定义与全部静态数据文件"
```

---

## Task 3: Context Providers（购物车 + 认证）

**Files:**
- Create: `src/contexts/CartContext.tsx`, `src/contexts/AuthContext.tsx`
- Modify: `src/app/layout.tsx`（包裹 Providers）

- [ ] **Step 1: 实现 AuthContext**

`src/contexts/AuthContext.tsx`:
- `login(username, password)` — 任意账号密码均可登录，存入 localStorage（key: `speedcard_user`）
- `logout()` — 清除 localStorage
- `user` 状态、`isLoggedIn` 状态
- 初始化时从 localStorage 恢复登录状态

- [ ] **Step 2: 实现 CartContext**

`src/contexts/CartContext.tsx`:
- `addItem(item: CartItem)` — 同商品同规格则数量+1，否则新增条目
- `removeItem(productId, specId)` — 删除条目
- `updateQuantity(productId, specId, quantity)` — 更新数量
- `clearCart()` — 清空购物车
- `totalItems`、`totalPrice` 计算属性
- localStorage 持久化（key: `speedcard_cart`）

- [ ] **Step 3: 在 layout.tsx 中包裹 Providers**

```tsx
<AuthProvider>
  <CartProvider>
    <Header />
    {children}
    <Footer />
  </CartProvider>
</AuthProvider>
```

- [ ] **Step 4: 提交**

```bash
git add src/contexts src/app/layout.tsx && git commit -m "feat: 实现购物车与认证Context及localStorage持久化"
```

---

## Task 4: UI 基础组件

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/StarRating.tsx`, `src/components/ui/Toast.tsx`, `src/components/ui/Modal.tsx`

- [ ] **Step 1: 实现 Button 组件**

支持 variant（primary/secondary/danger/ghost）、size（sm/md/lg）、loading 状态、disabled 状态。主按钮使用紫-青渐变。

- [ ] **Step 2: 实现 Badge、StarRating 组件**

Badge：支持 variant（hot/new/sale）对应粉红/青色/金黄。
StarRating：根据 rating 数值渲染实心/半心/空心星星。

- [ ] **Step 3: 实现 Toast、Modal 组件**

Toast：固定在右上角，支持 success/error/info 类型，3秒自动消失。
Modal：居中弹窗，带遮罩层和关闭按钮。

- [ ] **Step 4: 提交**

```bash
git add src/components/ui && git commit -m "feat: 添加Button/Badge/StarRating/Toast/Modal基础UI组件"
```

---

## Task 5: Header + Footer 布局组件

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`

- [ ] **Step 1: 实现 Header**

- Logo "极速卡"（渐变文字）
- 导航链接：首页、全部商品、帮助中心
- 搜索框（输入后跳转到 /products?q=xxx）
- 购物车图标 + 数量徽标（从 CartContext 读取）
- 用户头像/登录按钮（从 AuthContext 读取）
- 移动端：汉堡菜单 + 抽屉导航

- [ ] **Step 2: 实现 Footer**

- 四列布局：关于我们 / 帮助中心 / 支付方式 / 联系我们
- ICP备案号：粤ICP备2024183726号
- 联系邮箱：support@speedcard.cn
- 客服时间：周一至周日 9:00-22:00
- 地址：广东省深圳市南山区科技园
- 版权：© 2026 极速卡 版权所有

- [ ] **Step 3: 验证布局**

启动 dev server，确认 Header 和 Footer 在所有页面正确显示，移动端响应式正常。

- [ ] **Step 4: 提交**

```bash
git add src/components/layout && git commit -m "feat: 实现Header导航与Footer页脚组件"
```

---

## Task 6: 首页

**Files:**
- Create: `src/components/home/BannerSlider.tsx`, `src/components/home/CategoryGrid.tsx`, `src/components/home/FlashSale.tsx`, `src/components/home/HotProducts.tsx`, `src/components/home/NewArrivals.tsx`, `src/components/home/ReviewSlider.tsx`, `src/components/products/ProductCard.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 实现 ProductCard 组件**

商品卡片：游戏渐变色背景（CSS 渐变替代图片）、游戏名标签、商品名、评分、销量、价格（金黄色）、划线原价。hover 上浮 + 边框发光。点击跳转详情页。

- [ ] **Step 2: 实现 BannerSlider**

3 张 Banner 自动轮播（5秒间隔），带指示点和左右箭头。纯 CSS 渐变背景 + 文字标题 + CTA 按钮。

- [ ] **Step 3: 实现 CategoryGrid**

8 个游戏分类图标网格（2行4列 PC / 2行4列 Mobile），每个分类用 emoji + 名称 + 对应颜色背景，点击跳转 `/products?game=xxx`。

- [ ] **Step 4: 实现 FlashSale**

倒计时组件（纯前端，每秒更新）+ 4 个折扣商品卡片。标题"限时特惠"+ 倒计时显示。

- [ ] **Step 5: 实现 HotProducts + NewArrivals**

HotProducts：12 个商品卡片网格（PC 4列，平板 3列，手机 2列）。
NewArrivals：横向滚动卡片列表，带左右滚动按钮。

- [ ] **Step 6: 实现 ReviewSlider**

3 条用户评价轮播，包含用户头像（首字母）、昵称、评分、评价内容。

- [ ] **Step 7: 组装首页 page.tsx**

将所有首页组件按顺序组装：Banner → 分类 → 限时特惠 → 热门商品 → 新品上架 → 用户评价。

- [ ] **Step 8: 验证首页**

浏览器检查 PC 和移动端布局，确认轮播动画、倒计时、hover 效果正常。

- [ ] **Step 9: 提交**

```bash
git add src/components/home src/components/products/ProductCard.tsx src/app/page.tsx && git commit -m "feat: 实现首页全部模块（Banner/分类/特惠/热门/新品/评价）"
```

---

## Task 7: 商品列表页

**Files:**
- Create: `src/components/products/FilterPanel.tsx`, `src/components/products/SortBar.tsx`
- Modify: `src/app/products/page.tsx`

- [ ] **Step 1: 实现 FilterPanel**

左侧筛选面板：
- 游戏分类复选框列表（10 个游戏）
- 价格区间选择（0-50 / 50-100 / 100-500 / 500+）
- 评分筛选（4.5+ / 4.7+ / 4.9+）
- 移动端：底部弹出式筛选面板

- [ ] **Step 2: 实现 SortBar**

排序按钮组：综合 / 销量优先 / 价格升序 / 价格降序 / 评分优先。当前选中高亮。

- [ ] **Step 3: 实现商品列表页**

`src/app/products/page.tsx`:
- 读取 URL query 参数（game、q、sort）
- 筛选 + 搜索 + 排序逻辑
- 商品网格（使用 ProductCard）
- 分页（每页 20 个）
- 空结果提示

- [ ] **Step 4: 验证**

测试各种筛选组合、搜索功能、排序切换、分页跳转。

- [ ] **Step 5: 提交**

```bash
git add src/components/products src/app/products/page.tsx && git commit -m "feat: 实现商品列表页（筛选/搜索/排序/分页）"
```

---

## Task 8: 商品详情页

**Files:**
- Create: `src/app/products/[id]/page.tsx`

- [ ] **Step 1: 实现详情页布局**

左右分栏（移动端上下）：
- 左：大图区域（游戏渐变色背景 + 游戏名 + 商品名）
- 右：商品名、评分星星、已售数量、价格（大号金黄色）、划线原价

- [ ] **Step 2: 实现规格选择与购买区**

- 面值选择按钮组（高亮选中项）
- 数量选择（+/- 按钮，最少1最多99）
- "加入购物车"按钮 + "立即购买"按钮
- 加入购物车后显示 Toast 提示

- [ ] **Step 3: 实现购买须知与评论区**

- 购买须知折叠面板（充值说明、到账时间、注意事项）
- 用户评论列表（从 reviews.ts 筛选该商品评论，显示头像、昵称、评分、内容、日期）

- [ ] **Step 4: 处理不存在的商品 ID**

返回 404 友好提示页面："商品不存在，返回首页"。

- [ ] **Step 5: 提交**

```bash
git add src/app/products/[id] && git commit -m "feat: 实现商品详情页（规格选择/购买/评论）"
```

---

## Task 9: 购物车页

**Files:**
- Create: `src/components/cart/CartItem.tsx`, `src/app/cart/page.tsx`

- [ ] **Step 1: 实现 CartItem 组件**

- 商品渐变色缩略图 + 游戏名 + 商品名 + 规格
- 单价
- 数量调整（+/- 按钮）
- 小计金额
- 删除按钮（hover 显示红色）

- [ ] **Step 2: 实现购物车页**

- 购物车商品列表（CartItem 列表）
- 右侧/底部汇总：总件数、总金额、"去结算"按钮
- 空购物车状态：图标 + "购物车空空如也" + "去逛逛"按钮
- "清空购物车"按钮

- [ ] **Step 3: 提交**

```bash
git add src/components/cart src/app/cart && git commit -m "feat: 实现购物车页面（增删改查/汇总）"
```

---

## Task 10: 结账页

**Files:**
- Create: `src/app/checkout/page.tsx`

- [ ] **Step 1: 实现结账页**

- 订单商品摘要列表
- 游戏账号填写输入框
- 支付方式选择：支付宝 / 微信支付 / 银行卡（图标 + 单选）
- 金额汇总（商品总价 + 优惠金额 + 应付金额）
- "提交订单"按钮

- [ ] **Step 2: 实现支付成功流程**

点击"提交订单" → Modal 弹窗显示支付成功：
- 绿色对勾图标
- "支付成功！"标题
- 虚拟订单号（SPD + 时间戳）
- "查看订单"按钮（跳转用户中心）
- "继续购物"按钮（跳转首页）
- 同时清空购物车

- [ ] **Step 3: 未登录拦截**

未登录用户访问结账页 → 提示"请先登录" → 跳转用户中心。

- [ ] **Step 4: 提交**

```bash
git add src/app/checkout && git commit -m "feat: 实现结账页面（账号填写/支付方式/模拟支付成功）"
```

---

## Task 11: 用户中心

**Files:**
- Create: `src/app/user/page.tsx`

- [ ] **Step 1: 实现登录/注册表单**

未登录状态：
- 标签页切换（登录 / 注册）
- 登录：用户名 + 密码 + 登录按钮
- 注册：用户名 + 密码 + 确认密码 + 注册按钮
- 表单验证（非空校验，密码长度6+，注册时两次密码一致）
- 任意账号密码均可登录/注册成功

- [ ] **Step 2: 实现用户信息面板**

已登录状态：
- 用户头像（首字母圆形）+ 昵称
- 账户余额：¥ 0.00
- 退出登录按钮

- [ ] **Step 3: 实现订单历史**

已登录状态：
- 订单列表（从 orders.ts 读取模拟数据）
- 每条显示：订单号、日期、商品名、金额、状态（已完成/待发货等）
- 空订单状态提示

- [ ] **Step 4: 提交**

```bash
git add src/app/user && git commit -m "feat: 实现用户中心（登录注册/个人信息/订单历史）"
```

---

## Task 12: 帮助中心

**Files:**
- Create: `src/app/help/page.tsx`

- [ ] **Step 1: 实现帮助中心页面**

- 页面标题"帮助中心"
- FAQ 折叠面板（10 条常见问题）：
  1. 充值多久到账？
  2. 支持哪些支付方式？
  3. 充值失败怎么办？
  4. 可以退款吗？
  5. 如何联系客服？
  6. 充值需要提供什么信息？
  7. 账号安全相关
  8. 发票问题
  9. 批量充值优惠
  10. 如何成为VIP会员？
- 联系客服卡片：QQ（2847563901）、微信（speedcard_cs）、邮箱（support@speedcard.cn）
- 客服时间：周一至周日 9:00-22:00

- [ ] **Step 2: 提交**

```bash
git add src/app/help && git commit -m "feat: 实现帮助中心页面（FAQ/联系客服）"
```

---

## Task 13: 全局打磨与响应式优化

**Files:**
- Modify: 所有页面和组件文件

- [ ] **Step 1: 移动端响应式检查**

逐页检查 375px 宽度下的布局：
- Header 汉堡菜单功能正常
- 首页各模块移动端布局
- 商品列表筛选面板移动端弹出
- 商品详情页上下布局
- 购物车、结账、用户中心移动端适配

- [ ] **Step 2: 交互细节打磨**

- 所有按钮 hover/active 效果
- 页面切换 loading 状态
- 空状态 UI（空购物车、空搜索结果、空订单）
- Toast 消息提示
- 搜索框交互（回车搜索、清空按钮）

- [ ] **Step 3: 检查"真实感"**

- 确认无任何 demo/示例/placeholder/测试 字样
- 网站名称"极速卡"正确显示
- 页脚 ICP 备案信息完整
- 商品数据价格合理
- 销量、评分、评论内容真实自然

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "fix: 响应式优化与交互细节打磨"
```

---

## Task 14: 构建与部署

**Files:**
- Modify: `next.config.js`（确认 standalone 配置）

- [ ] **Step 1: 本地构建**

```bash
cd D:/Github/Github/mall
npm run build
```

确认构建成功，无报错。

- [ ] **Step 2: 打包构建产物**

```bash
cd D:/Github/Github/mall
tar -czf dist.tar.gz .next/standalone .next/static public
```

- [ ] **Step 3: 上传到跳板机**

```bash
scp dist.tar.gz Administrator@52.199.230.238:/tmp/
```

- [ ] **Step 4: 从跳板机转发到目标服务器**

```bash
ssh Administrator@52.199.230.238 'scp /tmp/dist.tar.gz root@47.109.189.34:/opt/mall/'
```

- [ ] **Step 5: 检查服务器环境**

```bash
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "node -v && pm2 -v && nginx -v"'
```

如果缺少依赖则安装：
```bash
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && npm install -g pm2 && apt-get install -y nginx"'
```

- [ ] **Step 6: 解压并启动应用**

```bash
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "mkdir -p /opt/mall && cd /opt/mall && tar -xzf dist.tar.gz && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && cd .next/standalone && pm2 restart mall || pm2 start node --name mall -- server.js"'
```

- [ ] **Step 7: 配置 Nginx 反向代理**

```bash
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "cat > /etc/nginx/sites-available/mall << '\''EOF'\''
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
ln -sf /etc/nginx/sites-available/mall /etc/nginx/sites-enabled/mall && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx"'
```

- [ ] **Step 8: 配置 PM2 开机自启**

```bash
ssh Administrator@52.199.230.238 'ssh root@47.109.189.34 "pm2 save && pm2 startup systemd -u root --hp /root | tail -1 | bash"'
```

- [ ] **Step 9: 验收测试**

访问 http://47.109.189.34 确认：
- 首页正常加载
- 所有页面路由可访问
- 购物车功能正常
- 登录/登出正常
- PC 和移动端布局正常

- [ ] **Step 10: 提交部署记录**

```bash
git add -A && git commit -m "chore: 完成构建与服务器部署"
```
