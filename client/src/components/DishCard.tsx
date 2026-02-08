import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, ArrowUpRight } from 'lucide-react';
import { Dish } from '../types';
import { getDifficultyText } from '../utils/dish';

interface DishCardProps {
  dish: Dish;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  return (
    <Link
      to={`/dish/${dish.id}`}
      className="paper-card group hover:shadow-paper-deep transition-all duration-500"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        {dish.image ? (
          <img src={dish.image} alt={dish.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="h-full w-full bg-paper flex items-center justify-center text-5xl grayscale opacity-40">🍲</div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-black text-sage uppercase tracking-widest shadow-sm">
            {dish.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-sage/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-sage scale-0 group-hover:scale-100 transition-transform duration-500 shadow-xl">
            <ArrowUpRight className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-[19px] font-black text-ink mb-3 line-clamp-1">{dish.name}</h3>

        <div className="flex items-center justify-between border-t border-paper pt-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[12px] font-bold text-ink-light">
              <Clock className="h-3 w-3" />
              <span>{dish.cooking_time}m</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold text-ink-light">
              <Users className="h-3 w-3" />
              <span>{dish.servings}p</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-[12px] font-black text-cinnamon uppercase tracking-tighter">
            <Star className="h-2.5 w-2.5 fill-current" />
            {getDifficultyText(dish.difficulty)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DishCard;
