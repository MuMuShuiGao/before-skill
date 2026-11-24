# 项目索引

> 状态：生效中
> 摘要：docs/ 全部文档的总目录，进项目先看这里

**项目一句话**：<用一句话说清这个项目在做什么、给谁用>

**代码在哪**：<主入口路径，例如 `src/` 或 `app/`>

---

## 清单

| 文档 | 状态 | 说明 |
| --- | --- | --- |
| [NOW.md](NOW.md) | 生效中 | 当前进度快照与断点，新会话从这里接上 |
| [projectneed.md](projectneed.md) | 草案 | 需求 / PRD，只写需求层 |
| [WORKFLOW.md](WORKFLOW.md) | 生效中 | 开发流程 + 每一步该动哪个文档 |
| [writing-rules.md](writing-rules.md) | 生效中 | 文档书写规范：分层、状态行、什么能改什么不能改 |
| [decisions/README.md](decisions/README.md) | 生效中 | ADR 目录的收录边界与命名规则 |
| [design/README.md](design/README.md) | 生效中 | 定论设计的收录边界 |
| [refactor/README.md](refactor/README.md) | 生效中 | 重构专项的收录边界与开工前置条件 |
| `templates/` | — | 6 份模板：adr / prd / design / refactor / milestone / incident。目录本身无状态，模板自带的 `草案` 是占位提醒 |

`decisions/`、`design/`、`refactor/` 下每新增一份文档，就在这里补一行——格式是「链接 + 状态 + 说明」，状态照抄该文档头部的 `> 状态：`，说明照抄 `> 摘要：`。改名或删文档同样要回来改这张表。

---

## 怎么读这个目录

1. 第一次接触项目：`projectneed.md` → `decisions/` 按编号顺序读 → 关心的模块进 `design/`。
2. 接着上次做：直接读 `NOW.md`。
3. 找不到东西：`design/` 和 `decisions/` 的 README 写了各自的收录边界。

## 阅读顺序建议

新会话开工前：`NOW.md` → 与本任务相关的 ADR → 相关设计文档。**不要跳过 ADR 直接改设计**，里面的备选方案表会告诉你哪些路已经验证过走不通。
