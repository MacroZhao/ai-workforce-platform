import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import AgentCard from '@/components/AgentCard';
import DeliverableCard from '@/components/DeliverableCard';
import KnowledgePanel from '@/components/KnowledgePanel';
import { getAgentConfig, DELIVERABLE_SCHEMA } from '@/lib/agentConfig';

export default function AgentCollaboration() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [allDone, setAllDone] = useState(false);
  const workAreaRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function runAgents() {
      try {
        const proj = await backendApi.entities.Project.get(projectId);
        setProject(proj);

        if (proj.deliverables && proj.deliverables.length > 0) {
          setDeliverables(proj.deliverables);
          setAllDone(true);
          return;
        }

        if (!proj.team_members || proj.team_members.length === 0) {
          navigate(`/team/${projectId}`);
          return;
        }

        const team = proj.team_members;
        const newDeliverables = [];

        for (let i = 0; i < team.length; i++) {
          setCurrentAgentIndex(i);

          const config = getAgentConfig(team[i].role);
          const response = await backendApi.integrations.Core.InvokeLLM({
            prompt: config.buildPrompt(proj.requirement, proj.industry, team[i].mission),
            response_json_schema: DELIVERABLE_SCHEMA,
          });

          const deliverable = {
            ...response,
            agent: team[i].name,
            icon: team[i].icon,
            color: team[i].color,
          };
          newDeliverables.push(deliverable);
          setDeliverables([...newDeliverables]);

          setTimeout(() => {
            if (workAreaRef.current) {
              workAreaRef.current.scrollTop = workAreaRef.current.scrollHeight;
            }
          }, 100);
        }

        await backendApi.entities.Project.update(projectId, {
          deliverables: newDeliverables,
          status: 'completed',
          confidence_score: 92,
          efficiency_gain: 35,
          knowledge_reuse: 70,
        });

        setAllDone(true);
      } catch (err) {
        console.error(err);
        setError(err.message || '智能体协作失败');
      }
    }
    runAgents();
  }, [projectId]);

  if (!project) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const team = project.team_members || [];
  const isWorking = currentAgentIndex >= 0 && currentAgentIndex < team.length && !allDone;

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{project.requirement}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-xs text-violet-300">
            {project.industry}
          </span>
        </div>
      </div>

      {/* Main layout: team sidebar + work area */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* AI Team sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">AI团队</h3>
          {team.map((agent, i) => (
            <div key={i}>
              <AgentCard
                agent={agent}
                compact
                index={i}
                status={
                  i < currentAgentIndex || allDone
                    ? 'completed'
                    : i === currentAgentIndex
                    ? 'working'
                    : 'idle'
                }
              />
              {i < team.length - 1 && (
                <div
                  className={`ml-6 w-px h-3 ${
                    i < currentAgentIndex ? 'bg-emerald-500/40' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Work area */}
        <div
          ref={workAreaRef}
          className="space-y-4 lg:max-h-[65vh] lg:overflow-y-auto lg:pr-2"
        >
          {/* Completed deliverables */}
          {deliverables.map((d, i) => (
            <DeliverableCard key={i} deliverable={d} index={i} />
          ))}

          {/* Current working agent */}
          {isWorking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {team[currentAgentIndex].icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{team[currentAgentIndex].name}</h4>
                  <p className="text-xs text-slate-500">{team[currentAgentIndex].role}</p>
                </div>
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin ml-auto" />
              </div>
              <div className="space-y-2">
                {[
                  '正在分析需求...',
                  '正在检索企业知识库...',
                  '正在生成交付物...',
                ].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All done */}
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/30 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">交付包已完成</h3>
              <p className="text-sm text-slate-400 mb-4">
                所有AI员工已完成各自交付物
              </p>
              <button
                onClick={() => navigate(`/dashboard/${projectId}`)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-violet-500/20"
              >
                查看交付包
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
              <p className="text-rose-400 text-sm mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge base panel */}
      <KnowledgePanel active={isWorking} />
    </div>
  );
}