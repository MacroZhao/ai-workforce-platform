import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, GitMerge, Award, Lightbulb,
  Sparkles, Store, GitBranch, Lock, Brain
} from 'lucide-react';
import { KNOWLEDGE_SECTIONS } from '@/lib/knowledgeConfig';

const ICONS = {
  LayoutDashboard, FileText, GitMerge, Award, Lightbulb,
  Sparkles, Store, GitBranch, Lock,
};

export default function KnowledgeSidebar({ active, onSelect }) {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-800/60 bg-slate-950/40 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Knowledge Brain</div>
            <div className="text-[10px] text-slate-500">企业知识大脑</div>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-wider px-2 mb-2">知识管理</div>
        <nav className="space-y-0.5">
          {KNOWLEDGE_SECTIONS.map((section) => {
            const Icon = ICONS[section.icon] || FileText;
            const isActive = active === section.key;
            return (
              <button
                key={section.key}
                onClick={() => onSelect(section.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="kb-active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}