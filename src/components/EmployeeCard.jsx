import { motion } from 'framer-motion';
import { Lock, Globe, Check, Wallet, Sparkles } from 'lucide-react';
import { AGENT_COLORS } from '@/lib/agentConfig';

const STATUS_MAP = {
  available: { label: '在岗', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  training: { label: '训练中', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  assigned: { label: '已分配', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  certified: { label: '已认证', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
};

export default function EmployeeCard({ employee, index = 0, onClick, onMakePublic, onHire, onUnhire }) {
  const colors = AGENT_COLORS[employee.color] || AGENT_COLORS.violet;
  const status = STATUS_MAP[employee.status] || STATUS_MAP.available;
  const topSkills = (employee.skills || []).slice(0, 3);
  const isPublic = employee.visibility === 'public';
  const isHired = employee.hired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 cursor-pointer hover:scale-[1.02] transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
        >
          {employee.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}>
            {status.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
              isPublic
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300'
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="w-2.5 h-2.5" /> 公开
              </>
            ) : (
              <>
                <Lock className="w-2.5 h-2.5" /> 私有
              </>
            )}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-white text-sm mb-0.5 truncate">{employee.name}</h3>
      <p className={`text-xs ${colors.text} mb-2 truncate`}>{employee.role}</p>

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
        <span>{employee.level}</span>
        <span className={colors.text}>
          {'★'.repeat(employee.level_stars || 2)}
          <span className="text-slate-700">{'★'.repeat(5 - (employee.level_stars || 2))}</span>
        </span>
        <span className="text-slate-700">·</span>
        <span>{employee.experience_count || 0} 项目</span>
      </div>

      {topSkills.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-slate-800/50">
          {topSkills.map((skill, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 flex-1 truncate">{skill.name}</span>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 w-7 text-right">{skill.score}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Hire section */}
      <div className="mt-3 pt-3 border-t border-slate-800/50" onClick={(e) => e.stopPropagation()}>
        {!isPublic ? (
          <button
            onClick={() => onMakePublic?.(employee)}
            className="w-full py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-xs text-fuchsia-300 hover:bg-fuchsia-500/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> 公开发布
          </button>
        ) : isHired ? (
          <button
            onClick={() => onUnhire?.(employee)}
            className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> 取消聘用
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                employee.hire_type === 'paid'
                  ? 'bg-amber-500/10 text-amber-300'
                  : 'bg-emerald-500/10 text-emerald-300'
              }`}
            >
              <Wallet className="w-3 h-3" />
              {employee.hire_type === 'paid' ? `¥${employee.hire_price || 0}/月` : '免费'}
            </span>
            <button
              onClick={() => onHire?.(employee)}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> 聘用
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}