import { useState, useEffect } from 'react';
import { Store, FileText, FolderGit2, Search, Check, Loader2, BookOpen } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';

const GROUPS = [
  { key: 'marketplace', label: '知识市场', icon: Store, color: 'violet' },
  { key: 'documents', label: '文档管理', icon: FileText, color: 'purple' },
  { key: 'project', label: '项目沉淀', icon: FolderGit2, color: 'fuchsia' },
];

const COLOR_CLASSES = {
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  fuchsia: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
};

export default function KnowledgeSourcePicker({ selected = [], onToggle, excludeNames = [] }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('marketplace');

  useEffect(() => {
    async function load() {
      try {
        const list = await backendApi.entities.KnowledgeAsset.filter(
          { status: 'published' },
          '-updated_date',
          50
        );
        setAssets(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const excludeSet = new Set(excludeNames);
  const selectedSet = new Set(selected);

  const grouped = {
    marketplace: assets.filter((a) => a.type === 'best_practice' || a.type === 'template' || a.type === 'ai_generated'),
    documents: assets.filter((a) => a.type === 'document'),
    project: assets.filter((a) => a.type === 'project_asset' || a.type === 'lesson_learned'),
  };

  const currentItems = (grouped[activeGroup] || []).filter(
    (a) =>
      !excludeSet.has(a.name) &&
      (a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      {/* Group tabs */}
      <div className="flex gap-2">
        {GROUPS.map((g) => {
          const Icon = g.icon;
          const count = grouped[g.key]?.length || 0;
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeGroup === g.key
                  ? COLOR_CLASSES[g.color]
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-950/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {g.label}
              <span className="text-[10px] text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索知识名称或分类..."
          className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            {assets.length === 0 ? '暂无已发布知识资产，请先在知识大脑中上传并发布文档' : '没有匹配的知识'}
          </div>
        ) : (
          currentItems.map((asset) => {
            const isSelected = selectedSet.has(asset.name);
            return (
              <button
                key={asset.id}
                onClick={() => onToggle(asset)}
                className={`w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'bg-violet-500/10 border-violet-500/40'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{asset.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {asset.category || asset.type} · {asset.version}
                  </div>
                </div>
                {asset.rating > 0 && (
                  <span className="text-[10px] text-amber-400 shrink-0">★ {asset.rating}</span>
                )}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-violet-500' : 'bg-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected count */}
      <div className="text-xs text-slate-500 text-right">
        已选择 {selected.length} 项知识源
      </div>
    </div>
  );
}