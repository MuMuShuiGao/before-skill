---
name: project-docs
description: 为项目建立并长期维护一套 docs/ 文档体系——decisions/ 架构决策记录（ADR：为什么选它、备选方案、否决理由）、design/ 定论设计、refactor/ 重构专项、templates/ 全套模板，外加 INDEX.md 总目录、NOW.md 断点与当前上下文、projectneed.md 需求、WORKFLOW.md 流程与文档更新规则、writing-rules.md 书写规范。用于新建项目脚手架、开新会话从断点接上进度、记录技术选型与被否掉的方案、增删文档后同步目录。当用户说"建文档体系、补 ADR、更新 NOW、整理 docs、从上次进度继续"时使用。
argument-hint: <init | resume | adr <标题> | reindex>
---

# 项目文档体系

## Overview

把最容易混成一团的四类信息分开存：**需求**（要什么、做到什么算完）、**决策**（为什么这么选、否掉了什么、什么时候要重估）、**设计**（定论方案：模块/数据/接口）、**当前上下文**（正在做什么、卡在哪、下一步）。

分开的目的很实际：三个月后回来看代码，能查到"当初为什么没用 X"，而不是只能猜。

## 目录契约

```
docs/
├── decisions/     # ADR：每份一个决策，NNNN-短名.md 递增编号
├── design/        # 稳定下来的正式设计（定论，不含讨论过程）
├── refactor/      # 重构专项：方案、新旧对比、迁移步骤、风险
├── templates/     # 所有 md 模板
├── INDEX.md       # 总目录：每篇文档一行「链接 + 状态 + 说明」
├── NOW.md         # 当前视图：在做、卡点、下一步、断点
├── projectneed.md # 需求/PRD：只写需求层
├── WORKFLOW.md    # 开发流程 + 文档更新规则
└── writing-rules.md # 文档本身的书写规范
```

`decisions/` 是本体系的价值核心。**判断一次对话值不值得留痕，只看一件事：有没有一个备选方案被否掉。** 有，就是一条 ADR。

## 动作一：初始化

用户要求建文档体系、或项目根本没有 `docs/` 时执行。

1. 把本 skill 的 `assets/docs/` 整棵树复制到项目根的 `docs/`，保留子目录结构：
   ```bash
   cp -r <skill-dir>/assets/docs ./docs        # bash / zsh
   Copy-Item -Recurse <skill-dir>\assets\docs .\docs   # PowerShell
   ```
2. 第一轮只填 `projectneed.md`、`NOW.md` 和一条 ADR（如果当前已有选型结论）。**不要**为了让目录"看起来完整"去造空的 design/ 文档。
3. 跑 `node <skill-dir>/scripts/reindex.mjs docs` 生成目录。
4. 检查所有 `<占位>` 是否清干净——模板里的尖括号内容是给使用者看的，不能留在交付文档里。

## 动作二：从断点恢复

新会话开始时，若项目存在 `docs/NOW.md`，先读它，再按需读 `docs/INDEX.md` 定位相关文档。**不要凭代码或记忆假设项目状态**——NOW.md 里写的"改到一半、未验证"就是当前事实。

恢复后第一句先复述：在做的事 + 下一步 + 你观察到的与 NOW.md 不一致之处。若不一致，先确认，别直接改。

## 动作三：日常维护

| 刚发生的事 | 动哪个文件 |
| --- | --- |
| 定了技术选型、否掉了某个方案 | 新建 `decisions/NNNN-短名.md`（下一条编号） |
| 推翻旧决策 | 新建一条 ADR，并把旧文件**状态行**改为 `已废弃（被 NNNN 取代）`；正文结论不改 |
| 模块/表结构/接口稳定下来 | 写或更新 `design/<主题>.md`，头部注明依据哪条 ADR |
| 需求范围、功能项、验收线变化 | 改 `projectneed.md` |
| 决定重构某块 | 先写 `refactor/<主题>.md`，评审通过再动手 |
| 阶段结束、排期定了 | 用 `templates/milestone.md` 建一份 |
| 线上出问题、踩了坑 | 用 `templates/incident.md` 记台账 |
| 新增/改名/删除任何 md | 跑 `scripts/reindex.mjs` 重建 `INDEX.md` |
| 会话要结束、任务告一段落 | **无条件更新 `NOW.md`**（含 `> 更新：` 时间） |

最后一条没有例外。它是这套体系能不能续上的唯一依赖。

## 分层规则

最常做错的地方，写任何文档前先确认它承担哪一层：

- **`projectneed.md` 只写需求层**：目标、做/不做、功能需求带验收线、业务口径、待确认项。**不放**技术栈名字、数据库 DDL、接口契约、框架选择、里程碑排期、运维备份方案。
- 技术结论进 `design/`，技术结论的**理由**进 `decisions/`。
- 架构约束要留在需求层，但剥掉实现名后翻译成产品语言：写"换机能完整找回全部数据"，不写"用 PG 做主存储"。
- 同一信息只在一处，其他地方用相对路径链接，不复制正文。

完整规则见 `docs/writing-rules.md`（初始化后它就在项目里，随项目演进）。

## 目录重建

`scripts/reindex.mjs` 扫描 `docs/` 下所有 `.md`，按 `> 状态：` 和 `> 摘要：` 两行生成表格，写回 `INDEX.md` 中 `<!-- BEGIN AUTO-INDEX -->` 与 `<!-- END AUTO-INDEX -->` 之间——标记外的手写内容保留不动。它同时列出缺状态行或缺摘要的文档。

```bash
node <skill-dir>/scripts/reindex.mjs [docs-dir]   # 默认 ./docs
```

因此每篇文档头部必须有这两行，模板已内置。写新文档时照模板来，不要事后补。

## Resources

- `assets/docs/` — 完整的 docs/ 种子树：5 个根 md（INDEX / NOW / projectneed / WORKFLOW / writing-rules）、`decisions/` `design/` `refactor/` 各一份说明、`templates/` 6 份模板（adr / prd / design / refactor / milestone / incident）。初始化时整树复制。
- `scripts/reindex.mjs` — 重建 `INDEX.md`，可重复执行，只改 AUTO-INDEX 块；`INDEX.md` 与各目录的 `README.md` 不进清单。
