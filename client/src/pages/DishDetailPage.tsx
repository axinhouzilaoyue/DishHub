import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { dishAPI } from '../services/api';
import { Dish } from '../types';
import { getDifficultyText } from '../utils/dish';

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between px-1">
        <Link to="/library" className="flex items-center gap-1 text-[15px] font-medium text-[#007AFF]">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <div className="flex gap-4">
          <Link to={`/dish/${dish.id}/edit`} className="text-[15px] font-medium text-[#007AFF]">编辑</Link>
          <button onClick={handleDelete} disabled={deleting} className="text-[15px] font-medium text-[#FF3B30] disabled:opacity-50">
            {deleting ? '删除中' : '删除'}
          </button>
        </div>
      </header>

      {/* Main Info Inset Group */}
      <section className="ios-grouped-section divide-y divide-[#E5E5EA]">
        <div className="p-0">
          {dish.image ? (
            <img src={dish.image} alt={dish.name} className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-[21/9] w-full items-center justify-center bg-slate-100 text-6xl">🍽️</div>
          )}
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-[#1C1C1E]">{dish.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#007AFF] uppercase tracking-wider">{dish.category}</span>
            {dish.tags.length > 0 && (
              <div className="flex gap-1.5 border-l border-[#E5E5EA] pl-2">
                {dish.tags.map(tag => (
                  <span key={tag} className="text-[12px] text-[#8E8E93]">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#E5E5EA]">
          <div className="py-3 text-center">
            <p className="text-[10px] font-bold uppercase text-[#8E8E93]">时长</p>
            <p className="text-[14px] font-semibold">{dish.cooking_time}m</p>
          </div>
          <div className="py-3 text-center">
            <p className="text-[10px] font-bold uppercase text-[#8E8E93]">份量</p>
            <p className="text-[14px] font-semibold">{dish.servings}p</p>
          </div>
          <div className="py-3 text-center">
            <p className="text-[10px] font-bold uppercase text-[#8E8E93]">难度</p>
            <p className="text-[14px] font-semibold">{getDifficultyText(dish.difficulty)}</p>
          </div>
        </div>
        {dish.tutorial_url && (
          <a href={dish.tutorial_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <Play className="h-4 w-4 text-[#007AFF] fill-current" />
              <span className="text-[15px] font-medium text-[#1C1C1E]">观看视频教程</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#C7C7CC]" />
          </a>
        )}
      </section>

      {/* Ingredients Group */}
      <section>
        <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-[#8E8E93]">所需食材</h2>
        <div className="ios-grouped-section divide-y divide-[#E5E5EA]">
          {dish.ingredients.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#C7C7CC]" />
              <span className="text-[15px] font-medium text-[#3A3A3C]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions Group */}
      <section>
        <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-[#8E8E93]">制作步骤</h2>
        <div className="ios-grouped-section divide-y divide-[#E5E5EA]">
          {dish.instructions.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4">
              <span className="text-[15px] font-bold text-[#007AFF] tabular-nums">{idx + 1}.</span>
              <p className="text-[15px] leading-relaxed text-[#3A3A3C]">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DishDetailPage;
