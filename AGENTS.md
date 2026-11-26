# 项目说明

> 状态：生效中
> 摘要：新会话开工前必读——先读 docs/，再动代码

## 动代码之前，按顺序读这三份

1. [`docs/NOW.md`](docs/NOW.md) — 它写的就是当前事实，包括"改到一半、没验证"。**不要**凭代码或印象推测项目进度。
2. [`docs/INDEX.md`](docs/INDEX.md) — 定位与本次任务相关的 ADR 和设计文档。
3. 相关的 `docs/decisions/NNNN-*.md` — 不要跳过 ADR 直接改设计，备选方案表里写了哪些路已经否掉过。

读完先回一句：在做什么 + 下一步 + 你看到的与 NOW.md 不一致之处。不一致就先确认，别直接改。

## 例外：项目还没起步

若 `docs/NOW.md` 里还是 `<尖括号占位>`，说明这是刚拷进来的空模板，上面那套"复述断点"不适用——没有断点可复述。此时先问清要做什么，填 `docs/projectneed.md` 和 `docs/NOW.md`，手上已有选型结论就顺手建第一条 `docs/decisions/0001-*.md`，填完才动代码。

## 六条硬规则

| 情况 | 动作 |
| --- | --- |
| 有方案被否掉 | 当场用 `docs/templates/adr.md` 建一条 ADR，备选方案与否决理由不能省 |
| 要推翻已生效的 ADR | 新开一条，旧的只把状态行改成 `已废弃（被 NNNN 取代）`，正文不动 |
| 写 `docs/projectneed.md` | 只写需求层。技术栈、表结构、接口契约、排期都不进——架构约束剥掉实现名翻译成产品语言 |
| 要把环境信息写进 docs | **标识值不进**：IP、域名、主机名、端口、账号与家目录路径、密钥口令。写性质不写值，硬件规格用量级表述（见 `docs/writing-rules.md` §9） |
| 任务结束、会话要断 | **无条件更新 `docs/NOW.md`**，含 `> 更新：` 时间 |
| 要写提交信息 | 标题 `<type>(<scope>): <subject>`，type 照 `docs/WORKFLOW.md` §4 的表判，不许 `update` / `修改` / `WIP` 这类空词；正文最后一行写验证口径，没验证就照实写"未验证" |

完整流程见 [`docs/WORKFLOW.md`](docs/WORKFLOW.md)，书写约束见 [`docs/writing-rules.md`](docs/writing-rules.md)。
