---
traducao_de: 928410e84dc409647a53517bd5bd6e5fed6663ca
---

# ADR 0242 — 容器使用 `@tanstack/react-table` 的线性表格

## 状态

**已接受。** 2026-11-02（AT-714；v7 经所有者批准）。

## 背景

v7 把容器和 Providers 的卡片换成线性表格（每项一行，操作只用图标并带 `legenda`）。容器需要排序和分页。

## 决定

- 容器使用 `@tanstack/react-table`（`^9.3.1`，入口 `legacy`），仅用于在客户端决定顺序和页；不新增查询。Providers 保持在现有 `Table` 组件之上的线性表格，不使用该库。
- 新依赖的理由，以 `vite build` 测量：该界面是独立 chunk（`ContainersPage` 4,4 kB，gzip 1,7 kB），该库落入已有的 vendor 组 `vendor-tanstack`（236 kB，含 router 和 query，gzip 共 66 kB）；该库单独的增量没有测量。`pnpm audit --prod`：没有已知漏洞；`node_modules` 中磁盘占用约 140 kB。

## 后果

多一个需要维护的依赖；将来只做列表的表格不需要它。
