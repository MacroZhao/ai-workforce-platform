import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, PackageSearch, Bot, Award, BrainCircuit, GitBranch, BellRing,
  Check, Loader2, ArrowRight, FolderGit2
} from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import { SYNC_STEPS } from '@/lib/knowledgeConfig';

const SYNC_ICONS = { Flag, PackageSearch, Bot, Award, BrainCircuit, GitBranch, BellRing };
const INTEGRATIONS = ['GitLab', 'Jira', 'Confluence', 'Azure DevOps', 'SharePoint', 'SAP Solution Manager'];

export default function ProjectSyncSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingProject, setSyncingProject] = useState(null);
  const [syncStep, setSyncStep] = useState(-1);
  const [syncedIds, setSyncedIds] = useState(new Set());

  useEffect(() => {
    async function load() {
      try {
        const list = await backendApi.entities.Project.filter({ status: 'completed' }, '-updated_date', 10);
        setProjects(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const startSync = (project) => {
    setSyncingProject(project);
    setSyncStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step >= SYNC_STEPS.length) {
        clearInterval(timer);
        setSyncStep(SYNC_STEPS.length - 1);
        setTimeout(() => {
          setSyncedIds((prev) => new Set([...prev, project.id]));
          setSyncingProject(null);
          setSyncStep(-1);
        }, 1000);
      } else {
        setSyncStep(step);
      }
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">项目知识沉淀</h1>
          <p className="text-sm text-slate-400 mt-1">
            项目关闭后自动收集交付物，经Knowledge Curator AI审核，提炼最佳实践沉淀至知识大脑
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs border border-violet-500/30">
          ⭐ 核心创新
        </span>
      </div>

      {/* Integrations */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-4">
        <div className="text-xs text-slate-400 mb-2">已对接的项目源</div>
        <div className="flex flex-wrap gap-2">
          {INTEGRATIONS.map((name) => (
            <span key={name} className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Sync pipeline visualization */}
      <AnimatePresence>
        {syncingProject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/30 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <h3 className="text-sm font-semibold text-white">
                正在沉淀项目知识 · {syncingProject.requirement?.slice(0, 30)}...
              </h3>
            </div>
            <div className="space-y-2">
              {SYNC_STEPS.map((step, i) => {
                const Icon = SYNC_ICONS[step.icon] || Flag;
                const done = i < syncStep;
                const active = i === syncStep;
                return (
                  <div key={step.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    done ? 'bg-emerald-500/10 border-emerald-500/30' :
                    active ? 'bg-violet-500/15 border-violet-500/40' :
                    'bg-slate-900/40 border-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      done ? 'bg-emerald-500/20' : active ? 'bg-violet-500/20' : 'bg-slate-800'
                    }`}>
                      {done ? <Check className="w-4 h-4 text-emerald-400" /> :
                       active ? <Loader2 className="w-4 h-4 text-violet-400 animate-spin" /> :
                       <Icon className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${done ? 'text-emerald-300' : active ? 'text-violet-300' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed projects */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">可沉淀项目</h3>
          </div>
          <span className="text-xs text-slate-500">{projects.length} 个已完成项目</span>
        </div>
        {loading ? (
          <div className="px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            暂无已完成项目，请先在AI Project Workspace中完成一个项目交付
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {projects.map((p) => {
              const synced = syncedIds.has(p.id);
              const deliverableCount = p.deliverables?.length || 0;
              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{p.requirement?.slice(0, 60)}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      {p.industry && <span>{p.industry}</span>}
                      <span>· {deliverableCount} 项交付物</span>
                    </div>
                  </div>
                  {synced ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/30 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> 已沉淀
                    </span>
                  ) : (
                    <button
                      onClick={() => startSync(p)}
                      disabled={!!syncingProject}
                      className="px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs border border-violet-500/30 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                    >
                      沉淀知识 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}