import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, ChevronRight, History, X, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { dishAPI, logAPI } from '../services/api';
import { Dish, CookingLog } from '../types';
import { getDifficultyText } from '../utils/dish';

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<CookingLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const loadDish = async () => {
      if (!id) return setError('菜品 ID 缺失');
      try {
        setLoading(true);
        const data = await dishAPI.getDish(parseInt(id, 10));
        setDish(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '菜品加载失败');
      } finally {
        setLoading(false);
      }
    };
    loadDish();
  }, [id]);

  const handleDelete = async () => {
    if (!dish) return;
    if (!window.confirm(`确定删除「${dish.name}」吗？`)) return;
    try {
      setDeleting(true);
      await dishAPI.deleteDish(dish.id);
      navigate('/library');
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const closeHistoryDrawer = () => {
    setShowHistoryDrawer(false);
  };

  const openHistoryDrawer = () => {
    setShowHistoryDrawer(true);
  };

  useEffect(() => {
    if (!showHistoryDrawer) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHistoryDrawer(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showHistoryDrawer]);

  useEffect(() => {
    if (!dish?.id) {
      setHistoryLogs([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const logs = await logAPI.getAllLogs({ dish_id: dish.id });
        if (!cancelled) {
          setHistoryLogs(logs);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryLogs([]);
          setHistoryError(err instanceof Error ? err.message : '加载烹饪历史失败');
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [dish?.id]);

  const formatDateYmd = (value: string) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading) return <LoadingSpinner message="正在加载..." />;

  if (error || !dish) {
    return (
      <div className="ios-grouped-section mx-auto max-w-lg mt-10 p-8 text-center">
        <div className="text-4xl mb-4">🍲</div>
        <h2 className="text-[17px] font-semibold text-[#1C1C1E]">菜品不可用</h2>
        <p className="mt-1 text-[14px] text-[#8E8E93]">{error || '未找到该菜品'}</p>
        <Link to="/library" className="mt-6 inline-block text-[15px] font-bold text-[#007AFF]">返回菜谱库</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[920px] space-y-7">
      <header className="flex items-start sm:items-center justify-between gap-3 px-1">
        <Link to="/library" className="flex items-center gap-1 text-[14px] sm:text-[15px] font-medium text-[#007AFF]">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <div className="flex items-center justify-end flex-wrap gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={openHistoryDrawer}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 sm:px-0 sm:py-0 bg-[#007AFF]/5 sm:bg-transparent text-[13px] sm:text-[15px] font-semibold text-[#007AFF]"
          >
            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">历史</span>
            <span className="hidden sm:inline">烹饪历史</span>
          </button>
          <Link
            to={`/dish/${dish.id}/edit`}
            className="rounded-lg px-2 py-1 sm:px-0 sm:py-0 bg-[#007AFF]/5 sm:bg-transparent text-[13px] sm:text-[15px] font-semibold text-[#007AFF]"
          >
            编辑
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-2 py-1 sm:px-0 sm:py-0 bg-[#FF3B30]/8 sm:bg-transparent text-[13px] sm:text-[15px] font-semibold text-[#FF3B30] disabled:opacity-50"
          >
            {deleting ? '删除中' : '删除'}
          </button>
        </div>
      </header>

      {/* Main Info Inset Group */}
      <section className="ios-grouped-section divide-y divide-[#E5E5EA]">
        <div className="p-0">
          {dish.image ? (
            <img src={dish.image} alt={dish.name} className="aspect-[21/9] max-h-[300px] w-full object-cover" />
          ) : (
            <div className="flex aspect-[21/9] max-h-[300px] w-full items-center justify-center bg-slate-100 text-6xl">🍽️</div>
          )}
        </div>
        <div className="p-5">
          <h1 className="text-[30px] font-black text-[#1C1C1E]">{dish.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#007AFF] uppercase tracking-wider">{dish.category}</span>
            {dish.tags.length > 0 && (
              <div className="flex gap-1.5 border-l border-[#E5E5EA] pl-2">
                {dish.tags.map(tag => (
                  <span key={tag} className="text-[13px] text-[#8E8E93]">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#E5E5EA]">
          <div className="py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-[#8E8E93]">时长</p>
            <p className="text-[15px] font-semibold">{dish.cooking_time}m</p>
          </div>
          <div className="py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-[#8E8E93]">份量</p>
            <p className="text-[15px] font-semibold">{dish.servings}p</p>
          </div>
          <div className="py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-[#8E8E93]">难度</p>
            <p className="text-[15px] font-semibold">{getDifficultyText(dish.difficulty)}</p>
          </div>
        </div>
        {dish.tutorial_url && (
          <a href={dish.tutorial_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <Play className="h-4 w-4 text-[#007AFF] fill-current" />
              <span className="text-[16px] font-medium text-[#1C1C1E]">观看视频教程</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C7C7CC]" />
          </a>
        )}
      </section>

      {/* Ingredients Group */}
      <section>
        <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-widest text-[#8E8E93]">所需食材</h2>
        <div className="ios-grouped-section divide-y divide-[#E5E5EA]">
          {dish.ingredients.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[#C7C7CC]" />
              <span className="text-[16px] font-medium text-[#3A3A3C]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions Group */}
      <section>
        <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-widest text-[#8E8E93]">制作步骤</h2>
        <div className="ios-grouped-section divide-y divide-[#E5E5EA]">
          {dish.instructions.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4">
              <span className="text-[16px] font-bold text-[#007AFF] tabular-nums">{idx + 1}.</span>
              <p className="text-[16px] leading-relaxed text-[#3A3A3C]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1 gap-3">
          <h2 className="text-[12px] font-black uppercase tracking-widest text-ink-light">本菜历史下厨记录</h2>
          <button
            type="button"
            onClick={openHistoryDrawer}
            className="inline-flex items-center gap-1 text-[13px] font-black text-sage hover:text-sage-dark transition-colors"
          >
            查看完整时间线
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {historyLoading ? (
          <div className="paper-card p-5 text-[14px] font-bold text-ink-light">正在加载该菜的历史记录...</div>
        ) : historyError ? (
          <div className="paper-card p-5 text-[14px] font-bold text-accent">{historyError}</div>
        ) : historyLogs.length === 0 ? (
          <div className="paper-card p-6 text-center">
            <p className="text-[14px] font-bold text-ink-light">这道菜还没有历史记录，去累计下厨记一笔吧。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyLogs.slice(0, 3).map((log) => (
              <article key={log.id} className="paper-card overflow-hidden">
                {log.image_url && (
                  <div className="aspect-[16/9] border-b border-paper overflow-hidden">
                    <img src={log.image_url} alt={log.dish_name} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[16px] font-black text-ink">{formatDateYmd(log.cooked_at)}</p>
                    <span className="text-[12px] font-black text-sage uppercase tracking-widest whitespace-nowrap">
                      {new Date(log.cooked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {log.notes && <p className="text-[14px] font-bold text-ink-light leading-relaxed">“ {log.notes} ”</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div
        className={`fixed inset-0 z-[90] bg-ink/35 backdrop-blur-sm transition-opacity duration-300 ${
          showHistoryDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeHistoryDrawer}
        aria-hidden={!showHistoryDrawer}
      />

      <aside
        className={`fixed right-0 top-0 z-[100] h-full w-full max-w-full sm:max-w-[520px] bg-paper-light border-l border-paper shadow-paper-deep transition-transform duration-300 ${
          showHistoryDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!showHistoryDrawer}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-paper bg-white/80 backdrop-blur-sm">
            <div>
              <h2 className="text-[16px] font-black text-ink flex items-center gap-2">
                <History className="h-4 w-4 text-sage" />
                烹饪历史
              </h2>
              <p className="text-[12px] font-bold text-ink-light mt-1">{dish.name}</p>
            </div>
            <button
              type="button"
              onClick={closeHistoryDrawer}
              className="p-2 rounded-lg text-ink-light hover:bg-paper hover:text-ink transition-colors"
              aria-label="关闭烹饪历史"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {historyLoading ? (
              <p className="text-[13px] font-bold text-ink-light">正在加载烹饪历史...</p>
            ) : historyError ? (
              <div className="paper-card p-4 text-[13px] font-bold text-accent">{historyError}</div>
            ) : historyLogs.length === 0 ? (
              <div className="paper-card p-6 text-center">
                <p className="text-[13px] font-bold text-ink-light">暂无烹饪记录，去累计下厨里新增一条吧。</p>
              </div>
            ) : (
              historyLogs.map((log) => (
                <article key={log.id} className="paper-card overflow-hidden">
                  {log.image_url && (
                    <div className="aspect-[16/9] border-b border-paper overflow-hidden">
                      <img src={log.image_url} alt={log.dish_name} className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[16px] font-black text-ink">{log.dish_name}</h3>
                      <span className="text-[12px] font-black text-sage uppercase tracking-widest whitespace-nowrap">
                        {formatDateYmd(log.cooked_at)}
                      </span>
                    </div>

                    <p className="text-[12px] font-bold text-ink-light uppercase tracking-widest">
                      {new Date(log.cooked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {log.notes && <p className="text-[14px] font-bold text-ink-light leading-relaxed">“ {log.notes} ”</p>}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DishDetailPage;
