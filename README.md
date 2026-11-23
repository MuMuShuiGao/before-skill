# project-docs

给项目建一套能撑住三个月后的文档体系，并让 AI 编码助手按规则维护它。

核心是 `docs/decisions/`：把「当时为什么选它、否掉了哪些方案、各是因为什么」单独存下来。代码和聊天记录都留不住这些东西——三个月后你只会看到用了 PG，不会知道自己为什么没选 SQLite，更不知道为什么不该改成别的。

附带解决第二件事：`NOW.md` 承载当前上下文，新开一次会话不用重讲进度。

## 它会生成什么

```
docs/
├── decisions/     # ADR 架构决策记录：背景、决策、备选方案与否决理由、影响、复查条件
├── design/        # 定论设计：模块、数据库、接口、架构图
├── refactor/      # 重构专项：现状问题、新旧对比、迁移步骤、回滚、风险
├── templates/     # 6 份模板：adr / prd / design / refactor / milestone / incident
├── INDEX.md       # 总目录：每篇文档一行「链接 + 状态 + 说明」
├── NOW.md         # 当前视图：在做什么、卡在哪、下一步、断点状态
├── projectneed.md # 需求 / PRD：只有需求层
├── WORKFLOW.md    # 开发流程与文档更新规则
└── writing-rules.md # 书写规范：分层、状态行、什么能改什么不能改
```

初始化时整棵树复制进项目，模板里的占位符由你或助手填。**只写 `docs/`，不碰代码。**

## 安装

Skill 的通用形态就是「一个目录 + 目录里的 `SKILL.md`」，主流 AI 编码助手都会从某个 skills 目录读取它。各家路径不同，位置只有两种，任选：

| 位置 | 放哪 | 适用 |
| --- | --- | --- |
| 用户级（推荐） | 助手的配置目录下 `skills/`，常见形如 `~/.<工具>/skills/project-docs/` | 所有项目共用一套流程 |
| 项目级 | 仓库内的 skills 目录，常见形如 `<项目>/.<工具>/skills/project-docs/` | 随仓库提交，协作者共用 |

本仓库根目录就是 skill 目录，clone 时把目标目录名写成 `project-docs`：

```bash
git clone https://github.com/MuMuShuiGao/before-skill.git ~/.<工具>/skills/project-docs
```

结尾的 `project-docs` 不是笔误——目录名要和 [SKILL.md](SKILL.md) 里的 `name` 一致，直接 clone 下来得到的是 `before-skill`，多数助手按目录名匹配 skill，会认不出来。PowerShell 同理；具体放在哪个路径，查你所用助手的 skills 目录约定。装完重启会话或让它重新加载 skills，能列出 `project-docs` 就成了。

### 不用 skill 机制也能用

主体是 `assets/docs/` 里的纯 Markdown，不绑定任何工具：

- 只要目录结构：把 `assets/docs/` 复制成项目根的 `docs/`，之后照 [assets/docs/WORKFLOW.md](assets/docs/WORKFLOW.md) 人工维护。
- 想让助手按规则写：把 [SKILL.md](SKILL.md) 正文并进你的项目规则文件（AGENTS.md、自定义 instructions 之类），或开工时手动引用一次。
- 完全没有 skill 加载能力的工具：`docs/` 本身就是给人和给模型读的统一入口，装不装 skill 不影响使用。

### 依赖

只有重建目录的 `scripts/reindex.mjs` 需要 Node 18+，无第三方包。

## 怎么用

```
/project-docs init        # 给当前项目建 docs/
/project-docs resume      # 新会话接上上次进度
/project-docs reindex     # 重建 INDEX.md
```

也可以直接说人话，助手会自己按 `description` 里的场景触发：

| 你说 | 它会做 |
| --- | --- |
| 「这个项目要开始写文档了」 | 复制 docs/ 种子树，先填 NOW 和第一条 ADR |
| 「数据库就用 PG，不用 SQLite 了」 | 建一条 ADR，把被否掉的方案、代价、复查条件写进去 |
| 「上次那个同步逻辑做到哪了」 | 读 `NOW.md` 复述断点，而不是靠猜 |
| 「PRD 里把表结构删掉」 | 按分层规则挪进 design/，需求层只留产品约束 |
| 一次任务结束 | 更新 `NOW.md`；有文档增删就重建 `INDEX.md` |

只想手动跑脚本：

```bash
node scripts/reindex.mjs [docs-dir]   # 默认 ./docs
```

它只重写 `INDEX.md` 里 `<!-- BEGIN AUTO-INDEX -->` 与 `<!-- END AUTO-INDEX -->` 之间的内容，标记外的手写段落保留；顺带列出漏写状态行/摘要行的文档。

## 三条最容易被违反的规则

细节在 [assets/docs/writing-rules.md](assets/docs/writing-rules.md)，这里只列最要紧的：

1. **有方案被否掉，就当场记一条 ADR**，哪怕正文只有十行。隔天再补，写下来的只有结论，没有理由。
2. **已生效的 ADR 不改正文。** 推翻它 = 新开一条 + 把旧的标 `已废弃（被 NNNN 取代）`。改了就不是决策记录，是事后解释。
3. **PRD 只写需求层。** 技术栈、表结构、接口契约、排期都不进 `projectneed.md`——架构约束要保留，但剥掉实现名翻译成产品语言：写「换机能完整找回全部数据」，不写「用 PG 做主存储」。

## 裁剪

结构是约定不是强制。项目小可以只留 `decisions/` + `NOW.md` + `INDEX.md`，其余目录等真有内容再建——`writing-rules.md` 第 9 节明确写了「不建空文档凑结构」。

不想用脚本的话，删掉 `scripts/`，`INDEX.md` 手工维护即可。

## 卸载

删掉 skill 目录。已生成的 `docs/` 是普通 Markdown，留在你项目里，不受影响。
