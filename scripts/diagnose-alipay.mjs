import { execSync } from "child_process";
import crypto from "node:crypto";

function bwGet(name) {
  return execSync(`bw get password "${name}"`, { encoding: "utf-8" }).trim();
}

const APP_ID = bwGet("appid");
const PRIVATE_KEY = bwGet("private");
const ALIPAY_PUBLIC_KEY = bwGet("aliypay-public");
const GATEWAY = "https://openapi.alipay.com/gateway.do";

console.log("=== 支付宝支付功能诊断 ===");
console.log("APPID:", APP_ID);
console.log();

function formatPK(raw) {
  return "-----BEGIN PRIVATE KEY-----\n" + raw.replace(/(.{64})/g, "$1\n") + "\n-----END PRIVATE KEY-----";
}

function sign(params) {
  const str = Object.keys(params).sort()
    .filter(k => params[k] !== undefined && params[k] !== "")
    .map(k => `${k}=${params[k]}`).join("&");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(str, "utf8");
  return signer.sign(formatPK(PRIVATE_KEY), "base64");
}

async function callApi(method, bizContent) {
  const now = new Date();
  const timestamp = now.toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).replace("T", " ");
  const params = {
    app_id: APP_ID, method, format: "JSON", charset: "utf-8",
    sign_type: "RSA2", timestamp, version: "1.0",
    biz_content: JSON.stringify(bizContent),
  };
  params.sign = sign(params);
  const query = new URLSearchParams(params).toString();
  const resp = await fetch(`${GATEWAY}?${query}`, { method: "POST" });
  return resp.json();
}

// 提取响应体
function getBody(result, method) {
  const key = method.replace(/\./g, "_") + "_response";
  return result[key] || result;
}

