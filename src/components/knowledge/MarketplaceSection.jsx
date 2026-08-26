import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Star, Download, Check, Plus, Loader2, Lock, Globe } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import CreateKnowledgeModal from '@/components/CreateKnowledgeModal';

const COLOR_MAP = {
  violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  fuchsia: 'from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/30 text-fuchsia-400',
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
  pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/30 text-pink-400',
};

const COLOR_KEYS = ['violet', 'purple', 'fuchsia', 'indigo', 'pink'];

export default function MarketplaceSection() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [subscribed, setSubscribed] = useState({});

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const list = await backendApi.entities.KnowledgeAsset.filter({ status: 'published' }, '-updated_date', 50);
      setAssets(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = () => {
    setShowCreate(false);
    loadAssets();
  };

  const handleMakePublic = async (item) => {
    try {
      await backendApi.entities.KnowledgeAsset.update(item.id, { visibility: 'public' });
      setAssets((prev) => prev.map((a) => (a.id === item.id ? { ...a, visibility: 'public' } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async (item) => {
    setSubscribed((prev) => ({ ...prev, [item.id]: true }));
    try {
      await backendApi.entities.KnowledgeAsset.update(item.id, {
        subscribers_count: (item.subscribers_count || 0) + 1,
      });
      setAssets((prev) => prev.map((a) => (a.id === item.id ? { ...a, subscribers_count: (a.subscribers_count || 0) + 1 } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnsubscribe = async (item) => {
    setSubscribed((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    try {
      await backendApi.entities.KnowledgeAsset.update(item.id, {
        subscribers_count: Math.max(0, (item.subscribers_count || 1) - 1),
      });
      setAssets((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, subscribers_count: Math.max(0, (a.subscribers_count || 1) - 1) } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">知识市场</h1>
          <p className="text-sm text-slate-400 mt-1">
            Knowledge as a Product — 知识资产可跨部门、跨国家、对客户与Partner共享
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          创建知识
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-slate-900/40 border border-slate-800">
          <Store className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">知识市场暂无资产</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 text-sm hover:bg-violet-500/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建第一个知识模块
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((item, i) => {
            const colorKey = COLOR_KEYS[i % COLOR_KEYS.length];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl bg-gradient-to-br border p-4 ${COLOR_MAP[colorKey]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        item.visibility === 'private'
                          ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {item.visibility === 'private' ? (
                        <>
                          <Lock className="w-2.5 h-2.5" /> Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5" /> Public
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.subscribers_count > 0 && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Download className="w-3 h-3" /> {item.subscribers_count}
                      </span>
                    )}
                    {item.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star
                            key={k}
                            className={`w-3 h-3 ${k < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-[10px] text-slate-500 mb-1">{item.owner || '系统'}</p>
                {item.summary && (
                  <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">{item.summary}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] text-slate-400">
                    {item.category || item.type}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.version}</span>
                </div>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, j) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-slate-900/40 text-[9px] text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.visibility === 'private' ? (
                  <button
                    onClick={() => handleMakePublic(item)}
                    className="w-full py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-xs text-fuchsia-300 hover:bg-fuchsia-500/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> 公开
                  </button>
                ) : subscribed[item.id] ? (
                  <button
                    onClick={() => handleUnsubscribe(item)}
                    className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> 取消订阅
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(item)}
                    className="w-full py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-xs text-violet-300 hover:bg-violet-500/25 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> 订阅
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Sharing scope */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-slate-900/40 border border-slate-800 p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4">共享范围</h3>
        <div className="flex flex-col md:flex-row items-stretch gap-2 text-sm">
          {[
            { label: '本部门', icon: '🏢' },
            { label: '其他部门', icon: '🏬' },
            { label: '其他国家', icon: '🌐' },
            { label: '客户', icon: '🤝' },
            { label: '合作伙伴', icon: '⭐' },
          ].map((scope, i) => (
            <div key={scope.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2.5 text-center">
                <div className="text-lg">{scope.icon}</div>
                <div className="text-xs text-slate-300 mt-1">{scope.label}</div>
              </div>
              {i < 4 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          支持收费共享 · Knowledge as a Product 商业模式
        </div>
      </motion.div>

      {showCreate && (
        <CreateKnowledgeModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}