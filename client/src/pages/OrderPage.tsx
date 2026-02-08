import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, X, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dishAPI } from '../services/api';
import { Dish } from '../types';

const ORDER_PLAN_KEY = 'dishhub_order_plan';

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistInput, setWishlistInput] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dishList = await dishAPI.getAllDishes();
        setDishes(dishList);
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
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.selectedDishIds)) {
        setSelectedDishIds(parsed.selectedDishIds.filter((id: unknown) => Number.isInteger(id) && Number(id) > 0));
      }
      if (Array.isArray(parsed?.wishlistItems)) {
        setWishlistItems(parsed.wishlistItems.map((item: unknown) => String(item).trim()).filter(Boolean));
      }
    } catch {
      localStorage.removeItem(ORDER_PLAN_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ORDER_PLAN_KEY,
      JSON.stringify({
        selectedDishIds,
        wishlistItems,
      })
    );
  }, [selectedDishIds, wishlistItems]);

  const toggleDish = (id: number) => {
    setSelectedDishIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const addWishlistItem = () => {
    const value = wishlistInput.trim();
    if (!value) return;

    if (wishlistItems.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setWishlistInput('');
      return;
    }

    setWishlistItems((prev) => [...prev, value]);
    setWishlistInput('');
  };

  const removeWishlistItem = (itemToRemove: string) => {
    setWishlistItems((prev) => prev.filter((item) => item !== itemToRemove));
  };

  const selectedDishes = dishes.filter((dish) => selectedDishIds.includes(dish.id));

  if (loading) return null;

  return (
    <div className="max-w-[900px] mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <header className="flex items-center justify-between px-1">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-[14px] font-bold text-sage">
          <ChevronLeft className="h-4 w-4" /> 返回
        </button>
        <button
          type="button"
          onClick={() => navigate('/library')}
          className="paper-button !px-4 !py-2 text-[13px]"
        >
          去菜谱库
        </button>
      </header>

      <section>
        <h1 className="text-[42px] font-black text-ink leading-tight">今日点菜</h1>
        <p className="mt-2 text-[16px] font-bold text-ink-light">从现有菜谱里挑选，也可以补充今天想吃的新菜。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[12px] font-black text-ink-light uppercase tracking-widest">从菜谱库选择</h2>
        {dishes.length === 0 ? (
          <div className="paper-card bg-paper/20 border-dashed p-5 text-[13px] font-bold text-ink-light">
            暂无可选菜谱，先去菜谱库新增几道吧。
          </div>
        ) : (
          <div className="rounded-2xl border border-paper divide-y divide-paper bg-paper/20">
            {dishes.map((dish) => {
              const checked = selectedDishIds.includes(dish.id);
              return (
                <label key={dish.id} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/60 transition-colors">
                  <div>
                    <p className="text-[15px] font-black text-ink">{dish.name}</p>
                    <p className="text-[11px] font-bold text-ink-light uppercase tracking-widest mt-0.5">{dish.category}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDish(dish.id)}
                    className="h-4 w-4 accent-sage"
                  />
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[12px] font-black text-ink-light uppercase tracking-widest">期望加入菜单</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={wishlistInput}
            onChange={(e) => setWishlistInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addWishlistItem();
              }
            }}
            placeholder="例如：酸汤肥牛"
            className="flex-1 h-11 px-4 rounded-xl bg-paper border-transparent text-[14px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-sage/20 transition-all"
          />
          <button type="button" onClick={addWishlistItem} className="paper-button !rounded-xl !px-4 !py-0 h-11 shrink-0">
            <Plus className="h-4 w-4" strokeWidth={3} />
            添加
          </button>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {wishlistItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => removeWishlistItem(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper text-[12px] font-black text-ink hover:bg-paper-stone transition-colors"
              >
                {item}
                <X className="h-3.5 w-3.5 text-ink-light" />
              </button>
            ))}
          </div>
        )}
      </section>

      {(selectedDishes.length > 0 || wishlistItems.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-[12px] font-black text-ink-light uppercase tracking-widest flex items-center gap-2">
            <ListChecks className="h-3.5 w-3.5" />
            本次点菜清单
          </h2>
          <div className="paper-card p-5 space-y-2">
            {selectedDishes.map((dish) => (
              <p key={dish.id} className="text-[14px] font-bold text-ink">• {dish.name}</p>
            ))}
            {wishlistItems.map((item) => (
              <p key={`wish-${item}`} className="text-[14px] font-bold text-ink-light">• {item}（期望）</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrderPage;
