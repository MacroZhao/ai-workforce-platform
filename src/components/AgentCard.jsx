import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { AGENT_COLORS } from '@/lib/agentConfig';

export default function AgentCard({ agent, status = 'idle', compact = false, index = 0 }) {
  const colors = AGENT_COLORS[agent.color] || AGENT_COLORS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.2, type: 'spring', stiffness: 200 }}
      className={`relative rounded-xl border ${
        status === 'working' ? colors.workingBorder : colors.border
      } ${colors.bg} p-4 transition-all ${
        status === 'working' ? `ring-2 ${colors.ring}` : ''
      } ${status === 'completed' ? 'opacity-80' : ''}`}
    >
      {status === 'working' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-700">
          <Loader2 className={`w-4 h-4 ${colors.text} animate-spin`} />
        </div>
      )}
      {status === 'completed' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl flex-shrink-0`}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} text-white truncate`}
          >
            {agent.name}
          </h3>
          <p className={`text-[10px] ${colors.text} font-medium truncate`}>{agent.role}</p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">{agent.expertise}</p>
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Mission</p>
            <p className="text-xs text-slate-300 leading-relaxed">{agent.mission}</p>
          </div>
        </>
      )}
    </motion.div>
  );
}