import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, FileText, Database } from 'lucide-react';
import { AGENT_COLORS } from '@/lib/agentConfig';
import ReactMarkdown from 'react-markdown';

const MARKDOWN_COMPONENTS = {
  h1: ({ node, ...props }) => <h1 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-sm font-semibold text-white mb-2 mt-4" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-slate-200 mb-1 mt-3" {...props} />,
  h4: ({ node, ...props }) => <h4 className="text-xs font-semibold text-slate-300 mb-1 mt-2" {...props} />,
  p: ({ node, ...props }) => <p className="text-sm text-slate-300 mb-2 leading-relaxed" {...props} />,
  ul: ({ node, ...props }) => <ul className="text-sm text-slate-300 mb-2 space-y-1 list-disc pl-5" {...props} />,
  ol: ({ node, ...props }) => <ol className="text-sm text-slate-300 mb-2 space-y-1 list-decimal pl-5" {...props} />,
  li: ({ node, ...props }) => <li className="text-sm text-slate-300" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
  code: ({ node, ...props }) => (
    <code className="text-xs text-violet-300 bg-slate-800/50 px-1 py-0.5 rounded" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-violet-500/40 pl-3 text-sm text-slate-400 italic mb-2" {...props} />
  ),
};

export default function DeliverableCard({ deliverable, index = 0, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = AGENT_COLORS[deliverable.color] || AGENT_COLORS.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}
    >
      <div className="p-5 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl flex-shrink-0`}
        >
          {deliverable.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{deliverable.title}</h3>
          <p className="text-xs text-slate-500">由 {deliverable.agent} 生成</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {deliverable.key_points && deliverable.key_points.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">核心要点</p>
          <ul className="space-y-1.5">
            {deliverable.key_points.map((point, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className={`mt-1.5 w-1 h-1 rounded-full ${colors.dot} flex-shrink-0`} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors"
        >
          <FileText className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {expanded ? '收起' : '查看完整详情'}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-5 space-y-4"
        >
          <div className="rounded-lg bg-slate-950/40 border border-slate-800/50 p-4 overflow-x-auto">
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>{deliverable.content}</ReactMarkdown>
          </div>

          {deliverable.knowledge_refs && deliverable.knowledge_refs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3 h-3" />
                引用知识
              </p>
              <div className="flex flex-wrap gap-2">
                {deliverable.knowledge_refs.map((ref, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}