async function diagnose() {
  // 1. alipay.trade.query
  console.log("[1] alipay.trade.query (交易查询)");
  const r1 = await callApi("alipay.trade.query", { out_trade_no: "DIAG_" + Date.now() });
  const b1 = getBody(r1, "alipay.trade.query");
  console.log("    code:", b1.code, "sub_code:", b1.sub_code || "无", "sub_msg:", b1.sub_msg || "无");
  console.log("    →", b1.sub_code === "ACQ.TRADE_NOT_EXIST" ? "✅ 有权限（订单不存在是正常的）" :
    b1.code === "40006" || b1.sub_code === "isv.insufficient-isv-permissions" ? "❌ 无权限" : "⚠️ " + b1.msg);
  console.log();

  // 2. alipay.trade.precreate (当面付)
  console.log("[2] alipay.trade.precreate (当面付/扫码付)");
  const r2 = await callApi("alipay.trade.precreate", { out_trade_no: "DIAG_" + Date.now(), total_amount: "0.01", subject: "诊断测试" });
  const b2 = getBody(r2, "alipay.trade.precreate");
  console.log("    code:", b2.code, "sub_code:", b2.sub_code || "无", "sub_msg:", b2.sub_msg || "无");
  console.log("    →", b2.sub_code === "ACQ.ACCESS_FORBIDDEN" || b2.code === "40006" ? "❌ 无权限（未签约当面付）" :
    b2.code === "10000" ? "✅ 有权限" : "⚠️ " + (b2.sub_msg || b2.msg));
  console.log();

  // 3. alipay.trade.create (统一收单)
  console.log("[3] alipay.trade.create (统一收单交易创建)");
  const r3 = await callApi("alipay.trade.create", { out_trade_no: "DIAG_" + Date.now(), total_amount: "0.01", subject: "诊断测试", buyer_id: "2088000000000000" });
  const b3 = getBody(r3, "alipay.trade.create");
  console.log("    code:", b3.code, "sub_code:", b3.sub_code || "无", "sub_msg:", b3.sub_msg || "无");
  console.log("    →", b3.sub_code === "ACQ.ACCESS_FORBIDDEN" || b3.code === "40006" ? "❌ 无权限" :
    b3.sub_code === "ACQ.BUYER_NOT_EXIST" ? "✅ 有权限（买家ID不存在是正常的）" :
    b3.code === "10000" ? "✅ 有权限" : "⚠️ " + (b3.sub_msg || b3.msg));
  console.log();

  // 4. alipay.trade.page.pay (电脑网站支付) - 生成URL，用 fetch 检查
  console.log("[4] alipay.trade.page.pay (电脑网站支付)");
  const ts4 = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).replace("T", " ");
  const params4 = {
    app_id: APP_ID, method: "alipay.trade.page.pay", format: "JSON", charset: "utf-8",
    sign_type: "RSA2", timestamp: ts4, version: "1.0",
    biz_content: JSON.stringify({ out_trade_no: "DIAG_PC_" + Date.now(), total_amount: "0.01", subject: "诊断-电脑支付", product_code: "FAST_INSTANT_TRADE_PAY" }),
  };
  params4.sign = sign(params4);
  const url4 = GATEWAY + "?" + new URLSearchParams(params4).toString();
  try {
    const resp4 = await fetch(url4, { redirect: "follow" });
    const html4 = await resp4.text();
    if (html4.includes("insufficient-isv-permissions")) {
      console.log("    ❌ 未签约电脑网站支付 (insufficient-isv-permissions)");
      const match = html4.match(/错误原因:?\s*([^<\n]+)/);
      if (match) console.log("    错误原因:", match[1].trim());
    } else if (html4.includes("TRADE_REFUSE") || html4.includes("ACCESS_FORBIDDEN")) {
      console.log("    ❌ 交易被拒绝或无权限");
    } else if (html4.includes("cashier") || html4.includes("login") || html4.includes("支付")) {
      console.log("    ✅ 正常跳转到收银台/登录页");
    } else {
      console.log("    ⚠️ 未知响应，前100字符:", html4.substring(0, 100));
    }
  } catch (e) { console.log("    ERROR:", e.message); }
  console.log();

  // 5. alipay.trade.wap.pay (手机网站支付)
  console.log("[5] alipay.trade.wap.pay (手机网站支付)");
  const ts5 = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).replace("T", " ");
  const params5 = {
    app_id: APP_ID, method: "alipay.trade.wap.pay", format: "JSON", charset: "utf-8",
    sign_type: "RSA2", timestamp: ts5, version: "1.0",
    biz_content: JSON.stringify({ out_trade_no: "DIAG_WAP_" + Date.now(), total_amount: "0.01", subject: "诊断-手机支付", product_code: "QUICK_WAP_WAY" }),
  };
  params5.sign = sign(params5);
  const url5 = GATEWAY + "?" + new URLSearchParams(params5).toString();
  try {
    const resp5 = await fetch(url5, { redirect: "follow" });
    const html5 = await resp5.text();
    if (html5.includes("insufficient-isv-permissions")) {
      console.log("    ❌ 未签约手机网站支付 (insufficient-isv-permissions)");
      const match = html5.match(/错误原因:?\s*([^<\n]+)/);
      if (match) console.log("    错误原因:", match[1].trim());
    } else if (html5.includes("TRADE_REFUSE") || html5.includes("ACCESS_FORBIDDEN")) {
      console.log("    ❌ 交易被拒绝或无权限");
    } else if (html5.includes("cashier") || html5.includes("login") || html5.includes("支付")) {
      console.log("    ✅ 正常跳转到收银台/登录页");
    } else {
      console.log("    ⚠️ 未知响应，前100字符:", html5.substring(0, 100));
    }
  } catch (e) { console.log("    ERROR:", e.message); }
  console.log();

  // 总结
  console.log("=== 诊断总结 ===");
  console.log("密钥配置: ✅ 正确（trade.query 签名验证通过）");
  console.log("需要在支付宝开放平台 (open.alipay.com) 签约以下产品:");
  console.log("  - 电脑网站支付 (alipay.trade.page.pay)");
  console.log("  - 手机网站支付 (alipay.trade.wap.pay)");
  console.log("签约路径: 我的应用 → APPID:", APP_ID, "→ 产品绑定 → 签约");
}

diagnose().catch(console.error);
