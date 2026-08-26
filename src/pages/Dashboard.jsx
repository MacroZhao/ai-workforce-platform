import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Zap, Brain, Plus, Award, ArrowRight } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import DeliverableCard from '@/components/DeliverableCard';
import { AGENT_COLORS } from '@/lib/agentConfig';

export default function Dashboard() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const proj = await backendApi.entities.Project.get(projectId);
        setProject(proj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-24 text-slate-400">项目未找到</div>;
  }

  const team = project.team_members || [];
  const deliverables = project.deliverables || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            交付包已就绪
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          AI劳动力项目仪表板
        </h1>
        {project.project_summary && (
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            {project.project_summary}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
            {project.industry}
          </span>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<Brain className="w-5 h-5" />}
          label="置信度"
          value={`${project.confidence_score || 92}%`}
          color="violet"
          delay={0.1}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="效率提升"
          value={`+${project.efficiency_gain || 35}%`}
          color="purple"
          delay={0.2}
        />
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          label="知识复用率"
          value={`${project.knowledge_reuse || 70}%`}
          color="fuchsia"
          delay={0.3}
        />
      </div>

      {/* AI Team status */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">AI团队状态</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {team.map((agent, i) => {
            const colors = AGENT_COLORS[agent.color] || AGENT_COLORS.violet;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{agent.icon}</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-white truncate">{agent.name}</p>
                <p className={`text-[10px] ${colors.text} truncate`}>{agent.role}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">生成的交付物</h2>
        <div className="space-y-4">
          {deliverables.map((d, i) => (
            <DeliverableCard key={i} deliverable={d} index={i} defaultExpanded={i === 0} />
          ))}
        </div>
      </div>

      {/* Learning loop CTA */}
      {project.learning_status !== 'completed' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/30 p-6 text-center"
        >
          <Award className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">AI员工学习成长闭环</h3>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            项目交付完成后，AI员工将从项目中学习经验、更新知识库、提升能力等级
          </p>
          <Link
            to={`/learning/${projectId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            启动学习成长闭环
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/30 p-6 text-center"
        >
          <Award className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">学习闭环已完成</h3>
          <p className="text-sm text-slate-400 mb-4">AI员工已完成成长升级</p>
          <Link
            to={`/growth/${projectId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            查看成长仪表板
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* New project */}
      <div className="flex justify-center pt-4 pb-8">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          开始新项目
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, delay = 0 }) {
  const colorMap = {
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      iconBg: 'bg-violet-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
    },
    fuchsia: {
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/30',
      text: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/20',
    },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl ${c.bg} border ${c.border} p-5`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.text} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}