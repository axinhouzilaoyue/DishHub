import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star } from 'lucide-react';
import { Dish } from '../types';
import { getDifficultyText, getDifficultyColor } from '../utils/dish';

interface DishCardProps {
  dish: Dish;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  return (
    <Link to={`/dish/${dish.id}`} className="dish-card" aria-label={`查看菜品 ${dish.name}`}>
      <div className="dish-card-image">
        <div className="dish-image-wrap">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="dish-image"
            />
          ) : (
            <div className="dish-image-placeholder">🍽️</div>
          )}
        </div>
      </div>

      <div className="dish-card-content">
        <div className="dish-card-header">
          <h3>{dish.name}</h3>
          <span className="dish-category">{dish.category}</span>
        </div>

        {dish.tags.length > 0 && (
          <div className="tag-row">
            {dish.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
            {dish.tags.length > 3 && <span className="tag-pill muted">+{dish.tags.length - 3}</span>}
          </div>
        )}

        <div className="dish-meta">
          <div className="meta-group">
            <span>
              <Clock className="h-4 w-4" />
              {dish.cooking_time}分钟
            </span>
            <span>
              <Users className="h-4 w-4" />
              {dish.servings}人份
            </span>
          </div>
          <span className={`difficulty-badge ${getDifficultyColor(dish.difficulty)}`}>
            <Star className="h-4 w-4" />
            {getDifficultyText(dish.difficulty)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DishCard;
