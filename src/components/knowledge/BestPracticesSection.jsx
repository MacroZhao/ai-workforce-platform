import { motion } from 'framer-motion';
import { Award, GitBranch, Check, Star, Bell, Users } from 'lucide-react';
import { VERSION_HISTORY, EMPLOYEE_KNOWLEDGE_BINDINGS } from '@/lib/knowledgeConfig';

const BEST_PRACTICES = [
  { name: 'SAP S/4HANA迁移最佳实践', version: 'v3.1', category: 'SAP', subscribers: 24, rating: 5 },
  { name: 'Bluefield迁移方法论', version: 'v2.4', category: '迁移', subscribers: 18, rating: 5 },
  { name: '数据迁移Cockpit操作指南', version: 'v2.0', category: '数据', subscribers: 32, rating: 4 },
  { name: 'SAP安全合规检查清单', version: 'v2.6', category: '安全', subscribers: 28, rating: 5 },
  { name: '测试自动化框架标准', version: 'v3.1', category: '测试', subscribers: 15, rating: 4 },
];

export default function BestPracticesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">最佳实践</h1>
        <p className="text-sm text-slate-400 mt-1">AI员工订阅知识版本，知识升级时所有订阅员工同步升级</p>
      </div>

      {/* Best practices list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BEST_PRACTICES.map((bp, i) => (
          <motion.div
            key={bp.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-slate-900/40 border border-slate-800 p-4 hover:border-violet-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{bp.name}</div>
                  <span className="text-[10px] text-slate-500">{bp.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: bp.rating }).map((_, k) => (
                  <Star key={k} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> {bp.version}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" /> {bp.subscribers} 名AI员工订阅
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Version timeline */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">版本历史 · SAP S/4HANA迁移最佳实践</h3>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-800" />
          {VERSION_HISTORY.map((v, i) => (
            <motion.div
              key={v.version}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative mb-4 last:mb-0"
            >
              <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                v.current ? 'bg-violet-500 border-violet-400 ring-4 ring-violet-500/20' : 'bg-slate-900 border-slate-600'
              }`} />
              <div className={`rounded-lg border px-3 py-2.5 ${
                v.current ? 'bg-violet-500/10 border-violet-500/30' : 'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-mono font-semibold ${v.current ? 'text-violet-300' : 'text-slate-300'}`}>
                    {v.version}
                    {v.current && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">当前</span>}
                  </span>
                  <span className="text-xs text-slate-500">{v.date}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{v.note}</p>
                <div className="text-[10px] text-slate-600 mt-1">更新人: {v.author}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Employee knowledge subscription */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-fuchsia-400" />
          <h3 className="text-sm font-semibold text-white">AI员工知识订阅 · Knowledge Subscription</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">AI员工不上传文件，而是订阅知识版本；知识升级时订阅员工同步升级</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EMPLOYEE_KNOWLEDGE_BINDINGS.map((emp) => (
            <div key={emp.employee} className="rounded-lg bg-slate-950/40 border border-slate-800 p-3">
              <div className="text-sm font-medium text-white mb-2">{emp.employee}</div>
              <div className="space-y-1.5">
                {emp.sources.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{s.name}</span>
                    <span className="text-violet-300 font-mono">{s.version}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}