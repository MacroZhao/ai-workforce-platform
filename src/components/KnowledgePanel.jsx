import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { KNOWLEDGE_DOCS } from '@/lib/agentConfig';

export default function KnowledgePanel({ active = false }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">企业知识库</h3>
        <span className="text-[10px] text-slate-600 ml-1">RAG</span>
        {active && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-violet-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            检索中...
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {KNOWLEDGE_DOCS.map((doc, i) => (
          <motion.div
            key={doc.name}
            animate={
              active
                ? {
                    borderColor: [
                      'rgba(30,41,59,0.8)',
                      'rgba(139,92,246,0.5)',
                      'rgba(30,41,59,0.8)',
                    ],
                    backgroundColor: [
                      'rgba(2,6,23,0.5)',
                      'rgba(139,92,246,0.08)',
                      'rgba(2,6,23,0.5)',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: active ? Infinity : 0,
              delay: i * 0.15,
            }}
            className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 flex items-center gap-2"
          >
            <span className="text-lg flex-shrink-0">{doc.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-300 truncate leading-tight">{doc.name}</p>
              <p className="text-[9px] text-slate-600">{doc.type}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}