# 企业AI数字员工平台

> **AI已经进入"平权化"时代，企业的"护城河"已经从模型、Agent转移到企业私域数据AI化和可利用复制能力上面。**  
> **谁能够最早/最快地将专业私域数据转化为专业数字化员工能力，谁才能长久立于AI潮流之上！**  
>                                                                —— Macro Zhao

本平台正是基于上述理念，而创建的一个能够让企业像组建真人专家团队一样组建项目需要的 AI 数字员工团队的企业级AI员工管理平台。

企业AI数字员工平台将需求、团队、智能体协作、交付与能力沉淀进行闭环，让企业快速把“想法”变成“可交付成果”的同时，沉淀可复制、分享和订阅的知识和员工模块。

## About This Project

**目前项目还处于初期阶段**，这个工程追求的是完整业务闭环：

- 从业务需求自动生成 AI 专家团队
- 在协作流程中产出可评审、可沉淀的项目交付物
- 将项目经验沉淀到知识大脑，再反哺下一轮 AI 能力升级

如果你希望做一个不仅能看、还能“落地交付”的 AI 业务平台，这个项目就是为你准备的。

## Architecture

前端基于 Vite + React + Tailwind，核心能力围绕页面工作流、数据访问层和企业知识模块展开。

```mermaid
flowchart TD
	A[User / Browser] --> B[React + Vite SPA]
	B --> C[Workflow Pages\n需求输入/组队/协作/交付/学习]
	B --> D[Knowledge Brain\n知识总览/市场/沉淀]
	B --> E[AI Employee Center\n创建/训练/公开聘用]
	C --> F[API Backend]
	D --> F
	E --> F
	F --> G[Platform Gateway]
	G --> H[Supabase\nAuth + Data + Storage]
	G --> I[LLM/Agent Call]
```

## Build & Run

### 1) Requirements

- Node.js 18+
- npm 9+

### 2) Install

```bash
npm install
```

### 3) Configure Environment

请在项目根目录创建 `.env.local`（或 `.env`），并填写：

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

注意：

- 不要提交任何真实密钥到 GitHub
- 本仓库 `.gitignore` 已忽略 `.env` 与 `.env.*`
- `SUPABASE_SERVICE_ROLE_KEY` 不应放在前端（`VITE_*`）变量中，生产环境请改为后端安全代理调用

### 4) Development

```bash
npm run dev
```

默认地址：`http://localhost:5173`

### 5) Production Build

```bash
npm run build
npm run preview
```

### 6) Quality Check

```bash
npm run lint
```

## Screenshots

### Core Workflow

![Main](./screenshots/01-main.jpg)
![Initing](./screenshots/02-initing.jpg)
![Workers](./screenshots/03-workers.jpg)
![Working](./screenshots/04-working.jpg)
![Work Done](./screenshots/05-workdone.jpg)

### AI Employee Center

![Worker Center](./screenshots/06-workercenter.jpg)
![Create Worker](./screenshots/07-create-worker.jpg)
![Worker Career](./screenshots/08-worker-career.jpg)
![Self Learning](./screenshots/09-woker-self-learning.jpg)
![Worker Growup](./screenshots/091-worker-growup.jpg)
![Worker Publish](./screenshots/092-worker-publish.jpg)

### Knowledge Brain

![Knowledge Center](./screenshots/093-knowledge-center.jpg)
![Knowledge Market](./screenshots/094-knowlege-market.jpg)
![Knowledge Collect](./screenshots/095-knowledge-collect.jpg)
![Knowledge Create](./screenshots/096-knowledge-create.jpg)

## Contributing

Welcome any contributions!
欢迎任何形式的贡献和反馈交流！

## License

本项目基于 Apache License 2.0 [LICENSE](./LICENSE)发布。
