import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FolderKanban, Users, FileText, RefreshCw, Plus, X,
  Check, Loader2, AlertCircle, Trash2, UploadCloud, Eye,
} from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import { TEAM_FORMATION_PROMPT, TEAM_FORMATION_SCHEMA } from '@/lib/agentConfig';
import EmployeePicker from '@/components/EmployeePicker';

const STATUS_MAP = {
  draft: { label: '草稿', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  team_formed: { label: '团队已组建', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  in_progress: { label: '进行中', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  completed: { label: '已完成', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const proj = await backendApi.entities.Project.get(projectId);
      setProject(proj);
    } catch (e) {
      console.error(e);
      setError('项目加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setProject((p) => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await backendApi.entities.Project.update(projectId, {
        project_name: project.project_name,
        requirement: project.requirement,
        industry: project.industry,
      });
      setProject(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMembers = async (selected) => {
    const newMembers = [...(project.team_members || []), ...selected];
    const updated = await backendApi.entities.Project.update(projectId, { team_members: newMembers });
    setProject(updated);
    setShowPicker(false);
  };

  const handleRemoveMember = async (index) => {
    const newMembers = project.team_members.filter((_, i) => i !== index);
    const updated = await backendApi.entities.Project.update(projectId, { team_members: newMembers });
    setProject(updated);
  };

  const handleUploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await backendApi.integrations.Core.UploadFile({ file });
      const updated = await backendApi.entities.Project.update(projectId, {
        requirement_doc_url: file_url,
        requirement_doc_name: file.name,
      });
      setProject(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDoc = async () => {
    const updated = await backendApi.entities.Project.update(projectId, {
      requirement_doc_url: '',
      requirement_doc_name: '',
    });
    setProject(updated);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const response = await backendApi.integrations.Core.InvokeLLM({
        prompt: `${TEAM_FORMATION_PROMPT}\n\n项目名称：${project.project_name || '（未提供，请自动生成）'}\n\n项目需求：${project.requirement}`,
        response_json_schema: TEAM_FORMATION_SCHEMA,
        ...(project.requirement_doc_url ? { file_urls: [project.requirement_doc_url] } : {}),
      });
      const updated = await backendApi.entities.Project.update(projectId, {
        project_name: response.project_name || project.project_name || '',
        project_summary: response.project_summary,
        industry: response.industry,
        mission: response.mission,
        team_members: response.team_members,
        deliverables: [],
        status: 'team_formed',
        learning_status: 'not_started',
      });
      setProject(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || '重新生成失败');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <p className="text-rose-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          返回项目管理
        </button>
      </div>
    );
  }

  const status = STATUS_MAP[project.status] || STATUS_MAP.draft;
  const team = project.team_members || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        {/* Back + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回项目管理
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {project.project_name || '未命名项目'}
              </h1>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard/${project.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> 查看交付看板
          </button>
        </div>

        {/* Requirement editing */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            需求与材料
          </h2>

          {/* Project name */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              项目名称
            </label>
            <input
              value={project.project_name || ''}
              onChange={(e) => handleFieldChange('project_name', e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Requirement */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              项目需求
            </label>
            <textarea
              value={project.requirement || ''}
              onChange={(e) => handleFieldChange('requirement', e.target.value)}
              className="w-full h-28 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              行业
            </label>
            <input
              value={project.industry || ''}
              onChange={(e) => handleFieldChange('industry', e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Document */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              需求文档
            </label>
            {project.requirement_doc_url ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2.5">
                <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="flex-1 text-sm text-slate-300 truncate">
                  {project.requirement_doc_name || '需求文档'}
                </span>
                <button
                  onClick={handleRemoveDoc}
                  className="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-700 hover:border-violet-500/40 px-4 py-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    上传需求文档
                  </>
                )}
                <input type="file" className="hidden" onChange={handleUploadDoc} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : null}
              {saving ? '保存中...' : saved ? '已保存' : '保存修改'}
            </button>
          </div>
        </div>

        {/* Team editing */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              AI团队
              <span className="text-xs text-slate-500 font-normal">（{team.length}名AI员工）</span>
            </h2>
            <button
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> 添加员工
            </button>
          </div>

          {team.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              暂无AI员工，点击"添加员工"或下方"重新生成"
            </div>
          ) : (
            <div className="space-y-2">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2.5"
                >
                  <span className="text-xl">{member.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{member.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(i)}
                    className="text-slate-600 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Regenerate */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              重新生成将根据当前需求和文档重新组建AI团队，并清除已有交付物。请先点击上方"保存修改"保存编辑内容。
            </p>
          </div>
          {error && (
            <p className="text-sm text-rose-400 mb-3">{error}</p>
          )}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {regenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在重新生成...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                重新生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* Employee picker */}
      {showPicker && (
        <EmployeePicker
          existingMembers={team}
          onAdd={handleAddMembers}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}