import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { backendApi } from '@/api/backendApiClient';
import { AGENT_COLORS } from '@/lib/agentConfig';

export default function EmployeePicker({ existingMembers = [], onAdd, onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await backendApi.entities.AIEmployee.list('-updated_date', 50);
        setEmployees(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const existingNames = new Set(existingMembers.map((m) => m.name));

  const filtered = employees.filter(
    (e) =>
      !existingNames.has(e.name) &&
      (e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.role?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (emp) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === emp.id);
      if (exists) return prev.filter((p) => p.id !== emp.id);
      return [
        ...prev,
        {
          name: emp.name,
          role: emp.role,
          icon: emp.icon || '🤖',
          expertise: emp.domain || emp.role,
          mission: '从AI员工中心手动加入',
          color: emp.color || 'indigo',
        },
      ];
    });
  };

  const handleConfirm = () => {
    onAdd(selected);
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
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">从AI员工中心添加</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索员工姓名或角色..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">
              {employees.length === 0 ? 'AI员工中心暂无可用员工' : '没有匹配的员工'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((emp) => {
                const colors = AGENT_COLORS[emp.color] || AGENT_COLORS.indigo;
                const isSelected = selected.find((p) => p.id === emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => toggle(emp)}
                    className={`text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? `${colors.border} ${colors.bg}`
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-xl shrink-0`}
                      >
                        {emp.icon || '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{emp.name}</div>
                        <div className={`text-xs ${colors.text} truncate`}>{emp.role}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{emp.level}</div>
                      </div>
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full ${colors.dot} flex items-center justify-center shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">已选择 {selected.length} 名</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              添加到团队
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}