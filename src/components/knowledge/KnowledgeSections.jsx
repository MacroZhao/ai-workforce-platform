import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, FileText, Lock, Shield, Users } from 'lucide-react';

const LESSONS = [
  { title: 'Brownfield迁移的定制代码清理优先级', category: '方法论', source: '汽车制造S/4HANA项目', quality: 95 },
  { title: '数据迁移前必须完成主数据治理', category: '最佳实践', source: '零售客户迁移项目', quality: 92 },
  { title: '集成测试应早于单元测试完成', category: '风险应对', source: '制药迁移项目', quality: 88 },
  { title: '权限设计需在蓝图阶段确定', category: '方法论', source: '金融迁移项目', quality: 90 },
  { title: 'Bluefield策略适用于高度定制化系统', category: '方法论', source: '制造业迁移项目', quality: 94 },
  { title: '切换窗口预留30%缓冲时间', category: '风险应对', source: '汽车制造项目', quality: 89 },
];

const AI_ASSETS = [
  { title: '汽车行业迁移蓝图模板', type: '蓝图模板', quality: 93 },
  { title: 'S/4HANA财务模块配置方案', type: '配置方案', quality: 91 },
  { title: '数据迁移Cockpit操作手册', type: '操作手册', quality: 95 },
  { title: '安全合规自动检查规则集', type: '规则集', quality: 90 },
  { title: '测试用例自动生成模板', type: '测试模板', quality: 87 },
];

const PERMISSIONS = [
  { role: '知识管理员', scope: '全组织', level: '读写删' },
  { role: 'AI员工', scope: '订阅域', level: '只读' },
  { role: '项目经理', scope: '本部门', level: '读写' },
  { role: '外部合作伙伴', scope: '共享市场', level: '只读' },
];

function ListSection({ title, desc, icon: Icon, iconColor, items, renderItem }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-slate-400 mt-1">{desc}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl bg-slate-900/40 border border-slate-800 p-4 hover:border-violet-500/30 transition-colors"
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function LessonsLearnedSection() {
  return (
    <ListSection
      title="经验教训"
      desc="从过往项目自动提炼的可复用经验，支撑AI员工规避常见风险"
      icon={Lightbulb}
      iconColor="text-fuchsia-400"
      items={LESSONS}
      renderItem={(item) => (
        <>
          <div className="flex items-start justify-between mb-2">
            <Lightbulb className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
            <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-300 text-[10px]">{item.category}</span>
          </div>
          <h3 className="text-sm text-white mb-2">{item.title}</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">来源: {item.source}</span>
            <span className="text-emerald-400">质量 {item.quality}%</span>
          </div>
        </>
      )}
    />
  );
}

export function AIGeneratedSection() {
  return (
    <ListSection
      title="AI生成资产"
      desc="Knowledge Curator AI 自动生成与整合的知识资产"
      icon={Sparkles}
      iconColor="text-violet-400"
      items={AI_ASSETS}
      renderItem={(item) => (
        <>
          <div className="flex items-start justify-between mb-2">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px]">{item.type}</span>
          </div>
          <h3 className="text-sm text-white mb-2">{item.title}</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3" /> AI生成
            </span>
            <span className="text-emerald-400">质量 {item.quality}%</span>
          </div>
        </>
      )}
    />
  );
}

export function PermissionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">权限治理</h1>
        <p className="text-sm text-slate-400 mt-1">企业级知识访问权限与数据治理</p>
      </div>
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5">
        <div className="grid grid-cols-3 gap-3 text-xs text-slate-500 mb-3 px-3">
          <div>角色</div><div>范围</div><div>权限级别</div>
        </div>
        <div className="space-y-2">
          {PERMISSIONS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-3 gap-3 items-center rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-white">
                <Lock className="w-3.5 h-3.5 text-violet-400" /> {p.role}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> {p.scope}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 w-fit ${
                p.level.includes('删') ? 'bg-rose-500/10 text-rose-300' :
                p.level.includes('写') ? 'bg-amber-500/10 text-amber-300' :
                'bg-emerald-500/10 text-emerald-300'
              }`}>
                <Shield className="w-3 h-3" /> {p.level}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}