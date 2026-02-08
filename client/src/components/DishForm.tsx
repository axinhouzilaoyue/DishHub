import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, ChevronRight, Info, Hash, ListChecks, ChefHat, Save, X } from 'lucide-react';
import { Dish, DishFormData } from '../types';
import { dishAPI } from '../services/api';
import { formatTags } from '../utils/dish';
import { useDishCategories } from '../hooks/useDishCategories';

interface DishFormProps {
  dish?: Dish;
  isEditing?: boolean;
}

const DEFAULT_CATEGORY = '家常菜';

const DishForm: React.FC<DishFormProps> = ({ dish, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { categories } = useDishCategories();
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    category: DEFAULT_CATEGORY,
    difficulty: 1,
    cooking_time: 30,
    servings: 2,
    ingredients: [''],
    instructions: [''],
    image: '',
    tags: [],
    tutorial_url: '',
  });

  useEffect(() => {
    if (!dish) return;
    setFormData({
      name: dish.name,
      category: dish.category,
      difficulty: dish.difficulty,
      cooking_time: dish.cooking_time,
      servings: dish.servings,
      ingredients: dish.ingredients.length > 0 ? dish.ingredients : [''],
      instructions: dish.instructions.length > 0 ? dish.instructions : [''],
      image: dish.image || '',
      tags: dish.tags,
      tutorial_url: dish.tutorial_url || '',
    });
  }, [dish]);

  const categoryOptions = useMemo(() => {
    const fallback = [DEFAULT_CATEGORY, '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '徽菜', '闽菜', '西餐', '日料', '韩料', '其他'];
    const merged = categories.length > 0 ? [...categories] : fallback;
    if (!merged.includes(formData.category)) merged.unshift(formData.category);
    return Array.from(new Set(merged));
  }, [categories, formData.category]);

  const handleInputChange = (field: keyof DishFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'ingredients' | 'instructions', index: number) => {
    if (formData[field].length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return alert('请输入菜品名称');
    const validIngredients = formData.ingredients.map((item) => item.trim()).filter(Boolean);
    const validInstructions = formData.instructions.map((item) => item.trim()).filter(Boolean);
    if (validIngredients.length === 0) return alert('请至少添加一个食材');
    if (validInstructions.length === 0) return alert('请至少添加一个制作步骤');

    try {
      setLoading(true);
      const payload: DishFormData = { ...formData, ingredients: validIngredients, instructions: validInstructions };
      if (isEditing && dish) {
        await dishAPI.updateDish(dish.id, payload);
        navigate(`/dish/${dish.id}`);
      } else {
        const created = await dishAPI.createDish(payload);
        navigate(`/dish/${created.id}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const rowClasses = "flex items-center justify-between p-4 px-5 border-b border-paper last:border-0";
  const labelClasses = "text-[13px] font-black text-ink-light uppercase tracking-widest";
  const inputClasses = "flex-1 text-right bg-transparent text-[14px] font-bold text-ink outline-none placeholder:text-paper-stone";

  return (
    <div className="max-w-[800px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      <header className="px-1 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-black text-ink">{isEditing ? '编辑菜品' : '新增菜品'}</h1>
          <p className="text-[14px] font-bold text-ink-light mt-1 italic">每一份配方都是独一无二的珍藏</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section: Basic Info */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1 text-[11px] font-black text-sage uppercase tracking-[0.2em]">
            <Info className="h-3.5 w-3.5" />
            <span>基础信息 (BASIC INFO)</span>
          </div>
          <div className="paper-card divide-y divide-paper">
            <div className={rowClasses}>
              <span className={labelClasses}>菜品名称</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={inputClasses}
                placeholder="必填"
                required
              />
            </div>
            <div className={rowClasses}>
              <span className={labelClasses}>所属分类</span>
              <div className="flex items-center gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronRight className="h-3.5 w-3.5 text-paper-stone rotate-90" />
              </div>
            </div>
            <div className={rowClasses}>
              <span className={labelClasses}>制作时长 (分钟)</span>
              <input
                type="number"
                value={formData.cooking_time}
                onChange={(e) => handleInputChange('cooking_time', parseInt(e.target.value, 10) || 1)}
                className={inputClasses}
              />
            </div>
            <div className={rowClasses}>
              <span className={labelClasses}>建议份量 (人)</span>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value, 10) || 1)}
                className={inputClasses}
              />
            </div>
          </div>
        </section>

        {/* Section: Assets */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1 text-[11px] font-black text-sage uppercase tracking-[0.2em]">
            <Hash className="h-3.5 w-3.5" />
            <span>媒体与标签 (ASSETS & TAGS)</span>
          </div>
          <div className="paper-card divide-y divide-paper">
            <div className={rowClasses}>
              <span className={labelClasses}>图片 URL</span>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className={inputClasses}
                placeholder="https://..."
              />
            </div>
            <div className={rowClasses}>
              <span className={labelClasses}>视频教程</span>
              <input
                type="url"
                value={formData.tutorial_url}
                onChange={(e) => handleInputChange('tutorial_url', e.target.value)}
                className={inputClasses}
                placeholder="B 站 / YouTube"
              />
            </div>
            <div className={rowClasses}>
              <span className={labelClasses}>菜品标签</span>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleInputChange('tags', formatTags(e.target.value))}
                className={inputClasses}
                placeholder="用逗号分隔"
              />
            </div>
          </div>
        </section>

        {/* Section: Ingredients */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-black text-sage uppercase tracking-[0.2em]">
              <ListChecks className="h-3.5 w-3.5" />
              <span>食材清单</span>
            </div>
            <button type="button" onClick={() => addArrayItem('ingredients')} className="text-[11px] font-black text-sage hover:underline uppercase tracking-widest transition-all">
              添加项
            </button>
          </div>
          <div className="paper-card divide-y divide-paper bg-white/50">
            {formData.ingredients.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 px-5 group">
                <div className="h-1.5 w-1.5 rounded-full bg-sage/30 group-focus-within:bg-sage" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('ingredients', idx, e.target.value)}
                  className="flex-1 bg-transparent text-[14px] font-bold text-ink outline-none"
                  placeholder={`食材 ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('ingredients', idx)}
                  className="p-1 text-cinnamon opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                  disabled={formData.ingredients.length <= 1}
                >
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Instructions */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-black text-sage uppercase tracking-[0.2em]">
              <ChefHat className="h-3.5 w-3.5" />
              <span>制作步骤</span>
            </div>
            <button type="button" onClick={() => addArrayItem('instructions')} className="text-[11px] font-black text-sage hover:underline uppercase tracking-widest transition-all">
              添加项
            </button>
          </div>
          <div className="paper-card divide-y divide-paper bg-white/50">
            {formData.instructions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 px-5 group">
                <span className="mt-1 text-[13px] font-black text-sage tabular-nums">{idx + 1}.</span>
                <textarea
                  value={item}
                  onChange={(e) => handleArrayChange('instructions', idx, e.target.value)}
                  className="flex-1 bg-transparent text-[14px] font-bold text-ink outline-none resize-none min-h-[60px] leading-relaxed"
                  placeholder={`描述步骤 ${idx + 1} 的具体细节...`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('instructions', idx)}
                  className="mt-1 p-1 text-cinnamon opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                  disabled={formData.instructions.length <= 1}
                >
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Action Bar */}
        <div className="fixed inset-x-0 bottom-8 z-40 px-6 pointer-events-none">
          <div className="mx-auto max-w-[600px] bg-ink/90 backdrop-blur-xl rounded-2xl p-4 flex gap-4 shadow-paper-deep border border-white/10 pointer-events-auto animate-in slide-in-from-bottom-8 duration-500">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl bg-white/10 border border-white/10 py-3 text-[14px] font-bold text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              放弃更改
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] rounded-xl bg-sage py-3 text-[14px] font-black text-white hover:bg-sage-dark active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4.5 w-4.5" strokeWidth={2.5} />
              {loading ? '正在同步...' : '保存配方档案'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DishForm;
