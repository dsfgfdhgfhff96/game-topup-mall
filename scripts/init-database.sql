-- ========================================
-- 极速卡商城 - 数据库初始化脚本
-- ========================================

-- 1. 序列
CREATE SEQUENCE IF NOT EXISTS order_no_seq START WITH 1;

-- 2. 数据库函数：生成订单号（必须在表之前创建）
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS text AS $$
DECLARE
  seq_val integer;
BEGIN
  seq_val := nextval('order_no_seq');
  RETURN 'SPD' || to_char(now(), 'YYYYMMDD') || lpad(seq_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. 订单主表
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text UNIQUE NOT NULL DEFAULT generate_order_no(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending_payment',
  total_price numeric(10,2) NOT NULL,
  pay_method text DEFAULT 'alipay',
  game_account text NOT NULL,
  alipay_trade_no text,
  alipay_buyer_id text,
  alipay_buyer_logon_id text,
  client_ip text,
  refund_reason text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  game_name text NOT NULL,
  spec_id text NOT NULL,
  spec_label text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  card_code text
);

-- 4. 卡密库表
CREATE TABLE IF NOT EXISTS card_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  spec_id text NOT NULL,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  order_item_id uuid REFERENCES order_items(id),
  created_at timestamptz DEFAULT now()
);

-- 6. 数据库函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION auto_update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 触发器：updated_at 自动更新
DROP TRIGGER IF EXISTS tr_orders_updated_at ON orders;
CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_timestamp();

-- 8. 数据库函数：自动发卡密
CREATE OR REPLACE FUNCTION assign_card_codes()
RETURNS trigger AS $$
DECLARE
  assigned_count integer;
  total_items integer;
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending_payment' THEN
    WITH matched AS (
      SELECT DISTINCT ON (oi.id)
        oi.id AS item_id,
        cc.id AS code_id,
        cc.code AS code_value
      FROM order_items oi
      JOIN card_codes cc ON cc.product_id = oi.product_id
        AND cc.spec_id = oi.spec_id
        AND cc.status = 'available'
      WHERE oi.order_id = NEW.id
      ORDER BY oi.id, cc.created_at
      FOR UPDATE OF cc SKIP LOCKED
    ),
    update_items AS (
      UPDATE order_items SET card_code = matched.code_value
      FROM matched WHERE order_items.id = matched.item_id
      RETURNING order_items.id
    ),
    update_codes AS (
      UPDATE card_codes SET status = 'sold', order_item_id = matched.item_id
      FROM matched WHERE card_codes.id = matched.code_id
    )
    SELECT count(*) INTO assigned_count FROM update_items;

    SELECT count(*) INTO total_items FROM order_items WHERE order_id = NEW.id;

    IF assigned_count = total_items THEN
      NEW.status := 'completed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 触发器：自动发卡密
DROP TRIGGER IF EXISTS tr_assign_card_codes ON orders;
CREATE TRIGGER tr_assign_card_codes
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_card_codes();

-- 10. RLS 策略
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "用户查看自己的订单" ON orders;
CREATE POLICY "用户查看自己的订单" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户创建订单" ON orders;
CREATE POLICY "用户创建订单" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户申请退款" ON orders;
CREATE POLICY "用户申请退款" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('completed')
    AND refund_reason IS NOT NULL
  );

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "用户查看自己的订单明细" ON order_items;
CREATE POLICY "用户查看自己的订单明细" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "用户创建订单明细" ON order_items;
CREATE POLICY "用户创建订单明细" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

ALTER TABLE card_codes ENABLE ROW LEVEL SECURITY;

-- 11. 索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_card_codes_available ON card_codes(product_id, spec_id) WHERE status = 'available';

-- 12. RPC：原子创建订单 + 订单明细（事务保证一致性）
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id uuid,
  p_total_price numeric,
  p_game_account text,
  p_pay_method text,
  p_client_ip text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_order record;
  v_item jsonb;
BEGIN
  INSERT INTO orders (user_id, total_price, game_account, pay_method, client_ip)
  VALUES (p_user_id, p_total_price, p_game_account, p_pay_method, p_client_ip)
  RETURNING * INTO v_order;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, product_name, game_name, spec_id, spec_label, price, quantity)
    VALUES (
      v_order.id,
      v_item->>'product_id',
      v_item->>'product_name',
      v_item->>'game_name',
      v_item->>'spec_id',
      v_item->>'spec_label',
      (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order.id, 'order_no', v_order.order_no);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 定时取消超时未支付订单（30 分钟未支付自动取消）
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS integer AS $$
DECLARE
  cancelled_count integer;
BEGIN
  UPDATE orders
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'pending_payment'
    AND created_at < now() - interval '30 minutes';

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用 pg_cron 定时调用（需在 Supabase Dashboard 或 SQL 中启用 pg_cron 扩展）
-- SELECT cron.schedule('cancel-expired-orders', '*/5 * * * *', 'SELECT cancel_expired_orders()');

-- 14. 支付黑名单表
CREATE TABLE IF NOT EXISTS payment_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'alipay_uid',
  value text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blacklist_type_value ON payment_blacklist(type, value);

ALTER TABLE payment_blacklist ENABLE ROW LEVEL SECURITY;
-- 黑名单仅 service_role 可操作，普通用户无权访问
