import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Brain, GraduationCap, Award, ArrowLeft, X, Check, Loader2, Globe, Wallet } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import EmployeeCard from '@/components/EmployeeCard';

export default function EmployeeCenter() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicDialog, setPublicDialog] = useState(null);
  const [hireType, setHireType] = useState('free');
  const [hirePrice, setHirePrice] = useState(0);
  const [savingPublic, setSavingPublic] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const list = await backendApi.entities.AIEmployee.list('-created_date', 100);
      setEmployees(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPublicDialog = (employee) => {
    setPublicDialog(employee);
    setHireType(employee.hire_type || 'free');
    setHirePrice(employee.hire_price || 0);
  };

  const handleSavePublic = async () => {
    if (!publicDialog || savingPublic) return;
    setSavingPublic(true);
    try {
      const updated = await backendApi.entities.AIEmployee.update(publicDialog.id, {
        visibility: 'public',
        hire_type: hireType,
        hire_price: hireType === 'free' ? 0 : hirePrice,
      });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setPublicDialog(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPublic(false);
    }
  };

  const handleHire = async (employee) => {
    try {
      const updated = await backendApi.entities.AIEmployee.update(employee.id, { hired: true });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnhire = async (employee) => {
    try {
      const updated = await backendApi.entities.AIEmployee.update(employee.id, { hired: false });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'available').length,
    training: employees.filter((e) => e.status === 'training').length,
    certified: employees.filter((e) => e.status === 'certified' || e.level === '认证专家').length,
  };

  const businessAI = employees.filter((e) => e.category === 'business');
  const techAI = employees.filter((e) => e.category === 'technology');

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">AI数字员工管理中心</h1>
            <p className="text-slate-400 text-sm">AI Employee Management Center</p>
          </div>
          <Link
            to="/employees/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            创建AI员工
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="AI员工总数" value={stats.total} color="violet" delay={0.1} />
        <StatCard icon={<Brain className="w-5 h-5" />} label="在岗" value={stats.active} color="emerald" delay={0.2} />
        <StatCard icon={<GraduationCap className="w-5 h-5" />} label="训练中" value={stats.training} color="amber" delay={0.3} />
        <StatCard icon={<Award className="w-5 h-5" />} label="已认证" value={stats.certified} color="purple" delay={0.4} />
      </div>

      {/* Business AI */}
      {businessAI.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-violet-500" />
            业务AI专家 Business AI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessAI.map((emp, i) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                index={i}
                onClick={() => (window.location.href = `/employees/${emp.id}`)}
                onMakePublic={openPublicDialog}
                onHire={handleHire}
                onUnhire={handleUnhire}
              />
            ))}
          </div>
        </div>
      )}

      {/* Technology AI */}
      {techAI.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-fuchsia-500" />
            技术AI专家 Technology AI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techAI.map((emp, i) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                index={i}
                onClick={() => (window.location.href = `/employees/${emp.id}`)}
                onMakePublic={openPublicDialog}
                onHire={handleHire}
                onUnhire={handleUnhire}
              />
            ))}
          </div>
        </div>
      )}

      {employees.length === 0 && (
        <div className="text-center py-24">
          <p className="text-slate-400 mb-4">暂无AI员工</p>
          <Link
            to="/employees/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            创建第一个AI员工
          </Link>
        </div>
      )}

      {/* Back link */}
      <div className="pt-4 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>

      {/* Make Public Dialog */}
      <AnimatePresence>
        {publicDialog && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setPublicDialog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">公开AI员工</h3>
                </div>
                <button onClick={() => setPublicDialog(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-950/50 border border-slate-800 p-3 mb-5">
                <div className="text-2xl">{publicDialog.icon}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{publicDialog.name}</div>
                  <div className="text-xs text-slate-500 truncate">{publicDialog.role}</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">聘用方式</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHireType('free')}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border text-sm transition-all ${
                      hireType === 'free'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">免费聘用</span>
                    <span className="text-[10px] text-slate-500">任何人可免费使用</span>
                  </button>
                  <button
                    onClick={() => setHireType('paid')}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border text-sm transition-all ${
                      hireType === 'paid'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">付费聘用</span>
                    <span className="text-[10px] text-slate-500">按月收费</span>
                  </button>
                </div>

                {hireType === 'paid' && (
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">每月费用 (¥)</label>
                    <input
                      type="number"
                      min="1"
                      value={hirePrice}
                      onChange={(e) => setHirePrice(Number(e.target.value))}
                      placeholder="例如：500"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setPublicDialog(null)}
                  disabled={savingPublic}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors disabled:opacity-40"
                >
                  取消
                </button>
                <button
                  onClick={handleSavePublic}
                  disabled={savingPublic || (hireType === 'paid' && !hirePrice)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all"
                >
                  {savingPublic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      确认公开
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  const colorMap = {
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', iconBg: 'bg-violet-500/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl ${c.bg} border ${c.border} p-5`}
    >
      <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}