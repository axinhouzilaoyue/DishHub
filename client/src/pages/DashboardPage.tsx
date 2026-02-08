import React, { useEffect, useState } from 'react';
import { Timer, Soup, History, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { AdminStats } from '../types';

const ORDER_PLAN_KEY = 'dishhub_order_plan';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const statsResult = await adminAPI.getStats();
        setStats(statsResult);
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

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="max-w-[800px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 rounded-full bg-sage/10 text-sage text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-3 w-3 fill-current" />
            Kitchen Insight
          </div>
        </div>
        <h1 className="text-[42px] md:text-[56px] font-black text-ink leading-[1.1] mb-6">
          主厨，今天想创造<br />
          <span className="text-sage">什么新味道？</span>
        </h1>
        <p className="text-[18px] font-bold text-ink-light leading-relaxed max-w-[500px]">
          目前您的菜谱库中收录了 {stats?.total_dishes ?? 0} 道美味，共记录了 {stats?.total_logs ?? 0} 次真实的烹饪时光。
        </p>
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="paper-card p-8 group hover:border-sage/30 transition-all cursor-pointer active:scale-[0.98]" onClick={() => navigate('/library')}>
          <div className="h-12 w-12 rounded-2xl bg-paper flex items-center justify-center text-sage mb-6 group-hover:scale-110 group-hover:bg-sage/10 transition-all">
            <Soup className="h-6 w-6" />
          </div>
          <h3 className="text-[14px] font-black text-ink-light uppercase tracking-widest mb-2">菜谱库</h3>
          <p className="text-[32px] font-black text-ink">{stats?.total_dishes ?? 0} <span className="text-[14px] text-ink-light">ITEMS</span></p>
        </div>

        <div className="paper-card p-8 group hover:border-sage/30 transition-all cursor-pointer active:scale-[0.98]" onClick={() => navigate('/logs')}>
          <div className="h-12 w-12 rounded-2xl bg-paper flex items-center justify-center text-sage mb-6 group-hover:scale-110 group-hover:bg-sage/10 transition-all">
            <History className="h-6 w-6" />
          </div>
          <h3 className="text-[14px] font-black text-ink-light uppercase tracking-widest mb-2">累计下厨</h3>
          <p className="text-[32px] font-black text-ink">{stats?.total_logs ?? 0} <span className="text-[14px] text-ink-light">TIMES</span></p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/order')}
          className="p-8 rounded-2xl border border-sage/20 bg-sage text-white active:scale-[0.98] transition-all text-left hover:bg-sage-dark shadow-paper"
        >
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6">
            <Timer className="h-6 w-6" />
          </div>
          <h3 className="text-[14px] font-black text-white/80 uppercase tracking-widest mb-2">今日点菜</h3>
          <p className="text-[32px] font-black leading-tight">
            {totalOrderedItems} <span className="text-[14px] text-white/80">ITEMS</span>
          </p>
          <p className="mt-2 text-[12px] font-bold text-white/80">已选菜谱 {selectedCount} · 期望菜品 {wishlistCount}</p>
        </button>
      </div>

      {/* Journal Section */}
      <section>
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-[24px] font-black text-ink">烹饪日志 · <span className="text-ink-light font-bold">Journal</span></h2>
          <button onClick={() => navigate('/logs')} className="text-[13px] font-black text-sage flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
            查看全部 <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-6 items-start">
            <div className="hidden md:block w-32 shrink-0 pt-2 text-right">
              <span className="text-[13px] font-black text-ink-light uppercase tracking-tighter">TIMELINE</span>
            </div>
            <div
              className="paper-card flex-1 p-6 flex items-center justify-between group cursor-pointer hover:border-sage/30 transition-all active:scale-[0.995]"
              onClick={() => navigate('/logs')}
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-paper flex items-center justify-center text-2xl group-hover:bg-sage/10 group-hover:scale-105 transition-all">🍳</div>
                <div>
                  <h4 className="text-[16px] font-black text-ink group-hover:text-sage transition-colors">开启我的时光轴</h4>
                  <p className="text-[13px] font-bold text-ink-light mt-0.5">点击回顾您每一次在厨房的精彩瞬间</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-paper flex items-center justify-center text-sage group-hover:bg-sage group-hover:text-white transition-all shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
