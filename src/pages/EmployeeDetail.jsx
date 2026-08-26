import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, TrendingUp, Award, GraduationCap, Check, Loader2, Sparkles,
  Share2, BookOpen, Bell, Copy, X, Link2, Pencil,
} from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import { AGENT_COLORS, EMPLOYEE_TRAINING_PROMPT, EMPLOYEE_TRAINING_SCHEMA } from '@/lib/agentConfig';

const STATUS_MAP = {
  available: { label: '在岗', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  training: { label: '训练中', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  assigned: { label: '已分配', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  certified: { label: '已认证', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
};

const TRAINING_STEPS = [
  { label: '分析项目', icon: '🔍' },
  { label: '提取经验', icon: '💡' },
  { label: '更新知识', icon: '📚' },
  { label: '技能评估', icon: '📊' },
];

export default function EmployeeDetail() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingResults, setTrainingResults] = useState(null);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [knowledgeAssets, setKnowledgeAssets] = useState([]);
  const [subscribedSources, setSubscribedSources] = useState([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [editingPersona, setEditingPersona] = useState(false);
  const [personaDraft, setPersonaDraft] = useState('');
  const [savingPersona, setSavingPersona] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const emp = await backendApi.entities.AIEmployee.get(employeeId);
        setEmployee(emp);
        setSubscribedSources(emp.knowledge_sources || []);
        setLoadingKnowledge(true);
        try {
          const list = await backendApi.entities.KnowledgeAsset.filter(
            { status: 'published' },
            '-updated_date',
            20
          );
          setKnowledgeAssets(list);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingKnowledge(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [employeeId]);

  const toggleSubscribe = async (assetName) => {
    const newSources = subscribedSources.includes(assetName)
      ? subscribedSources.filter((s) => s !== assetName)
      : [...subscribedSources, assetName];
    setSubscribedSources(newSources);
    try {
      await backendApi.entities.AIEmployee.update(employeeId, { knowledge_sources: newSources });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePersona = async () => {
    setSavingPersona(true);
    try {
      await backendApi.entities.AIEmployee.update(employeeId, { persona: personaDraft });
      setEmployee((e) => ({ ...e, persona: personaDraft }));
      setEditingPersona(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPersona(false);
    }
  };

  const startTraining = async () => {
    setTraining(true);
    setTrainingResults(null);
    setTrainingStep(0);
    setError(null);

    const timers = [];
    for (let i = 0; i < 4; i++) {
      timers.push(setTimeout(() => setTrainingStep(i + 1), (i + 1) * 900));
    }

    try {
      const result = await backendApi.integrations.Core.InvokeLLM({
        prompt: EMPLOYEE_TRAINING_PROMPT(
          employee.name,
          employee.role,
          employee.skills || [],
          employee.industries || [],
          subscribedSources
        ),
        response_json_schema: EMPLOYEE_TRAINING_SCHEMA,
      });
      setTrainingResults(result);

      const updatedSkills = (result.skill_updates || []).map((s) => ({ name: s.name, score: s.after }));
      await backendApi.entities.AIEmployee.update(employeeId, {
        skills: updatedSkills,
        knowledge_count: (employee.knowledge_count || 0) + (result.knowledge_added || 15),
        experience_count: (employee.experience_count || 0) + 1,
        capabilities: [...(employee.capabilities || []), ...(result.new_capabilities || [])],
        accuracy: Math.min(96, (employee.accuracy || 85) + 3),
        human_score: Math.min(5, (employee.human_score || 4.2) + 0.1),
      });
      setEmployee((e) => ({
        ...e,
        skills: updatedSkills,
        knowledge_count: (e.knowledge_count || 0) + (result.knowledge_added || 15),
        experience_count: (e.experience_count || 0) + 1,
        capabilities: [...(e.capabilities || []), ...(result.new_capabilities || [])],
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || '训练失败');
    } finally {
      timers.forEach(clearTimeout);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return <div className="text-center py-24 text-slate-400">AI员工未找到</div>;
  }

  const colors = AGENT_COLORS[employee.color] || AGENT_COLORS.violet;
  const status = STATUS_MAP[employee.status] || STATUS_MAP.available;
  const knowledgeHistory = [
    { month: '1月', value: Math.round((employee.knowledge_count || 200) * 0.4) },
    { month: '2月', value: Math.round((employee.knowledge_count || 200) * 0.7) },
    { month: '3月', value: employee.knowledge_count || 200 },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回管理中心
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-3xl flex-shrink-0`}>
            {employee.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1">{employee.name}</h1>
            <p className={`text-sm ${colors.text} mb-2`}>{employee.role}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full border ${status.color} font-medium`}>
                {status.label}
              </span>
              <span className="text-slate-400">
                {employee.level} <span className={colors.text}>{'★'.repeat(employee.level_stars || 2)}</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{employee.experience_count || 0} 个项目</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{employee.knowledge_count || 0} 文档</span>
            </div>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            分享
          </button>
        </div>
        {employee.domain && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">专业领域</p>
            <p className="text-sm text-slate-300">{employee.domain}</p>
          </div>
        )}
        {employee.industries?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {employee.industries.map((ind, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800/60 text-xs text-slate-300">
                {ind}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Skills + Knowledge Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skills */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">核心技能 Skills</h3>
          <div className="space-y-3">
            {(employee.skills || []).map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{skill.name}</span>
                  <span className={colors.text}>{skill.score}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Growth */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            知识增长 Knowledge Growth
          </h3>
          <div className="flex items-end justify-between h-32 gap-3">
            {knowledgeHistory.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">{item.value}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / knowledgeHistory[2].value) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  className={`w-full rounded-t-lg bg-gradient-to-t ${colors.gradient} min-h-[8px]`}
                />
                <span className="text-xs text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Award className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">任务准确率</p>
            <p className="text-xl font-bold text-white">{employee.accuracy || 0}%</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">专家评分</p>
            <p className="text-xl font-bold text-white">{(employee.human_score || 0).toFixed(1)}/5</p>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      {employee.capabilities?.length > 0 && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">能力标签 Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {employee.capabilities.map((cap, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Persona */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            专家人格 Expert Persona
          </h3>
          {!editingPersona && (
            <button
              onClick={() => {
                setPersonaDraft(employee.persona || '');
                setEditingPersona(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {employee.persona ? '编辑' : '添加'}
            </button>
          )}
        </div>
        {editingPersona ? (
          <div className="space-y-3">
            <textarea
              value={personaDraft}
              onChange={(e) => setPersonaDraft(e.target.value)}
              placeholder="描述该AI员工的专家人格、行为风格与专业定位..."
              className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPersona(false)}
                disabled={savingPersona}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors disabled:opacity-40"
              >
                取消
              </button>
              <button
                onClick={handleSavePersona}
                disabled={savingPersona}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all"
              >
                {savingPersona ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        ) : employee.persona ? (
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap rounded-lg bg-slate-950/40 p-4 border border-slate-800/50">
            {employee.persona}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-6 rounded-lg bg-slate-950/40 border border-slate-800/50">
            暂未设置专家人格，点击"添加"开始配置
          </div>
        )}
      </div>

      {/* Knowledge Subscription */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-fuchsia-400" />
          知识库订阅 Knowledge Subscription
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          从知识大脑市场选择知识添加，启动训练时将自动引入已订阅知识
        </p>
        {loadingKnowledge ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : knowledgeAssets.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">暂无可订阅的知识资产</div>
        ) : (
          <div className="space-y-2">
            {knowledgeAssets.map((asset) => {
              const subscribed = subscribedSources.includes(asset.name);
              return (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2.5"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{asset.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {asset.category || asset.type} · {asset.version}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSubscribe(asset.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 shrink-0 ${
                      subscribed
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-violet-500/40 hover:text-white'
                    }`}
                  >
                    {subscribed ? (
                      <>
                        <Check className="w-3 h-3" /> 已订阅
                      </>
                    ) : (
                      <>
                        <Bell className="w-3 h-3" /> 订阅
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Training Section */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              学习训练 Learning Loop
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">通过项目经验训练提升AI员工能力</p>
          </div>
          {!training && !trainingResults && (
            <button
              onClick={startTraining}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-medium text-sm transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              启动学习训练
            </button>
          )}
        </div>

        {/* Training in progress */}
        {training && !trainingResults && (
          <div className="space-y-3">
            {TRAINING_STEPS.map((step, i) => {
              const done = trainingStep > i;
              const current = trainingStep === i + 1 || (trainingStep === 0 && i === 0);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      done ? 'bg-emerald-500/20' : current ? 'bg-violet-500/20' : 'bg-slate-800'
                    }`}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : current ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    ) : (
                      <span className="text-slate-600 text-xs">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${done ? 'text-slate-400' : current ? 'text-white' : 'text-slate-600'}`}>
                    {step.label}
                  </span>
                  {done && (
                    <div className="flex-1 h-1 bg-emerald-500/20 rounded-full ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Training results */}
        {trainingResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-sm font-semibold text-white">训练完成！AI员工能力已提升</p>
            </div>

            {/* Before/After skills */}
            {trainingResults.skill_updates?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">技能提升</p>
                <div className="space-y-2">
                  {trainingResults.skill_updates.map((skill, i) => (
                    <div key={i} className="rounded-lg bg-slate-950/40 border border-slate-800/50 p-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">{skill.name}</span>
                        <span className="text-slate-500">
                          {skill.before}% → <span className="text-violet-400 font-medium">{skill.after}%</span>
                          <span className="text-emerald-400 ml-1">↑</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                        <div className="absolute h-full bg-slate-700 rounded-full" style={{ width: `${skill.before}%` }} />
                        <motion.div
                          initial={{ width: `${skill.before}%` }}
                          animate={{ width: `${skill.after}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="absolute h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New capabilities */}
            {trainingResults.new_capabilities?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">新解锁能力</p>
                <div className="flex flex-wrap gap-2">
                  {trainingResults.new_capabilities.map((cap, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 flex items-center gap-1">
                      🔥 {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge added */}
            {trainingResults.knowledge_added > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">新增知识文档：</span>
                <span className="text-emerald-400 font-medium">+{trainingResults.knowledge_added}</span>
              </div>
            )}

            <button
              onClick={() => {
                setTrainingResults(null);
                setTraining(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            >
              完成训练
            </button>
          </motion.div>
        )}

        {error && (
          <div className="text-center text-sm text-rose-400 py-4">{error}</div>
        )}
      </div>

      {/* Share Modal */}
      {showShare && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setShowShare(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">分享AI员工</h3>
              <button
                onClick={() => setShowShare(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-2xl shrink-0`}
              >
                {employee.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{employee.name}</div>
                <div className={`text-xs ${colors.text} truncate`}>{employee.role}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2.5">
                <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="flex-1 text-xs text-slate-400 truncate">
                  {window.location.origin}/employees/{employee.id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${window.location.origin}/employees/${employee.id}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 复制链接
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '邮件', icon: '📧' },
                  { label: '微信', icon: '💬' },
                  { label: '二维码', icon: '📄' },
                  { label: '团队', icon: '👥' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    className="rounded-lg bg-slate-800/60 border border-slate-700 hover:border-violet-500/40 hover:text-white py-3 text-xs text-slate-300 transition-colors flex flex-col items-center gap-1"
                  >
                    <span className="text-lg">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}