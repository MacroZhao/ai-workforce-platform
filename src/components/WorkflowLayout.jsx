import { Outlet, useLocation, Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

const STEPS = [
  { label: '需求输入', match: '/' },
  { label: '团队组建', match: '/team/' },
  { label: '智能体协作', match: '/collaboration/' },
  { label: '交付展示', match: '/dashboard/' },
  { label: '学习能力闭环', match: '/learning/' },
];

function getStepIndex(pathname) {
  if (pathname.includes('/employees')) return -1;
  if (pathname.includes('/team/')) return 1;
  if (pathname.includes('/collaboration/')) return 2;
  if (pathname.includes('/dashboard/')) return 3;
  if (pathname.includes('/learning/') || pathname.includes('/growth/')) return 4;
  return 0;
}

export default function WorkflowLayout() {
  const location = useLocation();
  const currentStep = getStepIndex(location.pathname);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <span className="font-semibold text-sm hidden sm:inline">企业AI数字员工平台</span>
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link to="/projects" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
                项目管理
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link to="/knowledge" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
                知识大脑
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link to="/employees" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
                AI员工中心
              </Link>
            </div>
            <nav className="flex items-center gap-0.5 sm:gap-1">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      i < currentStep
                        ? 'text-emerald-400'
                        : i === currentStep
                        ? 'text-white bg-slate-800'
                        : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        i < currentStep
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : i === currentStep
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="hidden md:inline">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-700 mx-0.5" />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}