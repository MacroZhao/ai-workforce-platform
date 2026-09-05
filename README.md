1| # 企业AI数字员工平台
2| 
3| > **AI已经进入"平权化"时代，企业的"护城河"已经从模型、Agent转移到企业私域数据AI化和可利用复制能力上面。**  
4| > **谁能够最早/最快地将专业私域数据转化为专业数字化员工能力，谁才能长久立于AI潮流之上！**  
5| >                                                                —— Macro Zhao
6| 
7| 本平台正是基于上述理念，而创建的一个能够让企业像组建真人专家团队一样组建项目需要的 AI 数字员工团队的企业级AI员工管理平台。
8| 
9| 企业AI数字员工平台将需求、团队、智能体协作、交付与能力沉淀进行闭环，让企业快速把“想法”变成“可交付成果”的同时，沉淀可复制、分享和[...]
10| 
11| ## About This Project
12| 
13| **目前项目还处于初期阶段**，这个工程追求的是完整业务闭环：
14| 
15| - 从业务需求自动生成 AI 专家团队
16| - 在协作流程中产出可评审、可沉淀的项目交付物
17| - 将项目经验沉淀到知识大脑，再反哺下一轮 AI 能力升级
18| 
19| 如果你希望做一个不仅能看、还能“落地交付”的 AI 业务平台，这个项目就是为你准备的。
20| 
21| ## Architecture
22| 
23| 前端基于 Vite + React + Tailwind，核心能力围绕页面工作流、数据访问层和企业知识模块展开。
24| 
25| ```mermaid
26| flowchart TD
27| 	A[User / Browser] --> B[React + Vite SPA]
28| 	B --> C[Workflow Pages\n需求输入/组队/协作/交付/学习]
29| 	B --> D[Knowledge Brain\n知识总览/市场/沉淀]
30| 	B --> E[AI Employee Center\n创建/训练/公开聘用]
31| 	C --> F[API Backend]
32| 	D --> F
33| 	E --> F
34| 	F --> G[Platform Gateway]
35| 	G --> H[Supabase\nAuth + Data + Storage]
36| 	G --> I[LLM/Agent Call]
37| ```
38| 
39| ## Build & Run
40| 
41| ### 1) Requirements
42| 
43| - Node.js 18+
44| - npm 9+
45| 
46| ### 2) Install
47| 
48| ```bash
49| npm install
50| ```
51| 
52| ### 3) Configure Environment
53| 
54| 请在项目根目录创建 `.env.local`（或 `.env`），并填写：
55| 
56| ```bash
57| VITE_SUPABASE_URL=your-supabase-url
58| VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
59| VITE_OPENAI_API_KEY=your-openai-api-key
60| VITE_ORCAROUTER_API_KEY=your-orcarouter-api-key # for OrcaRouter integration (optional)
61| ```
62| 
63| 注意：
64| 
65| - 不要提交任何真实密钥到 GitHub
66| - 本仓库 `.gitignore` 已忽略 `.env` 与 `.env.*`
67| - `SUPABASE_SERVICE_ROLE_KEY` 不应放在前端（`VITE_*`）变量中，生产环境请改为后端安全代理调用
68| 
69| ### 4) Development
70| 
71| ```bash
72| npm run dev
73| ```
74| 
75| 默认地址：`http://localhost:5173`
76| 
77| ### 5) Production Build
78| 
79| ```bash
80| npm run build
81| npm run preview
82| ```
83| 
84| ### 6) Quality Check
85| 
86| ```bash
87| npm run lint
88| ```
89| 
90| ## Screenshots
91| 
92| ### Core Workflow
93| 
94| ![Main](./screenshots/01-main.jpg)
95| ![Initing](./screenshots/02-initing.jpg)
96| ![Workers](./screenshots/03-workers.jpg)
97| ![Working](./screenshots/04-working.jpg)
98| ![Work Done](./screenshots/05-workdone.jpg)
99| 
100| ### AI Employee Center
101| 
102| ![Worker Center](./screenshots/06-workercenter.jpg)
103| ![Create Worker](./screenshots/07-create-worker.jpg)
104| ![Worker Career](./screenshots/08-worker-career.jpg)
105| ![Self Learning](./screenshots/09-woker-self-learning.jpg)
106| ![Worker Growup](./screenshots/091-worker-growup.jpg)
107| ![Worker Publish](./screenshots/092-worker-publish.jpg)
108| 
109| ### Knowledge Brain
110| 
111| ![Knowledge Center](./screenshots/093-knowledge-center.jpg)
112| ![Knowledge Market](./screenshots/094-knowlege-market.jpg)
113| ![Knowledge Collect](./screenshots/095-knowledge-collect.jpg)
114| ![Knowledge Create](./screenshots/096-knowledge-create.jpg)
115| 
116| ## OrcaRouter AI（推荐）
117| 
118| 我推荐使用 OrcaRouter AI 来做实验性或生产级的多模型/路由能力（OrcaRouter 提供灵活的模型路由、插件与平台接入）。这是我的专属推荐链接（支持项目发展）：
119| 
120| https://www.orcarouter.ai/ref/ref_4fa1c66b79aa32c0d4ea
121| 
122| 集成说明：
123| 
124| - 在本仓库中我添加了一个轻量级的 provider：`src/lib/orcarouterProvider.js`，用于调用 OrcaRouter 的 API（示例端点为 `https://api.orcarouter.ai/v1`，具体请参考 OrcaRouter 官方文档并根据实际端点调整）。
125| - 若要启用 API 调用，请在 `.env.local` 中设置 `VITE_ORCAROUTER_API_KEY`（前端 demo 或开发环境）。生产环境建议通过后端安全代理来调用并保护密钥。
126| - 使用示例：
127| 
128| ```javascript
129| import { generate, openReferral } from '@/lib/orcarouterProvider'
130| 
131| // 生成文本
132| const resp = await generate('帮我写一个项目需求概要：...')
133| console.log(resp)
134| 
135| // 打开推荐链接
136| openReferral()
137| ```
138| 
139| 注意：示例代码使用浏览器 fetch 实现一个通用的 provider，可能需要根据 OrcaRouter 官方 API 进行调整。
140| 
141| ## Contributing
142| 
143| Welcome any contributions!
144| 欢迎任何形式的贡献和反馈交流！
145| 
146| ## License
147| 
148| 本项目基于 Apache License 2.0 [LICENSE](./LICENSE)发布。
149| 