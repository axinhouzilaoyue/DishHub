import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Edit, ExternalLink, Play, Star, Trash2, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { dishAPI } from '../services/api';
import { Dish } from '../types';
import { getDifficultyColor, getDifficultyText } from '../utils/dish';

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDish = async () => {
      if (!id) {
        setError('菜品 ID 缺失');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await dishAPI.getDish(parseInt(id, 10));
        setDish(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '菜品加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  const handleDelete = async () => {
    if (!dish) {
      return;
    }

    const confirmed = window.confirm(`确定删除「${dish.name}」吗？`);
    if (!confirmed) {
      return;
    }

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

  if (loading) {
    return <LoadingSpinner message="正在加载菜品详情..." />;
  }

  if (error || !dish) {
    return (
      <section className="empty-card">
        <h2>菜品不可用</h2>
        <p>{error || '未找到该菜品'}</p>
        <Link to="/library" className="btn btn-primary">
          返回菜谱库
        </Link>
      </section>
    );
  }

  return (
    <section className="panel dish-detail-panel">
      <Link to="/library" className="text-link inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回菜谱库
      </Link>

      <div className="detail-image-wrap">
        <div className="detail-image-inner">
          {dish.image ? (
            <img src={dish.image} alt={dish.name} className="detail-image" />
          ) : (
            <div className="dish-image-placeholder">🍽️</div>
          )}
        </div>
      </div>

      <div className="detail-content">
        <header className="detail-header">
          <div>
            <h1 className="detail-title">{dish.name}</h1>
            <span className="dish-category">{dish.category}</span>
          </div>
          <div className="detail-actions">
            <Link to={`/dish/${dish.id}/edit`} className="btn btn-glass">
              <Edit className="h-4 w-4" />
              编辑
            </Link>
            <button onClick={handleDelete} disabled={deleting} className="btn btn-danger-soft">
              <Trash2 className="h-4 w-4" />
              {deleting ? '删除中...' : '删除'}
            </button>
          </div>
        </header>

        {dish.tags.length > 0 && (
          <div className="tag-row">
            {dish.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        {dish.tutorial_url && (
          <a href={dish.tutorial_url} target="_blank" rel="noopener noreferrer" className="btn btn-glass">
            <Play className="h-4 w-4" />
            观看视频教程
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        <div className="stats-grid three">
          <article className="stat-card compact">
            <div className="stat-icon text-sky-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="stat-label">制作时长</p>
              <p className="stat-value">{dish.cooking_time} 分钟</p>
            </div>
          </article>

          <article className="stat-card compact">
            <div className="stat-icon text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="stat-label">份量</p>
              <p className="stat-value">{dish.servings} 人份</p>
            </div>
          </article>

          <article className="stat-card compact">
            <div className={`stat-icon ${getDifficultyColor(dish.difficulty)}`}>
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="stat-label">难度</p>
              <p className={`stat-value ${getDifficultyColor(dish.difficulty)}`}>
                {getDifficultyText(dish.difficulty)}
              </p>
            </div>
          </article>
        </div>

        <section className="detail-section">
          <h2>所需食材</h2>
          <ul className="ingredient-list">
            {dish.ingredients.map((ingredient, index) => (
              <li key={`${ingredient}-${index}`}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2>制作步骤</h2>
          <ol className="instruction-list">
            {dish.instructions.map((instruction, index) => (
              <li key={index}>
                <span className="step-index">{index + 1}</span>
                <p>{instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
};

export default DishDetailPage;
