import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, Star, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { dishAPI } from '../services/api';
import { Dish } from '../types';

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadDish = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const dishData = await dishAPI.getDish(parseInt(id));
        setDish(dishData);
        setError(null);
      } catch (err) {
        console.error('加载菜品失败:', err);
        setError('菜品不存在或加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  const handleDelete = async () => {
    if (!dish || !window.confirm('确定要删除这道菜品吗？')) return;

    try {
      setDeleting(true);
      await dishAPI.deleteDish(dish.id);
      navigate('/');
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const getDifficultyText = (difficulty: number) => {
    const levels = ['', '简单', '一般', '中等', '困难', '大师'];
    return levels[difficulty] || '未知';
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['', 'text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];
    return colors[difficulty] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <Link to="/" className="btn btn-primary">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>返回菜单</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 菜品图片 */}
        <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-primary-400 text-6xl">🍽️</div>
          )}
        </div>

        <div className="p-6">
          {/* 标题和操作 */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {dish.category}
              </span>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/edit/${dish.id}`}
                className="btn btn-secondary flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>编辑</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleting ? '删除中...' : '删除'}</span>
              </button>
            </div>
          </div>

          {/* 标签 */}
          {dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {dish.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 基本信息 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">{dish.cooking_time}</div>
              <div className="text-sm text-gray-600">分钟</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">{dish.servings}</div>
              <div className="text-sm text-gray-600">人份</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Star className={`h-6 w-6 mx-auto mb-2 ${getDifficultyColor(dish.difficulty)}`} />
              <div className={`text-lg font-semibold ${getDifficultyColor(dish.difficulty)}`}>
                {getDifficultyText(dish.difficulty)}
              </div>
              <div className="text-sm text-gray-600">难度</div>
            </div>
          </div>

          {/* 食材列表 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">所需食材</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {dish.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 制作步骤 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">制作步骤</h2>
            <div className="space-y-4">
              {dish.instructions.map((instruction, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetailPage;
