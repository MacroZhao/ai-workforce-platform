import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Brain, Target, Plus, FileText } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import AgentCard from '@/components/AgentCard';
import EmployeePicker from '@/components/EmployeePicker';
import { TEAM_FORMATION_PROMPT, TEAM_FORMATION_SCHEMA } from '@/lib/agentConfig';

export default function TeamFormation() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeam, setShowTeam] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function loadAndForm() {
      try {
        const proj = await backendApi.entities.Project.get(projectId);
        setProject(proj);

        if (proj.team_members && proj.team_members.length > 0) {
          setShowTeam(true);
          setLoading(false);
          return;
        }

        const response = await backendApi.integrations.Core.InvokeLLM({
          prompt: `${TEAM_FORMATION_PROMPT}\n\n项目名称：${proj.project_name || '（未提供，请自动生成）'}\n\n项目需求：${proj.requirement}`,
          response_json_schema: TEAM_FORMATION_SCHEMA,
          ...(proj.requirement_doc_url ? { file_urls: [proj.requirement_doc_url] } : {}),
        });

        const updated = await backendApi.entities.Project.update(projectId, {
          project_name: response.project_name || proj.project_name || '',
          project_summary: response.project_summary,
          industry: response.industry,
          mission: response.mission,
          team_members: response.team_members,
          status: 'team_formed',
        });
        setProject(updated);

        setTimeout(() => {
          setShowTeam(true);
          setLoading(false);
        }, 600);
      } catch (err) {
        console.error(err);
        setError(err.message || 'AI团队组建失败');
        setLoading(false);
      }
    }
    loadAndForm();
  }, [projectId]);

  const handleAddEmployees = async (selected) => {
    const newMembers = [...(project.team_members || []), ...selected];
    const updated = await backendApi.entities.Project.update(projectId, { team_members: newMembers });
    setProject(updated);
    setShowPicker(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-violet-500/30 border-t-violet-500 mb-6"
        />
        <h2 className="text-xl font-semibold text-white mb-2">AI劳动力管家</h2>
        <p className="text-slate-400 text-sm">
          正在分析需求并组建专家团队...
        </p>
        <div className="mt-8 space-y-2.5">
          {['理解项目范围', '选择所需专家', '分配任务'].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5 }}
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-rose-400 mb-4 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    );
  }

  const team = project?.team_members || [];

  return (
    <div>
      {/* Project summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
            {project.project_name || '项目需求'}
          </span>
        </div>
        <p className="text-slate-200 mb-3 text-sm leading-relaxed">{project.requirement}</p>
        {project.requirement_doc_url && (
          <div className="flex items-center gap-2 mb-3 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2">
            <FileText className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-xs text-slate-300 truncate">
              {project.requirement_doc_name || '需求文档'}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
            {project.industry}
          </span>
        </div>
      </motion.div>

      {/* Mission */}
      {project.mission && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
            <Target className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-sm text-purple-300">
              <span className="text-purple-500 font-medium">任务：</span>
              {project.mission}
            </span>
          </div>
        </motion.div>
      )}

      {/* Team grid */}
      <AnimatePresence>
        {showTeam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              AI劳动力已创建
              <span className="text-sm text-slate-500 font-normal">
                （{team.length}名AI员工已激活）
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((agent, i) => (
                <AgentCard key={i} agent={agent} index={i} />
              ))}
            </div>

            {showTeam && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowPicker(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  从AI员工中心添加
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showPicker && (
        <EmployeePicker
          existingMembers={team}
          onAdd={handleAddEmployees}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Start mission button */}
      {showTeam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: team.length * 0.2 + 0.5 }}
          className="flex justify-center mt-10"
        >
          <button
            onClick={() => navigate(`/collaboration/${projectId}`)}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            开始任务
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}