import React, { useEffect, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import DishCard from '../components/DishCard';
import { useDishCategories } from '../hooks/useDishCategories';
import { useDishLibrary } from '../hooks/useDishLibrary';

const LibraryPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isComposing, setIsComposing] = useState(false);

  const { categories } = useDishCategories();
  const { dishes, loading, error, reload } = useDishLibrary({
    category: selectedCategory,
    search: searchTerm,
  });

  useEffect(() => {
    if (isComposing) return;
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 320);
    return () => clearTimeout(timer);
  }, [isComposing, searchInput]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-[32px] font-black text-ink">美食档案 · <span className="text-sage">Gallery</span></h1>
          <p className="text-[14px] font-bold text-ink-light mt-1">目前共有 {dishes.length} 道佳肴已归档</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-light group-focus-within:text-sage transition-colors" />
            <input
              type="text"
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-paper border border-transparent focus:bg-white focus:border-sage/20 focus:ring-4 focus:ring-sage/5 outline-none text-[14px] font-bold transition-all"
              placeholder="寻找美味..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-paper text-[13px] font-black text-ink outline-none cursor-pointer hover:bg-paper-stone transition-colors"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-light rotate-90" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 border-4 border-sage/10 border-t-sage rounded-full animate-spin" />
          <p className="text-[13px] font-black text-ink-light uppercase tracking-widest">翻阅档案中...</p>
        </div>
      ) : error ? (
        <div className="paper-card p-12 text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button onClick={reload} className="paper-button">重新尝试</button>
        </div>
      ) : dishes.length === 0 ? (
        <div className="py-32 text-center opacity-20">
          <div className="text-8xl mb-6">🍽️</div>
          <p className="text-[20px] font-black">尚未发现匹配的档案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
