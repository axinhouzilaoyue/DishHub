import React, { useEffect, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import DishCard from '../components/DishCard';
import LoadingSpinner from '../components/LoadingSpinner';
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
    if (isComposing) {
      return;
    }

    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 320);

    return () => clearTimeout(timer);
  }, [isComposing, searchInput]);

  const hasFilters = Boolean(searchTerm) || selectedCategory !== 'all';

  return (
    <div className="page-stack">
      <section className="hero-panel library-hero">
        <p className="eyebrow">菜谱库</p>
        <h1 className="hero-title">查看与筛选菜品</h1>
        <p className="hero-subtitle">所有菜品浏览、搜索与筛选统一在此页面进行。</p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <p className="muted-text">共 {dishes.length} 道匹配菜品</p>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search className="h-4 w-4" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="搜索菜名、食材、步骤..."
              aria-label="搜索菜品"
            />
          </div>

          <label className="select-wrap">
            <Filter className="h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner message="正在检索菜品..." />
      ) : error ? (
        <section className="alert-card">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            重试
          </button>
        </section>
      ) : dishes.length === 0 ? (
        <section className="empty-card">
          <h2>{hasFilters ? '没有匹配结果' : '还没有录入菜品'}</h2>
          <p>{hasFilters ? '请尝试调整关键字或筛选条件。' : '从“添加菜品”开始建立家庭菜单。'}</p>
        </section>
      ) : (
        <section className="dish-grid">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </section>
      )}
    </div>
  );
};

export default LibraryPage;
