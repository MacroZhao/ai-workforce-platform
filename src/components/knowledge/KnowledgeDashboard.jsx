import { motion } from 'framer-motion';
import {
  FileText, FolderGit2, Lightbulb, LayoutTemplate, Sparkles, ShieldCheck,
  TrendingUp, Layers
} from 'lucide-react';
import { KNOWLEDGE_STATS } from '@/lib/knowledgeConfig';

const ICONS = {
  FileText, FolderGit2, Lightbulb, LayoutTemplate, Sparkles, ShieldCheck,
};

const COLOR_MAP = {
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', gradient: 'from-violet-500/20 to-violet-600/5' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', gradient: 'from-purple-500/20 to-purple-600/5' },
  fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', gradient: 'from-fuchsia-500/20 to-fuchsia-600/5' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', gradient: 'from-indigo-500/20 to-indigo-600/5' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', gradient: 'from-pink-500/20 to-pink-600/5' },
};

function formatNum(n) {
  return n.toLocaleString('en-US');
}

export default function KnowledgeDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          企业知识大脑
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-400 mt-1"
        >
          Knowledge Brain — 整个企业AI数字员工平台的底座，所有AI员工共享的企业知识资产
        </motion.p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {KNOWLEDGE_STATS.map((stat, i) => {
          const Icon = ICONS[stat.icon] || FileText;
          const c = COLOR_MAP[stat.color];
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl bg-gradient-to-br ${c.gradient} border ${c.border} p-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-white">
                    {formatNum(stat.value)}{stat.suffix || ''}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
              </div>
              {stat.key === 'quality' && (
                <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Knowledge pipeline concept */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-slate-900/40 border border-slate-800 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">知识 → 能力 → 员工</h3>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 text-sm">
          {[
            { label: 'Knowledge', sub: '知识沉淀', color: 'violet' },
            { label: 'Curator AI', sub: '审核治理', color: 'purple' },
            { label: 'Capability', sub: '能力转化', color: 'fuchsia' },
            { label: 'Workforce', sub: '数字员工', color: 'pink' },
          ].map((item, i) => {
            const c = COLOR_MAP[item.color];
            return (
              <div key={item.label} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 rounded-lg ${c.bg} ${c.border} border px-3 py-2.5 text-center`}>
                  <div className={`font-semibold ${c.text}`}>{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.sub}</div>
                </div>
                {i < 3 && <span className="text-slate-600">→</span>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          传统RAG知识属于文档；企业AI数字员工平台中，知识先沉淀到企业知识大脑，经治理、版本化、审核后转化为AI员工能力，形成可持续成长的数字员工队伍。
        </p>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-slate-900/40 border border-slate-800 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">知识动态</h3>
          </div>
          <span className="text-xs text-slate-500">最近7天</span>
        </div>
        <div className="space-y-2">
          {[
            { text: 'Knowledge Curator AI 审核通过 38 份文档', time: '2小时前', color: 'violet' },
            { text: '项目「汽车制造S/4HANA迁移」沉淀 12 条最佳实践', time: '5小时前', color: 'purple' },
            { text: 'SAP最佳实践知识升级至 v3.1，通知 24 名订阅AI员工', time: '1天前', color: 'fuchsia' },
            { text: '制造业迁移模板上架知识市场，被下载 86 次', time: '3天前', color: 'indigo' },
          ].map((item, i) => {
            const c = COLOR_MAP[item.color];
            return (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-800/60 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full ${c.bg.replace('/10','')} shrink-0`} />
                <span className="text-slate-300 flex-1">{item.text}</span>
                <span className="text-xs text-slate-600">{item.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}