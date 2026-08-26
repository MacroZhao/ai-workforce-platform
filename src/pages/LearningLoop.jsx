import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Award, TrendingUp } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import LearningAgentCard from '@/components/LearningAgentCard';
import { LEARNING_AGENTS, PERFORMANCE_REVIEW, AGENT_COLORS } from '@/lib/agentConfig';

const LEARNING_STEPS = [
  { key: 'experience', ...LEARNING_AGENTS.experience_mining, color: 'violet' },
  { key: 'knowledge', ...LEARNING_AGENTS.knowledge_curator, color: 'purple' },
  { key: 'skill', ...LEARNING_AGENTS.skill_assessment, color: 'fuchsia' },
  { key: 'evolution', ...LEARNING_AGENTS.employee_evolution, color: 'pink' },
];

export default function LearningLoop() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [results, setResults] = useState({});
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function runLearning() {
      try {
        const proj = await backendApi.entities.Project.get(projectId);
        setProject(proj);

        if (proj.learning_status === 'completed' && proj.experiences?.length > 0) {
          setResults({
            experiences: proj.experiences,
            knowledge_added: proj.knowledge_added,
            knowledge_docs: proj.knowledge_docs_added,
            skill_updates: proj.skill_updates,
            employee_upgrade: proj.employee_upgrade,
          });
          setAllDone(true);
          return;
        }

        const team = proj.team_members || [];
        const deliverables = proj.deliverables || [];
        const focusAgent = team[0] || { role: 'SAP Migration Expert' };

        // Step 1: Experience Mining
        setCurrentStep(0);
        const expRes = await backendApi.integrations.Core.InvokeLLM({
          prompt: LEARNING_AGENTS.experience_mining.buildPrompt(
            proj.requirement,
            proj.industry,
            deliverables
          ),
          response_json_schema: LEARNING_AGENTS.experience_mining.schema,
        });
        setResults((r) => ({ ...r, experiences: expRes.experiences }));

        // Step 2: Knowledge Curator
        setCurrentStep(1);
        const knowledgeRes = await backendApi.integrations.Core.InvokeLLM({
          prompt: LEARNING_AGENTS.knowledge_curator.buildPrompt(
            proj.industry,
            expRes.experiences
          ),
          response_json_schema: LEARNING_AGENTS.knowledge_curator.schema,
        });
        setResults((r) => ({
          ...r,
          knowledge_added: knowledgeRes.knowledge_added,
          knowledge_docs: knowledgeRes.knowledge_docs,
        }));

        // Step 3: Skill Assessment
        setCurrentStep(2);
        const skillRes = await backendApi.integrations.Core.InvokeLLM({
          prompt: LEARNING_AGENTS.skill_assessment.buildPrompt(
            focusAgent.role,
            deliverables
          ),
          response_json_schema: LEARNING_AGENTS.skill_assessment.schema,
        });
        setResults((r) => ({ ...r, skill_updates: skillRes.skill_updates }));

        // Step 4: Employee Evolution
        setCurrentStep(3);
        const evoRes = await backendApi.integrations.Core.InvokeLLM({
          prompt: LEARNING_AGENTS.employee_evolution.buildPrompt(
            focusAgent.role,
            proj.industry
          ),
          response_json_schema: LEARNING_AGENTS.employee_evolution.schema,
        });
        setResults((r) => ({ ...r, employee_upgrade: evoRes }));

        // Save to project
        await backendApi.entities.Project.update(projectId, {
          experiences: expRes.experiences,
          knowledge_added: knowledgeRes.knowledge_added,
          knowledge_docs_added: knowledgeRes.knowledge_docs,
          skill_updates: skillRes.skill_updates,
          employee_upgrade: evoRes,
          learning_status: 'completed',
        });

        setAllDone(true);
      } catch (err) {
        console.error(err);
        setError(err.message || '学习闭环执行失败');
      }
    }
    runLearning();
  }, [projectId]);

  if (!project) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getStatus = (i) => {
    if (allDone) return 'completed';
    if (i < currentStep) return 'completed';
    if (i === currentStep) return 'working';
    return 'waiting';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-medium text-violet-400 uppercase tracking-wider">
            AI员工学习成长闭环
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">AI Learning Engine</h1>
        <p className="text-slate-400 text-sm">
          项目交付完成，AI员工开始从项目实践中学习、更新知识库、提升能力等级
        </p>
      </motion.div>

      {/* Performance Review */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          AI员工绩效评估
          <span className="text-xs text-slate-500 font-normal">Performance Review</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ReviewMetric label="任务准确率" value={`${PERFORMANCE_REVIEW.task_accuracy}%`} trend="up" />
          <ReviewMetric label="方案质量" value={`${PERFORMANCE_REVIEW.solution_quality}%`} trend="up" />
          <ReviewMetric label="客户反馈" value={PERFORMANCE_REVIEW.customer_feedback} />
          <ReviewMetric
            label="专家评分"
            value={`${PERFORMANCE_REVIEW.human_score}/5`}
          />
        </div>
      </motion.div>

      {/* Learning Pipeline */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          AI学习引擎工作流
        </h3>

        <div className="space-y-0">
          {LEARNING_STEPS.map((step, i) => (
            <div key={step.key}>
              <LearningAgentCard step={step} status={getStatus(i)} index={i} />

              {/* Output display */}
              {getStatus(i) === 'completed' && step.key === 'experience' && results.experiences && (
                <OutputContainer>
                  <p className="text-xs text-slate-500 mb-3">
                    提取了 {results.experiences.length} 条可复用经验
                  </p>
                  <div className="space-y-2">
                    {results.experiences.map((exp, j) => (
                      <div
                        key={j}
                        className="rounded-lg bg-slate-950/40 border border-slate-800/50 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 font-medium">
                            {exp.category}
                          </span>
                          <span className="text-xs font-medium text-white">{exp.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{exp.content}</p>
                      </div>
                    ))}
                  </div>
                </OutputContainer>
              )}

              {getStatus(i) === 'completed' && step.key === 'knowledge' && results.knowledge_docs && (
                <OutputContainer>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-purple-400">
                      +{results.knowledge_added}
                    </span>
                    <span className="text-xs text-slate-500">新增知识文档</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.knowledge_docs.map((doc, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300"
                      >
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    知识库：120 文档 → <span className="text-purple-400 font-medium">120 + {results.knowledge_added} = {120 + results.knowledge_added} 文档</span>
                  </div>
                </OutputContainer>
              )}

              {getStatus(i) === 'completed' && step.key === 'skill' && results.skill_updates && (
                <OutputContainer>
                  <p className="text-xs text-slate-500 mb-3">能力评估结果</p>
                  <div className="space-y-3">
                    {results.skill_updates.map((skill, j) => (
                      <SkillBar key={j} skill={skill} index={j} />
                    ))}
                  </div>
                </OutputContainer>
              )}

              {getStatus(i) === 'completed' && step.key === 'evolution' && results.employee_upgrade && (
                <OutputContainer>
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {results.employee_upgrade.new_level}
                    </h4>
                    <div className="flex justify-center gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={
                            j < (results.employee_upgrade.new_level_stars || 4)
                              ? 'text-pink-400'
                              : 'text-slate-700'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                      {results.employee_upgrade.reason}
                    </p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      新解锁能力
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {results.employee_upgrade.new_capabilities?.map((cap, j) => (
                        <span
                          key={j}
                          className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300 flex items-center gap-1"
                        >
                          ✓ {cap}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </OutputContainer>
              )}

              {/* Connector */}
              {i < LEARNING_STEPS.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown
                    className={`w-4 h-4 ${
                      getStatus(i) === 'completed' ? 'text-violet-500' : 'text-slate-800'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-center">
            <p className="text-rose-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* All done */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/30 p-6 text-center mt-6"
          >
            <h3 className="text-lg font-semibold text-white mb-1">学习闭环完成</h3>
            <p className="text-sm text-slate-400 mb-4">
              AI员工已完成项目经验学习，能力等级已提升
            </p>
            <button
              onClick={() => navigate(`/growth/${projectId}`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              查看成长仪表板
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OutputContainer({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="ml-6 mt-2 mb-2 pl-4 border-l-2 border-slate-800"
    >
      <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-4">{children}</div>
    </motion.div>
  );
}

function ReviewMetric({ label, value, trend }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-xl font-bold text-white">{value}</p>
        {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
      </div>
    </div>
  );
}

function SkillBar({ skill, index }) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-300">{skill.name}</span>
        <span className="text-slate-500">
          {skill.before}% → <span className="text-fuchsia-400 font-medium">{skill.after}%</span>
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className="absolute h-full bg-slate-700 rounded-full"
          style={{ width: `${skill.before}%` }}
        />
        <motion.div
          initial={{ width: `${skill.before}%` }}
          animate={{ width: `${skill.after}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          className="absolute h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full"
        />
      </div>
    </div>
  );
}