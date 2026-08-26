import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, Package, Lock, Globe } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import KnowledgeSourcePicker from '@/components/KnowledgeSourcePicker';

const CATEGORIES = ['行业模板', '功能蓝图', '架构方案', '检查清单', '操作手册', '测试框架', '最佳实践'];

export default function CreateKnowledgeModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [summary, setSummary] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedSources, setSelectedSources] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const toggleSource = (asset) => {
    setSelectedSources((prev) =>
      prev.includes(asset.name)
        ? prev.filter((n) => n !== asset.name)
        : [...prev, asset.name]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const asset = await backendApi.entities.KnowledgeAsset.create({
        name: name.trim(),
        type: 'template',
        category,
        summary: summary.trim(),
        status: 'published',
        visibility,
        source: 'manual',
        version: 'v1.0',
        quality_score: 0,
        subscribers_count: 0,
        rating: 0,
        tags: selectedSources,
      });
      onCreated?.(asset);
    } catch (err) {
      console.error(err);
      setError(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-semibold text-white">创建知识技能模块</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              知识模块名称
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：汽车制造S/4HANA迁移知识包"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              分类
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    category === c
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              描述
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="描述该知识模块的用途和覆盖范围..."
              className="w-full h-20 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              可见性
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all flex-1 ${
                  visibility === 'public'
                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">公开</div>
                  <div className="text-[10px] text-slate-500">可被其他AI员工订阅</div>
                </div>
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all flex-1 ${
                  visibility === 'private'
                    ? 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">私有</div>
                  <div className="text-[10px] text-slate-500">仅创建者可用</div>
                </div>
              </button>
            </div>
          </div>

          {/* Source selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              选择知识源
              <span className="text-slate-600 normal-case tracking-normal ml-1">
                （从已入库文档和项目沉淀中打包）
              </span>
            </label>
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-4">
              <KnowledgeSourcePicker
                selected={selectedSources}
                onToggle={toggleSource}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-rose-400 text-center py-2">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            已选择 {selectedSources.length} 个知识源
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  创建知识模块
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}