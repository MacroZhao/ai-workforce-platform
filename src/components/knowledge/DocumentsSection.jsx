import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, Check, Loader2, Copy, ClipboardCheck,
  ScanSearch, Eraser, Tags, CheckCircle, X, FileSearch, Scissors, Boxes, Network, Database
} from 'lucide-react';
import { CURATION_STEPS, EMBEDDING_STEPS } from '@/lib/knowledgeConfig';

const EMBED_ICONS = { FileSearch, Scissors, Boxes, Network, Database };

const CATEGORIES = ['SAP', '安全', '云', 'Java', '测试', '制造', '财务'];

const SAMPLE_DOCS = [
  { name: 'SAP Blueprint.pdf', category: 'SAP', owner: 'John', size: '2.4MB' },
  { name: 'Architecture.docx', category: '云', owner: 'Lisa', size: '1.8MB' },
  { name: 'Security Checklist.xlsx', category: '安全', owner: 'Mike', size: '420KB' },
];

const CURATION_ICONS = { Copy, ClipboardCheck, ScanSearch, Eraser, Tags, CheckCircle };

export default function DocumentsSection() {
  const [category, setCategory] = useState('SAP');
  const [owner, setOwner] = useState('John');
  const [uploaded, setUploaded] = useState(SAMPLE_DOCS);
  const [processing, setProcessing] = useState(false);
  const [embedStep, setEmbedStep] = useState(-1);
  const [curateStep, setCurateStep] = useState(-1);
  const [curateResult, setCurateResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = (fileName) => {
    if (!fileName) return;
    setProcessing(true);
    setEmbedStep(0);
    setCurateStep(-1);
    setCurateResult(null);

    // Simulate embedding pipeline
    let step = 0;
    const embedTimer = setInterval(() => {
      step += 1;
      if (step >= EMBEDDING_STEPS.length) {
        clearInterval(embedTimer);
        setEmbedStep(EMBEDDING_STEPS.length - 1);
        // Start curation
        setCurateStep(0);
        runCuration(fileName);
      } else {
        setEmbedStep(step);
      }
    }, 700);
  };

  const runCuration = (fileName) => {
    let step = 0;
    const curateTimer = setInterval(() => {
      step += 1;
      if (step >= CURATION_STEPS.length) {
        clearInterval(curateTimer);
        setCurateStep(CURATION_STEPS.length - 1);
        setCurateResult({ approved: true, fileName });
        setUploaded((prev) => [
          { name: fileName, category, owner, size: '1.2MB' },
          ...prev,
        ]);
        setTimeout(() => {
          setProcessing(false);
          setEmbedStep(-1);
          setCurateStep(-1);
        }, 1200);
      } else {
        setCurateStep(step);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">文档管理</h1>
        <p className="text-sm text-slate-400 mt-1">人工上传企业文档，经AI审核与向量化后沉淀至知识大脑</p>
      </div>

      {/* Upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleUpload(f.name);
            }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-violet-500 bg-violet-500/5' : 'border-slate-700 bg-slate-900/40 hover:border-violet-500/50'
            }`}
            onClick={() => handleUpload('New_Knowledge_Document.pdf')}
          >
            <UploadCloud className="w-10 h-10 text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">拖拽文件到此处上传</p>
            <p className="text-xs text-slate-500 mt-1">支持 PDF / DOCX / XLSX / MD / PPT</p>
            {!processing && (
              <button className="mt-4 px-4 py-2 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs hover:bg-violet-500/25 transition-colors">
                选择文件
              </button>
            )}
          </div>
        </div>

        {/* Metadata form */}
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-4 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">分类</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    category === c
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">负责人</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">共享范围</label>
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2">
              <input type="checkbox" defaultChecked className="accent-violet-500" />
              <span className="text-sm text-slate-300">组织级共享</span>
            </div>
          </div>
        </div>
      </div>

      {/* Processing pipeline */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Embedding pipeline */}
            <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                <h3 className="text-sm font-semibold text-white">向量化入库 · Alibaba Bailian</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                {EMBEDDING_STEPS.map((step, i) => {
                  const Icon = EMBED_ICONS[step.icon] || FileText;
                  const done = i < embedStep;
                  const active = i === embedStep;
                  return (
                    <div key={step.label} className="flex items-center gap-2 flex-1">
                      <div className={`flex-1 rounded-lg border px-3 py-2.5 transition-colors ${
                        done ? 'bg-emerald-500/10 border-emerald-500/30' :
                        active ? 'bg-violet-500/10 border-violet-500/40' :
                        'bg-slate-900/40 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> :
                           active ? <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" /> :
                           <Icon className="w-3.5 h-3.5 text-slate-600" />}
                          <span className={`text-xs font-medium ${done ? 'text-emerald-300' : active ? 'text-violet-300' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{step.desc}</p>
                      </div>
                      {i < EMBEDDING_STEPS.length - 1 && <span className="text-slate-700 hidden md:inline">→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Curation */}
            {curateStep >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-slate-900/40 border border-slate-800 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-[10px]">🤖</div>
                  <h3 className="text-sm font-semibold text-white">Knowledge Curator AI 审核中</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CURATION_STEPS.map((step, i) => {
                    const Icon = CURATION_ICONS[step.icon] || CheckCircle;
                    const done = i < curateStep;
                    const active = i === curateStep;
                    return (
                      <div key={step.label} className={`rounded-lg border px-3 py-2.5 transition-colors ${
                        done ? 'bg-emerald-500/10 border-emerald-500/30' :
                        active ? 'bg-fuchsia-500/10 border-fuchsia-500/40' :
                        'bg-slate-900/40 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> :
                           active ? <Loader2 className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" /> :
                           <Icon className="w-3.5 h-3.5 text-slate-600" />}
                          <span className={`text-xs font-medium ${done ? 'text-emerald-300' : active ? 'text-fuchsia-300' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {curateResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-300">
                  审核通过 · {curateResult.fileName} 已发布到知识大脑
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document list */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">已入库文档</h3>
          <span className="text-xs text-slate-500">{uploaded.length} 份</span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {uploaded.map((doc, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{doc.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{doc.owner} · {doc.size}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400">{doc.category}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> 已发布
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}