import React, { useEffect, useState } from 'react';
import { History, Plus, ArrowRight, ChevronLeft, Image as ImageIcon, Check, Trash2, Edit3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logAPI, dishAPI } from '../services/api';
import { CookingLog, Dish } from '../types';

const LogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<CookingLog[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<CookingLog | null>(null);
  
  // Form State
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, dishesData] = await Promise.all([
        logAPI.getAllLogs(),
        dishAPI.getAllDishes()
      ]);
      setLogs(logsData);
      setDishes(dishesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingLog(null);
    setSelectedDishId(null);
    setNotes('');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (log: CookingLog) => {
    setEditingLog(log);
    setSelectedDishId(log.dish_id);
    setNotes(log.notes || '');
    setImageUrl(log.image_url || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDishId) return;

    try {
      setSubmitting(true);
      if (editingLog) {
        await logAPI.updateLog(editingLog.id, { notes, image_url: imageUrl });
      } else {
        await logAPI.createLog({ dish_id: selectedDishId, notes, image_url: imageUrl });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条烹饪记录吗？')) return;
    try {
      await logAPI.deleteLog(id);
      await loadData();
    } catch (err) {
      alert('删除失败');
    }
  };

  if (loading && logs.length === 0) return null;

  return (
    <div className="max-w-[900px] mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex items-center justify-between px-1">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-[14px] font-bold text-sage">
          <ChevronLeft className="h-4 w-4" /> 返回
        </button>
        <button 
          onClick={openAddModal}
          className="paper-button !px-4 !py-2 text-[13px]"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          记录本次烹饪
        </button>
      </header>

      <section>
        <h1 className="text-[42px] font-black text-ink leading-tight">烹饪时光轴</h1>
        <p className="mt-2 text-[16px] font-bold text-ink-light">每一次在厨房的忙碌，都凝结成生活的光影。</p>
      </section>

      <div className="relative space-y-12">
        <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-paper-stone hidden md:block" />

        {logs.length === 0 ? (
          <div className="py-20 text-center paper-card bg-paper/20 border-dashed">
            <History className="h-12 w-12 text-paper-stone mx-auto mb-4" />
            <p className="text-ink-light font-bold">暂无烹饪记录，点击上方按钮开始第一笔记录。</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} className="relative pl-0 md:pl-14 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="absolute left-0 top-2 hidden md:flex h-10 w-10 rounded-full bg-white border-4 border-paper-light items-center justify-center z-10 text-sage shadow-sm">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-32 shrink-0 md:pt-2">
                  <span className="text-[12px] font-black text-sage uppercase tracking-widest bg-sage/10 px-2 py-1 rounded md:bg-transparent md:p-0">
                    {new Date(log.cooked_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="paper-card flex-1 overflow-hidden group">
                  <div className="flex flex-col sm:flex-row">
                    {log.image_url && (
                      <div className="sm:w-48 aspect-square sm:aspect-auto shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-paper">
                        <img src={log.image_url} alt={log.dish_name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-[18px] font-black text-ink">{log.dish_name}</h4>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(log)} className="p-2 rounded-lg text-ink-light hover:bg-paper hover:text-sage transition-all">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(log.id)} className="p-2 rounded-lg text-ink-light hover:bg-paper hover:text-accent transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => navigate(`/dish/${log.dish_id}`)} className="p-2 rounded-lg text-ink-light hover:bg-paper hover:text-sage transition-all">
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {log.notes && (
                          <p className="mt-3 text-[14px] font-bold text-ink-light leading-relaxed italic">
                            “ {log.notes} ”
                          </p>
                        )}
                      </div>
                      <div className="mt-6 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                         <span className="text-[11px] font-black text-ink-light/60 uppercase tracking-widest">Recorded at {new Date(log.cooked_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-[500px] paper-card shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[24px] font-black text-ink">{editingLog ? '编辑时光足迹' : '记录今日美味'}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-paper text-ink-light"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="space-y-4">
                {!editingLog && (
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-ink-light uppercase px-1">选择菜品</label>
                    <select 
                      required
                      className="w-full h-12 px-4 rounded-xl bg-paper border-transparent text-[14px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-sage/20 transition-all"
                      value={selectedDishId || ''}
                      onChange={(e) => setSelectedDishId(Number(e.target.value))}
                    >
                      <option value="">-- 请选择您的菜谱 --</option>
                      {dishes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-ink-light uppercase px-1 flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" /> 成果图片 URL
                  </label>
                  <input 
                    type="url"
                    className="w-full h-12 px-4 rounded-xl bg-paper border-transparent text-[14px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-sage/20 transition-all"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-ink-light uppercase px-1">烹饪心得</label>
                  <textarea 
                    className="w-full p-4 rounded-xl bg-paper border-transparent text-[14px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-sage/20 transition-all min-h-[100px] resize-none"
                    placeholder="今天的味道如何？"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 paper-button !rounded-xl h-12 disabled:opacity-50"
                >
                  {submitting ? '保存中...' : '确认提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
