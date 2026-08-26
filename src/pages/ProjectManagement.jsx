import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, ArrowLeft, Plus, Users, FileText,
  Trash2, Edit3, Eye, X, Check, Loader2, AlertCircle,
} from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';

const STATUS_MAP = {
  draft: { label: '草稿', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  team_formed: { label: '团队已组建', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  in_progress: { label: '进行中', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  completed: { label: '已完成', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

export default function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await backendApi.entities.Project.list('-updated_date', 50);
      setProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    try {
      const updated = await backendApi.entities.Project.update(editingProject.id, {
        project_name: editingProject.project_name,
        requirement: editingProject.requirement,
        industry: editingProject.industry,
      });
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProject(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (project, index) => {
    const newMembers = project.team_members.filter((_, i) => i !== index);
    const updated = await backendApi.entities.Project.update(project.id, { team_members: newMembers });
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await backendApi.entities.Project.delete(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-violet-400" />
              项目管理
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">管理所有AI劳动力项目，支持修改需求、调整团队、重新生成</p>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </Link>
      </div>

      {/* Project list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">暂无项目</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 text-sm hover:bg-violet-500/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project, i) => {
            const status = STATUS_MAP[project.status] || STATUS_MAP.draft;
            const teamCount = project.team_members?.length || 0;
            const deliverableCount = project.deliverables?.length || 0;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5"
              >
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {project.project_name || project.requirement?.slice(0, 40) || '未命名项目'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.requirement}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium shrink-0 ml-2 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  {project.industry && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px]">
                      {project.industry}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {teamCount} 员工
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {deliverableCount} 交付物
                  </span>
                </div>

                {/* Team preview */}
                {teamCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.team_members.slice(0, 5).map((m, j) => (
                      <span
                        key={j}
                        onClick={() => handleRemoveMember(project, j)}
                        className="group inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/60 text-[10px] text-slate-300 cursor-pointer hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="点击移除"
                      >
                        {m.icon} {m.name}
                        <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                      </span>
                    ))}
                    {teamCount > 5 && (
                      <span className="px-2 py-1 rounded-full bg-slate-800/60 text-[10px] text-slate-500">
                        +{teamCount - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-xs text-violet-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> 查看
                  </button>
                  <button
                    onClick={() => setEditingProject({ ...project })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> 编辑
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-400 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingProject && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setEditingProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">编辑项目</h3>
                <button onClick={() => setEditingProject(null)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">项目名称</label>
                  <input
                    value={editingProject.project_name || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, project_name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">项目需求</label>
                  <textarea
                    value={editingProject.requirement || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, requirement: e.target.value })}
                    className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">行业</label>
                  <input
                    value={editingProject.industry || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-300">保存后可在项目详情页点击"重新生成"以更新团队和交付物</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" /> 保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">确认删除项目？</h3>
              <p className="text-xs text-slate-500 mb-5">
                "{deleteTarget.project_name || deleteTarget.requirement?.slice(0, 30)}"及其所有团队和交付物将被永久删除
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}