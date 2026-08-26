import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import KnowledgeSidebar from '@/components/knowledge/KnowledgeSidebar';
import KnowledgeDashboard from '@/components/knowledge/KnowledgeDashboard';
import DocumentsSection from '@/components/knowledge/DocumentsSection';
import ProjectSyncSection from '@/components/knowledge/ProjectSyncSection';
import BestPracticesSection from '@/components/knowledge/BestPracticesSection';
import MarketplaceSection from '@/components/knowledge/MarketplaceSection';
import {
  LessonsLearnedSection,
  AIGeneratedSection,
  PermissionsSection,
} from '@/components/knowledge/KnowledgeSections';

export default function KnowledgeBrain() {
  const [active, setActive] = useState('dashboard');

  const renderSection = () => {
    switch (active) {
      case 'dashboard': return <KnowledgeDashboard />;
      case 'documents': return <DocumentsSection />;
      case 'project_sync': return <ProjectSyncSection />;
      case 'best_practices': return <BestPracticesSection />;
      case 'lessons': return <LessonsLearnedSection />;
      case 'ai_assets': return <AIGeneratedSection />;
      case 'marketplace': return <MarketplaceSection />;
      case 'versions': return <BestPracticesSection />;
      case 'permissions': return <PermissionsSection />;
      default: return <KnowledgeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">AI Knowledge Brain Center</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="mx-auto max-w-[1400px] flex">
        <KnowledgeSidebar active={active} onSelect={setActive} />
        <main className="flex-1 px-6 py-8 min-w-0">{renderSection()}</main>
      </div>
    </div>
  );
}