import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star } from 'lucide-react';
import { Dish } from '../types';

interface DishCardProps {
  dish: Dish;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const getDifficultyText = (difficulty: number) => {
    const levels = ['', '简单', '一般', '中等', '困难', '大师'];
    return levels[difficulty] || '未知';
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['', 'text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];
    return colors[difficulty] || 'text-gray-600';
  };

  return (
    <Link to={`/dish/${dish.id}`} className="block">
      <div className="card p-6 hover:shadow-md transition-shadow duration-200">
        {/* 菜品图片占位 */}
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-primary-400 text-4xl">🍽️</div>
          )}
        </div>

        {/* 菜品信息 */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
              {dish.name}
            </h3>
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {dish.category}
            </span>
          </div>

          {/* 标签 */}
          {dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dish.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {dish.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                  +{dish.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 详细信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{dish.cooking_time}分钟</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{dish.servings}人份</span>
              </div>
            </div>
            <div className={`flex items-center space-x-1 ${getDifficultyColor(dish.difficulty)}`}>
              <Star className="h-4 w-4" />
              <span>{getDifficultyText(dish.difficulty)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DishCard;
