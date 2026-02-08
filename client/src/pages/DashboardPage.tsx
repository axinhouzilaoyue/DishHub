import React, { useEffect, useState } from 'react';
import { Timer, Soup, History, Zap } from 'lucide-react';
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
    <div className="space-y-11">
      <section className="max-w-[980px]">
        <div className="flex items-center gap-3 mb-5">
          <div className="px-3 py-1 rounded-full bg-sage/10 text-sage text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-3 w-3 fill-current" />
            Kitchen Insight
          </div>
        </div>

        <h1 className="text-[34px] md:text-[48px] font-black text-ink leading-tight md:whitespace-nowrap mb-4">
          主厨，今天想创造什么新味道？
        </h1>

        <p className="text-[16px] md:text-[18px] font-bold text-ink-light leading-relaxed md:whitespace-nowrap">
          目前您的菜谱库中收录了 {stats?.total_dishes ?? 0} 道美味，共记录了 {stats?.total_logs ?? 0} 次真实的烹饪时光。
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="paper-card p-7 group hover:border-sage/25 transition-all cursor-pointer" onClick={() => navigate('/library')}>
          <div className="h-11 w-11 rounded-2xl bg-paper flex items-center justify-center text-sage mb-5 group-hover:bg-sage/10 transition-all">
            <Soup className="h-5 w-5" />
          </div>
          <h3 className="text-[13px] font-black text-ink-light uppercase tracking-widest mb-2">菜谱库</h3>
          <p className="text-[31px] font-black text-ink">{stats?.total_dishes ?? 0} <span className="text-[13px] text-ink-light">ITEMS</span></p>
        </div>

        <div className="paper-card p-7 group hover:border-sage/25 transition-all cursor-pointer" onClick={() => navigate('/logs')}>
          <div className="h-11 w-11 rounded-2xl bg-paper flex items-center justify-center text-sage mb-5 group-hover:bg-sage/10 transition-all">
            <History className="h-5 w-5" />
          </div>
          <h3 className="text-[13px] font-black text-ink-light uppercase tracking-widest mb-2">累计下厨</h3>
          <p className="text-[31px] font-black text-ink">{stats?.total_logs ?? 0} <span className="text-[13px] text-ink-light">TIMES</span></p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/order')}
          className="paper-card p-7 border border-paper-stone/70 bg-white text-ink text-left hover:border-sage/25 transition-all"
        >
          <div className="h-11 w-11 rounded-2xl bg-paper flex items-center justify-center text-sage mb-5">
            <Timer className="h-5 w-5" />
          </div>
          <h3 className="text-[13px] font-black text-ink-light uppercase tracking-widest mb-2">点菜</h3>
          <p className="text-[31px] font-black leading-tight text-ink">
            {totalOrderedItems} <span className="text-[13px] text-ink-light">ITEMS</span>
          </p>
          <p className="mt-2 text-[12px] font-bold text-ink-light">已选菜谱 {selectedCount} · 期望菜品 {wishlistCount}</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
