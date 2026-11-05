---
traducao_de: a4f29048d747d6a2d5d5feb944f31d9beadbd364
---

# ADR 0246 — 聊天附件：字节存于 Postgres，事件中存引用，视觉能力由 capability 决定

- **状态：** 已接受
- **日期：** 2026-11-03
- **引用：** ADR [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)（没有证明的 capability 为 `false`）、[0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md)（JSON 上传，"拒绝，绝不截断"）以及 [0152](0152-backup-de-volumes-contra-compose.md)（什么进入备份）。均不被编辑。

## 背景

AT-715（EP-031）：没有任何智能体聊天接受文件。所有者在 11 月 2 日回答了调研的 11 个问题：文本/代码和图片；每张图片 5 MB，每个文本 512 KB，每条消息 4 个；Postgres；随会话存续；图片只在到达的那个回合发给 LLM；所有 `viewer` 都能看到；不做杀毒；没有智能体的聊天不在范围内。event log 是追加式的，因此字节不能存放在其中。

## 决定

1. **字节存于 Postgres。** 表 `chat_attachments`（`bytea`，对项目和会话的 FK 为 `cascade`），无 UPDATE。备份的 `pg_dump` 已经覆盖它，RBAC 沿用项目的。没有任何内容写入磁盘或 worktree，因此没有新的路径遏制问题（RN-092/095）。
2. **事件中存引用。** `chat.message` 记录 `anexos: [{id, nome, mime, tamanho}]`，engine 收到同样的列表；字节只有在 api 组装对 provider 的调用时（lane L2）或有人读取附件时，才从数据库取出。
3. **视觉由 capability 决定。** `ChatMessage.content` 接受 `string` 或 `text`/`image` 部分，`LLMProviderCapabilities.vision` 在十一个 provider 中初始为 `false`（ADR 0041；只有真实的 smoke 才能开启它）。engine 在 `llm-turn` 中通过 id 发送附件（`{type:'anexo',id}`），由 api 解析：只有 provider **和**模型都具备视觉时图片才会发出；否则变为提示文本（RN-989）。Anthropic 和 Ollama 有各自的格式（`image` base64、`images`），没有 capability 的证明。
4. **谁能看到。** 项目的所有 `viewer`，范围与 `GET .../events` 相同。别人的返回 404。
5. **带 base64 的 JSON，而非 multipart。** 5 MB 变成约 6,7 MB，在 10 MB 的请求体之内，不需要 `multer` 或新的解析器；这是 RAG 上传的模式。
6. **按字节判断类型。** png/jpeg/gif/webp 看签名；文本是有效的 UTF-8 且不含 NUL。SVG 不是被接受的图片（它会被当作文本，并以 `nosniff`/`attachment` 提供）。

## 后果

- **已声明的缺口：没有杀毒。** 字节从不执行（保存在 `bytea` 中，以 `nosniff` 和 `attachment` 输出），但没有人扫描它们；ClamAV 将是新服务，也是所有者的决定。已记录在 `docs/security-surface.md`。
- `pg_dump` 会随附件增长；之后再测量（保留期是会话的存续期，没有清理）。
- 10 MB 的 JSON 上传请求体是该路由的上限，每个请求都把整个文件载入内存。
