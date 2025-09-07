import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { dishAPI } from '../services/api';
import { Dish } from '../types';
import DishCard from '../components/DishCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // 搜索防抖
  useEffect(() => {
    // 如果正在输入中文，不触发搜索
    if (isComposing) return;
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
  }, [searchTerm, isComposing]);

  // 搜索状态管理
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm && searchTerm !== '') {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 只有在真正需要重新加载时才显示loading
        if (dishes.length === 0) {
          setLoading(true);
        }
        
        const [dishesData, categoriesData] = await Promise.all([
          dishAPI.getAllDishes({
            search: debouncedSearchTerm || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          }),
          dishAPI.getCategories(),
        ]);
        setDishes(dishesData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('加载数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    loadData();
  }, [debouncedSearchTerm, selectedCategory]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 立即触发搜索（跳过防抖）
    setDebouncedSearchTerm(searchTerm);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的家庭菜单</h1>
        <p className="text-gray-600">记录美味，分享快乐</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索菜品名称、食材或制作方法..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                className="input pl-10 pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </form>

          {/* 分类筛选 */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-auto min-w-[120px]"
            >
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 菜品列表 */}
      {dishes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {searchTerm || selectedCategory !== 'all' ? '没有找到匹配的菜品' : '还没有添加任何菜品'}
          </div>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' ? '试试调整搜索条件' : '开始添加你的第一道菜品吧！'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              找到 {dishes.length} 道菜品
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
