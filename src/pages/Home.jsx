import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Zap, Target, Users, Database, UploadCloud, FileText, X, FolderKanban } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';

const EXAMPLES = [
  {
    label: '汽车制造',
    text: '汽车制造客户需要将SAP ECC升级到S/4HANA Cloud，包含财务和供应链模块。当前系统在生产计划和质量管控方面有大量定制化开发。',
  },
  {
    label: '零售',
    text: '拥有200家门店的零售企业需要实施SAP S/4HANA Cloud，包含POS集成、实时库存管理和全渠道商务能力。',
  },
  {
    label: '制药',
    text: '制药企业需要从SAP ECC迁移到S/4HANA Cloud，满足GMP合规要求，包含批次管理和全球制造工厂的序列化追踪。',
  },
];

export default function Home() {
  const [requirement, setRequirement] = useState('');
  const [projectName, setProjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await backendApi.integrations.Core.UploadFile({ file });
      setUploadedDoc({ url: file_url, name: file.name });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!requirement.trim() || loading) return;
    setLoading(true);
    try {
      const project = await backendApi.entities.Project.create({
        requirement: requirement.trim(),
        project_name: projectName.trim() || '',
        requirement_doc_url: uploadedDoc?.url || '',
        requirement_doc_name: uploadedDoc?.name || '',
        status: 'draft',
      });
      navigate(`/team/${project.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),_transparent_60%)]" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
        }}
      />
      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
      />

      {/* Nav links */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-sm text-slate-300 hover:text-white hover:border-violet-500/40 transition-all"
        >
          <FolderKanban className="w-4 h-4 text-violet-400" />
          项目管理
        </Link>
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-sm text-slate-300 hover:text-white hover:border-violet-500/40 transition-all"
        >
          <Database className="w-4 h-4 text-violet-400" />
          企业知识大脑
        </Link>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-sm text-slate-300 hover:text-white hover:border-violet-500/40 transition-all"
        >
          <Users className="w-4 h-4 text-violet-400" />
          AI员工管理中心
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-300">企业AI数字员工平台</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-bold text-center mb-2 bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent tracking-tight"
        >
          创建您的AI团队
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-center max-w-xl mb-6 text-sm sm:text-base leading-relaxed"
        >
          输入业务需求，自动组建AI专家团队，多智能体协同工作，输出专业交付成果
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 shadow-2xl">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              项目名称
              <span className="text-slate-600 normal-case tracking-normal ml-1">（不填则由AI自动生成）</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="例如：汽车制造S/4HANA迁移项目"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors mb-3"
            />
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              项目需求
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="例如：汽车制造客户需要将SAP ECC升级到S/4HANA Cloud..."
              className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none transition-colors"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider self-center mr-1">
                示例：
              </span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setRequirement(ex.text)}
                  className="px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-xs text-slate-300 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Requirement doc upload */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                需求文档
                <span className="text-slate-600 normal-case tracking-normal ml-1">（可选，上传后AI将结合文档分析）</span>
              </label>
              {uploadedDoc ? (
                <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 px-4 py-3">
                  <FileText className="w-5 h-5 text-violet-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-300 truncate">{uploadedDoc.name}</span>
                  <button
                    onClick={() => setUploadedDoc(null)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 px-4 py-4 cursor-pointer transition-colors">
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      <span className="text-xs text-slate-500">正在上传...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-500" />
                      <span className="text-xs text-slate-400">点击或拖拽上传需求文档</span>
                      <span className="text-[10px] text-slate-600">支持 PDF、Word、Excel、图片等格式</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={!requirement.trim() || loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  正在创建AI劳动力...
                </>
              ) : (
                <>
                  创建AI劳动力
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-500"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span>多智能体协同</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>企业知识库</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-fuchsia-400" />
            <span>专业交付</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}