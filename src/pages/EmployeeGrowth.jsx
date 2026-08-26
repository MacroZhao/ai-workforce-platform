import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Plus, ArrowRight, Brain, Zap, Clock } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import { AGENT_COLORS, INITIAL_CAPABILITIES } from '@/lib/agentConfig';

export default function EmployeeGrowth() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const proj = await backendApi.entities.Project.get(projectId);
        setProject(proj);
        if (!proj.learning_status || proj.learning_status !== 'completed') {
          navigate(`/learning/${projectId}`);
        }
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
  const focusAgent = team[0] || { name: 'AI员工', role: '', icon: '🤖', color: 'violet' };
  const colors = AGENT_COLORS[focusAgent.color] || AGENT_COLORS.violet;
  const skillUpdates = project.skill_updates || [];
  const upgrade = project.employee_upgrade || {};
  const experiences = project.experiences || [];
  const knowledgeAdded = project.knowledge_added || 15;

  const before = {
    name: focusAgent.name,
    role: focusAgent.role,
    icon: focusAgent.icon,
    level: '初级顾问',
    stars: 2,
    experience: 3,
    knowledge: 120,
    skills: skillUpdates.map((s) => ({ name: s.name, score: s.before })),
    capabilities: INITIAL_CAPABILITIES[focusAgent.role] || ['基础交付能力'],
  };

  const after = {
    ...before,
    level: upgrade.new_level || '高级顾问',
    stars: upgrade.new_level_stars || 4,
    experience: 4,
    knowledge: 120 + knowledgeAdded,
    skills: skillUpdates.map((s) => ({ name: s.name, score: s.after })),
    capabilities: upgrade.new_capabilities || [],
  };

  const avgGain =
    skillUpdates.length > 0
      ? Math.round(
          skillUpdates.reduce((sum, s) => sum + (s.after - s.before), 0) / skillUpdates.length
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-medium text-violet-400 uppercase tracking-wider">
            AI员工成长仪表板
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          AI Workforce Evolution Center
        </h1>
        <p className="text-slate-400 text-sm">
          AI员工通过项目实践 → 获取经验 → 能力评估 → 自动升级 → 服务更多项目
        </p>
      </motion.div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <ProfileCard data={before} colors={colors} label="之前 Before" muted />
        <div className="hidden md:flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5 text-violet-400" />
          </motion.div>
        </div>
        <ProfileCard data={after} colors={colors} label="之后 After" highlighted />
      </div>

      {/* Career Journey */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4">职业成长路径 Career Journey</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((p, i) => (
            <div key={p} className="flex items-center flex-shrink-0">
              <div className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${
                    p < 4
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                  }`}
                >
                  {p}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 whitespace-nowrap">项目{p}</p>
                <div className="flex gap-0.5 mt-0.5 justify-center">
                  {p < 4 ? (
                    <span className="text-[10px] text-slate-600">⭐⭐</span>
                  ) : (
                    <span className="text-[10px] text-violet-400">
                      {'⭐'.repeat(after.stars)}
                    </span>
                  )}
                </div>
              </div>
              {p < 4 && <div className="w-8 sm:w-16 h-px bg-slate-800 mx-1" />}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            初级顾问 <span className="text-slate-600">⭐⭐</span>
          </span>
          <span className="text-slate-600">→</span>
          <span className="text-violet-400 font-medium">
            {after.level} <span className="text-violet-500">{'⭐'.repeat(after.stars)}</span>
          </span>
        </div>
      </motion.div>

      {/* New Capabilities */}
      {after.capabilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3">新解锁能力 New Capabilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {after.capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3 flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-sm text-white">{cap}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Business Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ImpactCard
          icon={<Clock className="w-5 h-5" />}
          label="节省交付工时"
          value="1,200"
          unit="小时"
          color="violet"
          delay={0.1}
        />
        <ImpactCard
          icon={<Zap className="w-5 h-5" />}
          label="新增知识资产"
          value={`${knowledgeAdded + experiences.length}`}
          unit="个"
          color="purple"
          delay={0.2}
        />
        <ImpactCard
          icon={<Brain className="w-5 h-5" />}
          label="技能平均提升"
          value={`+${avgGain}`}
          unit="%"
          color="fuchsia"
          delay={0.3}
        />
      </div>

      {/* Extracted Experiences */}
      {experiences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-white mb-3">提取的项目经验 Lessons Learned</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-900/60 border border-slate-800 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 font-medium">
                    {exp.category}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">{exp.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{exp.content}</p>
              </div>
            ))}
          </div>
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

function ProfileCard({ data, colors, label, muted = false, highlighted = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: muted ? 0.1 : 0.4 }}
      className={`rounded-2xl border p-5 ${
        highlighted
          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
          : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs uppercase tracking-wider ${muted ? 'text-slate-600' : 'text-violet-400'}`}>
          {label}
        </span>
        {highlighted && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
            已升级
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
        >
          {data.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{data.name}</h3>
          <p className="text-xs text-slate-500 truncate">{data.role}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">等级</span>
          <span className={highlighted ? 'text-violet-400 font-medium' : 'text-slate-300'}>
            {data.level}{' '}
            <span className={highlighted ? 'text-violet-400' : 'text-slate-600'}>
              {'⭐'.repeat(data.stars)}
              {'☆'.repeat(5 - data.stars)}
            </span>
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">项目经验</span>
          <span className={highlighted ? 'text-white font-medium' : 'text-slate-300'}>
            {data.experience} 个项目
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">知识文档</span>
          <span className={highlighted ? 'text-white font-medium' : 'text-slate-300'}>
            {data.knowledge} 文档
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="pt-3 border-t border-slate-800/50">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">核心技能</p>
        <div className="space-y-2">
          {data.skills.map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">{skill.name}</span>
                <span className={highlighted ? 'text-violet-400 font-medium' : 'text-slate-500'}>
                  {skill.score}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 0.8, delay: (muted ? 0.2 : 0.5) + i * 0.1 }}
                  className={`h-full rounded-full ${
                    highlighted
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      {data.capabilities.length > 0 && (
        <div className="pt-3 mt-3 border-t border-slate-800/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">能力标签</p>
          <div className="flex flex-wrap gap-1.5">
            {data.capabilities.map((cap, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  highlighted
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {highlighted ? '✓ ' : ''}
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ImpactCard({ icon, label, value, unit, color, delay }) {
  const colorMap = {
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', iconBg: 'bg-violet-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
    fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', iconBg: 'bg-fuchsia-500/20' },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl ${c.bg} border ${c.border} p-5`}
    >
      <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {value}
        <span className="text-sm text-slate-400 ml-1">{unit}</span>
      </p>
    </motion.div>
  );
}