import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { AGENT_COLORS } from '@/lib/agentConfig';

export default function LearningAgentCard({ step, status, index }) {
  const colors = AGENT_COLORS[step.color] || AGENT_COLORS.violet;
  const isActive = status === 'working';
  const isDone = status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl border p-5 transition-all ${
        isActive
          ? `${colors.workingBorder} ${colors.bg} ring-2 ${colors.ring}`
          : isDone
          ? `${colors.border} ${colors.bg}`
          : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl flex-shrink-0`}
        >
          {step.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">{step.name}</h3>
          <p className="text-xs text-slate-500 truncate">{step.description}</p>
        </div>
        <div className="flex-shrink-0">
          {status === 'waiting' && (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-600 font-medium">
              {index + 1}
            </div>
          )}
          {isActive && <Loader2 className={`w-5 h-5 ${colors.text} animate-spin`} />}
          {isDone && (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}