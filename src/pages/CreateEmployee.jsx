import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, Link2 } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import {
  EMPLOYEE_ROLES,
  EMPLOYEE_LEVELS,
  EMPLOYEE_INDUSTRIES,
  EMPLOYEE_SKILLS,
  EMPLOYEE_CREATION_PROMPT,
  EMPLOYEE_CREATION_SCHEMA,
  AGENT_COLORS,
} from '@/lib/agentConfig';
import KnowledgeSourcePicker from '@/components/KnowledgeSourcePicker';

const STEP_LABELS = ['选择角色', '定义能力', '加载知识', '生成人格', '创建完成'];
const CONNECTORS = [
  { name: 'Confluence', icon: '📕' },
  { name: 'SharePoint', icon: '📁' },
  { name: 'Jira', icon: '🔘' },
  { name: 'GitLab', icon: '🦊' },
];

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: '',
    name: '',
    domain: '',
    level: '初级顾问',
    levelStars: 2,
    industries: [],
    skills: [],
    knowledgeSources: [],
    connectors: [],
  });
  const [persona, setPersona] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [creating, setCreating] = useState(false);

  const selectedRole = EMPLOYEE_ROLES.find((r) => r.role === form.role);

  const toggleArrayItem = (key, value) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  const toggleKnowledgeSource = (asset) => {
    setForm((f) => ({
      ...f,
      knowledgeSources: f.knowledgeSources.includes(asset.name)
        ? f.knowledgeSources.filter((n) => n !== asset.name)
        : [...f.knowledgeSources, asset.name],
    }));
  };

  // Step 3 → 4: processing animation
  const handleStep3Next = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(4);
    }, 2000);
  };

  // Step 4: generate persona via LLM
  useEffect(() => {
    if (step !== 4 || persona || generating) return;
    async function generate() {
      setGenerating(true);
      try {
        const result = await backendApi.integrations.Core.InvokeLLM({
          prompt: EMPLOYEE_CREATION_PROMPT(form.role, form.domain, form.level, form.skills, form.industries),
          response_json_schema: EMPLOYEE_CREATION_SCHEMA,
        });
        setPersona(result);
      } catch (err) {
        console.error(err);
        setPersona({
          persona: `您是${form.name || form.role}。您拥有深厚的${form.domain}专业知识。您始终遵循最佳实践方法论，关注业务影响，提供风险评估，并参考过往项目经验。`,
          initial_skills: form.skills.slice(0, 4).map((s) => ({ name: s, score: 50 + Math.floor(Math.random() * 20) })),
          capabilities: ['基础交付能力'],
        });
      } finally {
        setGenerating(false);
      }
    }
    generate();
  }, [step]);

  // Step 5: create employee
  const handleCreate = async () => {
    setCreating(true);
    try {
      const roleConfig = selectedRole || EMPLOYEE_ROLES[0];
      const employee = await backendApi.entities.AIEmployee.create({
        name: form.name,
        role: form.role,
        domain: form.domain,
        icon: roleConfig.icon,
        color: roleConfig.color,
        category: roleConfig.category,
        level: form.level,
        level_stars: form.levelStars,
        status: 'available',
        industries: form.industries,
        skills: persona?.initial_skills || form.skills.map((s) => ({ name: s, score: 50 })),
        capabilities: persona?.capabilities || ['基础交付能力'],
        knowledge_count: 200 + form.knowledgeSources.length * 30,
        experience_count: 0,
        accuracy: 85,
        human_score: 4.2,
        persona: persona?.persona || '',
        knowledge_sources: form.knowledgeSources,
      });
      setCreatedEmployee(employee);
      setStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!form.role;
    if (step === 2) return !!form.name && !!form.domain && form.skills.length > 0;
    if (step === 3) return true;
    if (step === 4) return !!persona;
    return false;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/employees" className="text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">创建AI员工</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-[10px] whitespace-nowrap ${isCurrent ? 'text-white' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${stepNum < step ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 min-h-[300px]">
        {/* Step 1: Choose Role */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">选择员工类型</h2>
            <p className="text-sm text-slate-400 mb-4">Choose Role</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMPLOYEE_ROLES.map((r) => {
                const colors = AGENT_COLORS[r.color] || AGENT_COLORS.violet;
                const selected = form.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setForm((f) => ({ ...f, role: r.role }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                      {r.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.role}</p>
                    </div>
                    {selected && <Check className={`w-4 h-4 ${colors.text} ml-auto`} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Define Capabilities */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">定义专业能力</h2>
              <p className="text-sm text-slate-400">Define Capabilities</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="例如：SAP迁移专家AI"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">专业领域</label>
              <input
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                placeholder="例如：SAP S/4HANA转型"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">经验等级</label>
              <div className="flex gap-2">
                {EMPLOYEE_LEVELS.map((lvl) => {
                  const selected = form.level === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      onClick={() => setForm((f) => ({ ...f, level: lvl.value, levelStars: lvl.stars }))}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        selected
                          ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl.label}
                      <span className="ml-1.5 text-xs">{'★'.repeat(lvl.stars)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">行业领域</label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYEE_INDUSTRIES.map((ind) => {
                  const selected = form.industries.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => toggleArrayItem('industries', ind)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selected
                          ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {selected && '✓ '}{ind}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">技能标签</label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYEE_SKILLS.map((skill) => {
                  const selected = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleArrayItem('skills', skill)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selected
                          ? 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {selected && '✓ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Load Knowledge */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">加载专家知识</h2>
              <p className="text-sm text-slate-400">Load Knowledge Sources</p>
            </div>
            {processing ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-sm text-white mb-4">正在处理知识源...</p>
                <div className="flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5 text-violet-400">
                    <Check className="w-3 h-3" /> Chunking
                  </div>
                  <div className="flex items-center gap-1.5 text-violet-400">
                    <Check className="w-3 h-3" /> Embedding
                  </div>
                  <div className="flex items-center gap-1.5 text-violet-400 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> RAG Index
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    知识来源
                    <span className="text-slate-600 normal-case tracking-normal ml-1">
                      （从知识市场、文档管理、项目沉淀中选择）
                    </span>
                  </label>
                  <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-4">
                    <KnowledgeSourcePicker
                      selected={form.knowledgeSources}
                      onToggle={toggleKnowledgeSource}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">连接知识源</label>
                  <div className="flex flex-wrap gap-2">
                    {CONNECTORS.map((conn) => {
                      const selected = form.connectors.includes(conn.name);
                      return (
                        <button
                          key={conn.name}
                          onClick={() => toggleArrayItem('connectors', conn.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                            selected
                              ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                              : 'border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          {conn.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-slate-500 bg-slate-950/40 rounded-lg p-3 border border-slate-800/50">
                  系统将自动执行：文档分块（Chunking）→ 向量化（Embedding）→ RAG索引
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Initialize Persona */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">初始化Expert Persona</h2>
              <p className="text-sm text-slate-400">Initialize Expert Persona</p>
            </div>
            {generating ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400">AI正在生成专家人格...</p>
              </div>
            ) : persona ? (
              <>
                <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/5 flex items-center justify-center text-xl">
                      {selectedRole?.icon || '🤖'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{form.name}</p>
                      <p className="text-xs text-slate-500">{form.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {persona.persona}
                  </div>
                </div>
                {persona.initial_skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">初始技能评估</p>
                    <div className="space-y-2">
                      {persona.initial_skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-24 truncate">{skill.name}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${skill.score}%` }} />
                          </div>
                          <span className="text-xs text-violet-400 w-8 text-right">{skill.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {persona.capabilities?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">基础能力</p>
                    <div className="flex flex-wrap gap-2">
                      {persona.capabilities.map((cap, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
                          ✓ {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Step 5: Created */}
        {step === 5 && createdEmployee && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">AI员工创建成功！</h2>
            <p className="text-sm text-slate-400 mb-6">AI Employee Created</p>
            <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5 max-w-sm mx-auto text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/5 flex items-center justify-center text-2xl">
                  {createdEmployee.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{createdEmployee.name}</p>
                  <p className="text-xs text-slate-500">{createdEmployee.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">等级</span>
                  <span className="text-violet-400">{createdEmployee.level} {'★'.repeat(createdEmployee.level_stars)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">知识文档</span>
                  <span className="text-white">{createdEmployee.knowledge_count} 文档</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">状态</span>
                  <span className="text-emerald-400">就绪</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <Link
                to={`/employees/${createdEmployee.id}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm"
              >
                查看员工档案
              </Link>
              <Link
                to="/employees"
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium text-sm"
              >
                返回管理中心
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 5 && (
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || processing}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          {step < 4 && (
            <button
              onClick={() => (step === 3 ? handleStep3Next() : setStep((s) => s + 1))}
              disabled={!canProceed() || processing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  下一步
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
          {step === 4 && (
            <button
              onClick={handleCreate}
              disabled={!canProceed() || creating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  创建AI员工
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}