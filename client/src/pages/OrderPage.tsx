import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Plus, X, ListChecks, Check } from 'lucide-react';
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

  const sortedDishes = useMemo(() => {
    return [...dishes].sort((a, b) => {
      const categoryCompare = a.category.localeCompare(b.category, 'zh-CN');
      if (categoryCompare !== 0) return categoryCompare;
      return a.name.localeCompare(b.name, 'zh-CN');
    });
  }, [dishes]);

  const tableColumns = useMemo(() => {
    if (sortedDishes.length === 0) return [[], []] as Dish[][];

    const mid = Math.ceil(sortedDishes.length / 2);
    return [sortedDishes.slice(0, mid), sortedDishes.slice(mid)] as Dish[][];
  }, [sortedDishes]);

  if (loading) return null;

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-700 pb-28">
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
        <h1 className="text-[36px] md:text-[42px] font-black text-ink leading-tight">点菜</h1>
        <p className="mt-2 text-[15px] md:text-[16px] font-bold text-ink-light">表格式快速选择菜品，已选内容放在上方方便即时编辑。</p>
      </section>

      <section className="paper-card p-5 md:p-6 space-y-4">
        <h2 className="text-[12px] font-black text-ink-light uppercase tracking-widest flex items-center gap-2">
          <ListChecks className="h-3.5 w-3.5" />
          已选清单
        </h2>

        {selectedDishes.length === 0 && wishlistItems.length === 0 ? (
          <p className="text-[13px] font-bold text-ink-light">还没有选择菜品，先从下方表格勾选吧。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedDishes.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => toggleDish(dish.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper text-[12px] font-black text-ink hover:bg-paper-stone transition-colors"
              >
                {dish.name}
                <X className="h-3.5 w-3.5 text-ink-light" />
              </button>
            ))}
            {wishlistItems.map((item) => (
              <button
                key={`wish-${item}`}
                type="button"
                onClick={() => removeWishlistItem(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper text-[12px] font-black text-ink-light hover:bg-paper-stone transition-colors"
              >
                {item}（期望）
                <X className="h-3.5 w-3.5 text-ink-light" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="paper-card p-5 md:p-6 space-y-3">
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
            className="flex-1 h-11 px-4 rounded-xl bg-paper border-transparent text-[14px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-sage/15 transition-all"
          />
          <button type="button" onClick={addWishlistItem} className="paper-button !rounded-xl !px-4 !py-0 h-11 shrink-0">
            <Plus className="h-4 w-4" strokeWidth={3} />
            添加
          </button>
        </div>
      </section>

      <section className="paper-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-paper flex items-center justify-between">
          <h2 className="text-[12px] font-black text-ink-light uppercase tracking-widest">菜谱表格选择</h2>
          <p className="text-[12px] font-bold text-ink-light">共 {sortedDishes.length} 道</p>
        </div>

        {sortedDishes.length === 0 ? (
          <div className="p-6 text-[13px] font-bold text-ink-light">暂无可选菜谱，先去菜谱库新增几道吧。</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {tableColumns.map((column, columnIndex) => (
              <div key={columnIndex} className={columnIndex === 0 ? 'border-r border-paper max-lg:border-r-0' : ''}>
                {column.map((dish) => {
                  const checked = selectedDishIds.includes(dish.id);

                  return (
                    <label
                      key={dish.id}
                      className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3 border-b border-paper cursor-pointer transition-colors ${
                        checked ? 'bg-sage/5' : 'hover:bg-paper/35'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-ink truncate">{dish.name}</p>
                        <p className="text-[11px] font-bold text-ink-light uppercase tracking-widest mt-0.5 truncate">{dish.category}</p>
                      </div>

                      {checked && <Check className="h-4 w-4 text-sage" strokeWidth={3} />}

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
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderPage;
