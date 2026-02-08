import React, { useEffect, useState } from 'react';
import { Timer, Soup, History, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, logAPI } from '../services/api';
import { AdminStats, CookingLog } from '../types';

const ORDER_PLAN_KEY = 'dishhub_order_plan';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<CookingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsResult, logsResult] = await Promise.allSettled([
          adminAPI.getStats(),
          logAPI.getAllLogs(),
        ]);

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value);
        }

        if (logsResult.status === 'fulfilled') {
          setRecentLogs(logsResult.value.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_PLAN_KEY);
      if (!raw) {
        setSelectedCount(0);
        setWishlistCount(0);
        return;
      }

      const parsed = JSON.parse(raw);
      const selectedDishIds = Array.isArray(parsed?.selectedDishIds)
        ? parsed.selectedDishIds.filter((id: unknown) => Number.isInteger(id) && Number(id) > 0)
        : [];
      const wishlistItems = Array.isArray(parsed?.wishlistItems)
        ? parsed.wishlistItems.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [];

      setSelectedCount(selectedDishIds.length);
      setWishlistCount(wishlistItems.length);
    } catch {
      localStorage.removeItem(ORDER_PLAN_KEY);
      setSelectedCount(0);
      setWishlistCount(0);
    }
  }, []);

  if (loading) return null;

  const totalOrderedItems = selectedCount + wishlistCount;

  const formatDateYmd = (value: string) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-10">
      <section className="max-w-[980px]">
        <div className="flex items-center gap-3 mb-5">
          <div className="px-3 py-1 rounded-full bg-sage/10 text-sage text-[12px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-3 w-3 fill-current" />
            Kitchen Insight
          </div>
        </div>

        <h1 className="text-[38px] md:text-[50px] font-black text-ink leading-tight md:whitespace-nowrap mb-4">
          主厨，今天想创造什么新味道？
        </h1>

        <p className="text-[17px] md:text-[19px] font-bold text-ink-light leading-relaxed md:whitespace-nowrap">
          目前您的菜谱库中收录了 {stats?.total_dishes ?? 0} 道美味，共记录了 {stats?.total_logs ?? 0} 次真实的烹饪时光。
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="paper-card p-6 group hover:border-sage/25 transition-all cursor-pointer" onClick={() => navigate('/library')}>
          <div className="h-10 w-10 rounded-2xl bg-paper flex items-center justify-center text-sage mb-4 group-hover:bg-sage/10 transition-all">
            <Soup className="h-5 w-5" />
          </div>
          <h3 className="text-[14px] font-black text-ink-light uppercase tracking-widest mb-2">菜谱库</h3>
          <p className="text-[33px] font-black text-ink">{stats?.total_dishes ?? 0} <span className="text-[14px] text-ink-light">ITEMS</span></p>
        </div>

        <div className="paper-card p-6 group hover:border-sage/25 transition-all cursor-pointer" onClick={() => navigate('/logs')}>
          <div className="h-10 w-10 rounded-2xl bg-paper flex items-center justify-center text-sage mb-4 group-hover:bg-sage/10 transition-all">
            <History className="h-5 w-5" />
          </div>
          <h3 className="text-[14px] font-black text-ink-light uppercase tracking-widest mb-2">累计下厨</h3>
          <p className="text-[33px] font-black text-ink">{stats?.total_logs ?? 0} <span className="text-[14px] text-ink-light">TIMES</span></p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/order')}
          className="paper-card p-6 border border-paper-stone/70 bg-white text-ink text-left hover:border-sage/25 transition-all"
        >
          <div className="h-10 w-10 rounded-2xl bg-paper flex items-center justify-center text-sage mb-4">
            <Timer className="h-5 w-5" />
          </div>
          <h3 className="text-[14px] font-black text-ink-light uppercase tracking-widest mb-2">点菜</h3>
          <p className="text-[33px] font-black leading-tight text-ink">
            {totalOrderedItems} <span className="text-[14px] text-ink-light">ITEMS</span>
          </p>
          <p className="mt-2 text-[13px] font-bold text-ink-light">已选菜谱 {selectedCount} · 期望菜品 {wishlistCount}</p>
        </button>
      </div>

      <section className="paper-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-black text-ink-light uppercase tracking-widest">最近下厨</h2>
          <button
            type="button"
            onClick={() => navigate('/logs')}
            className="inline-flex items-center gap-1 text-[13px] font-black text-sage hover:text-sage-dark transition-colors"
          >
            查看全部
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-[14px] font-bold text-ink-light">还没有烹饪记录，去累计下厨记录第一条吧。</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => navigate(`/dish/${log.dish_id}`)}
                className="w-full paper-card bg-paper/30 border-paper px-4 py-3 text-left hover:bg-paper transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-paper overflow-hidden shrink-0 border border-paper-stone/40">
                    {log.image_url || log.dish_preview ? (
                      <img src={log.image_url || log.dish_preview} alt={log.dish_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[20px] opacity-50">🍲</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-black text-ink truncate">{log.dish_name}</p>
                      <span className="text-[11px] font-black text-sage uppercase tracking-widest whitespace-nowrap">
                        {formatDateYmd(log.cooked_at)}
                      </span>
                    </div>
                    {log.notes && <p className="mt-1 text-[13px] font-bold text-ink-light line-clamp-1">“ {log.notes} ”</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
