---
traducao_de: 7bf8a146ef78bd026afbb4d0c878f43485496bff
---

# ADR 0239 — 用于交付物 Web preview 的本地 CSP `frame-src`

- **状态：** 已接受
- **日期：** 2026-11-02
- **修订：** `docker/web/nginx.conf` 的 CSP（继承自 [ADR 0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md)），仅涉及框架部分。

## 背景

AT-685 在 Brabo 内部的一个 `iframe` 中展示项目的交付物，它运行在使用者的机器上。没有 `frame-src` 时，CSP 回落到 `default-src 'self'`，浏览器会阻止该框架。

## 决定

1. web 的 nginx CSP 增加 `frame-src http://localhost:* http://127.0.0.1:*`。不含 `https:`，也不含外部域名。
2. 组件只接受通过 `urlLocalSegura` 的 URL；外部 URL 被拒绝，界面以文字说明原因。
3. 框架的 `sandbox` 为最小集：`allow-scripts allow-same-origin`。这两者合用之所以安全，只因为框架的源（`localhost:<端口>`）与 Brabo 的源不同：该框架无法访问 Brabo 的 DOM、cookie 或 storage。
   `allow-forms`、`allow-popups` 和 `allow-top-navigation` 不包含在内。
4. `frame-ancestors 'none'` 与 `X-Frame-Options: DENY` 不变：仍然禁止**其他**页面嵌套 Brabo。

## 后果

- 残余风险：被嵌套的本地页面运行的是用户自己项目的任意代码，在他的机器上，以它自己的源运行。如果 Brabo 在 `localhost` 上以与交付物**相同**的端口提供服务，源的隔离就消失了；因此交付物不能占用 Brabo 的端口。
- 将 Brabo 部署在远程服务器上的安装，会看到 `iframe` 指向浏览器的 `localhost`，而不是服务器的；这正是预期的语义。
