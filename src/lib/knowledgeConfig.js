export const KNOWLEDGE_STATS = [
  { key: 'documents', label: '文档', value: 128452, icon: 'FileText', color: 'violet' },
  { key: 'projects', label: '项目资产', value: 5233, icon: 'FolderGit2', color: 'purple' },
  { key: 'lessons', label: '经验教训', value: 18553, icon: 'Lightbulb', color: 'fuchsia' },
  { key: 'templates', label: '行业模板', value: 420, icon: 'LayoutTemplate', color: 'indigo' },
  { key: 'ai_assets', label: 'AI生成资产', value: 3280, icon: 'Sparkles', color: 'pink' },
  { key: 'quality', label: '知识质量', value: 92, suffix: '%', icon: 'ShieldCheck', color: 'violet' },
];

export const KNOWLEDGE_SECTIONS = [
  { key: 'dashboard', label: '知识总览', icon: 'LayoutDashboard' },
  { key: 'marketplace', label: '知识市场', icon: 'Store' },
  { key: 'documents', label: '文档管理', icon: 'FileText' },
  { key: 'project_sync', label: '项目知识沉淀', icon: 'GitMerge' },
  { key: 'best_practices', label: '最佳实践', icon: 'Award' },
  { key: 'lessons', label: '经验教训', icon: 'Lightbulb' },
  { key: 'ai_assets', label: 'AI生成资产', icon: 'Sparkles' },
  { key: 'versions', label: '版本控制', icon: 'GitBranch' },
  { key: 'permissions', label: '权限治理', icon: 'Lock' },
];

export const CURATION_STEPS = [
  { label: '重复检测', desc: '比对已有知识库，识别重复内容', icon: 'Copy' },
  { label: '质量评估', desc: 'AI评估文档完整性与专业性', icon: 'ClipboardCheck' },
  { label: '敏感数据扫描', desc: '检测PII与机密信息', icon: 'ScanSearch' },
  { label: 'PII脱敏', desc: '自动移除个人隐私数据', icon: 'Eraser' },
  { label: '智能分类', desc: 'AI自动归类知识领域', icon: 'Tags' },
  { label: '发布入库', desc: '审核通过，发布到知识大脑', icon: 'CheckCircle' },
];

export const SYNC_STEPS = [
  { label: '项目关闭', desc: '项目完成并关闭', icon: 'Flag' },
  { label: '收集交付物', desc: '蓝图、源码、会议纪要、问题日志、测试报告', icon: 'PackageSearch' },
  { label: 'AI审核', desc: 'Knowledge Curator AI审核质量与合规', icon: 'Bot' },
  { label: '提取最佳实践', desc: 'AI提炼可复用经验', icon: 'Award' },
  { label: '写入知识大脑', desc: '沉淀到企业知识库', icon: 'BrainCircuit' },
  { label: '版本升级', desc: '相关知识版本号+1', icon: 'GitBranch' },
  { label: '通知订阅者', desc: '关联AI员工同步升级', icon: 'BellRing' },
];

export const EMBEDDING_STEPS = [
  { label: '文档解析', desc: 'Alibaba Bailian解析文档结构', icon: 'FileSearch' },
  { label: '智能分块', desc: 'Chunk语义化切分', icon: 'Scissors' },
  { label: '向量化', desc: 'Embedding生成语义向量', icon: 'Boxes' },
  { label: '索引构建', desc: '建立向量索引', icon: 'Network' },
  { label: '入库', desc: '写入知识大脑', icon: 'Database' },
];

export const VERSION_HISTORY = [
  { version: 'v1.0', date: '2024-03', note: '初始版本，基础迁移流程', author: '系统' },
  { version: 'v1.1', date: '2024-06', note: '新增Bluefield策略章节', author: '张磊' },
  { version: 'v2.0', date: '2024-11', note: '重构数据迁移章节，新增Cockpit指南', author: '李娜' },
  { version: 'v2.3', date: '2025-04', note: '补充汽车制造行业案例', author: '王浩' },
  { version: 'v3.0', date: '2025-12', note: 'AI生成资产整合，质量评分机制', author: 'Knowledge Curator AI' },
  { version: 'v3.1', date: '2026-07', note: '当前版本·新增S/4HANA Cloud最新最佳实践', author: 'Knowledge Curator AI', current: true },
];

export const MARKETPLACE_ITEMS = [
  { name: '制造业迁移模板', rating: 5, downloads: 1240, category: '行业模板', author: '汽车制造事业部', color: 'violet' },
  { name: '财务模块蓝图', rating: 4, downloads: 890, category: '功能蓝图', author: '财务咨询团队', color: 'purple' },
  { name: '汽车制造架构方案', rating: 5, downloads: 2150, category: '架构方案', author: '架构中心', color: 'fuchsia' },
  { name: '安全合规检查清单', rating: 5, downloads: 1670, category: '检查清单', author: '安全治理部', color: 'indigo' },
  { name: '数据迁移Cockpit指南', rating: 5, downloads: 1830, category: '操作手册', author: '迁移专家团队', color: 'pink' },
  { name: '测试自动化框架', rating: 4, downloads: 760, category: '测试框架', author: '测试中心', color: 'violet' },
];

export const EMPLOYEE_KNOWLEDGE_BINDINGS = [
  { employee: 'SAP迁移架构师', sources: [
    { name: '制造业知识', version: 'v2.1' },
    { name: 'SAP最佳实践', version: 'v4.0' },
    { name: '迁移经验教训', version: 'v3.2', count: 235 },
    { name: '架构标准', version: 'v3.5' },
  ]},
  { employee: '云架构师', sources: [
    { name: '云架构标准', version: 'v2.6' },
    { name: 'BTP集成指南', version: 'v1.8' },
    { name: '安全标准', version: 'v2.6' },
  ]},
  { employee: '测试专家', sources: [
    { name: '测试最佳实践', version: 'v3.1' },
    { name: '测试模板库', version: 'v2.0', count: 180 },
  ]},
];