import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Minus, Plus, Save, X } from 'lucide-react';
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
    if (!dish) {
      return;
    }

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
    const fallback = [
      DEFAULT_CATEGORY,
      '川菜',
      '粤菜',
      '湘菜',
      '鲁菜',
      '苏菜',
      '浙菜',
      '徽菜',
      '闽菜',
      '西餐',
      '日料',
      '韩料',
      '其他',
    ];

    const merged = categories.length > 0 ? [...categories] : fallback;
    if (!merged.includes(formData.category)) {
      merged.unshift(formData.category);
    }

    return Array.from(new Set(merged));
  }, [categories, formData.category]);

  const handleInputChange = (field: keyof DishFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'ingredients' | 'instructions', index: number) => {
    if (formData[field].length <= 1) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleTagsChange = (value: string) => {
    handleInputChange('tags', formatTags(value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入菜品名称');
      return;
    }

    const validIngredients = formData.ingredients.map((item) => item.trim()).filter(Boolean);
    const validInstructions = formData.instructions.map((item) => item.trim()).filter(Boolean);

    if (validIngredients.length === 0) {
      alert('请至少添加一个食材');
      return;
    }

    if (validInstructions.length === 0) {
      alert('请至少添加一个制作步骤');
      return;
    }

    try {
      setLoading(true);
      const payload: DishFormData = {
        ...formData,
        ingredients: validIngredients,
        instructions: validInstructions,
      };

      if (isEditing && dish) {
        await dishAPI.updateDish(dish.id, payload);
        navigate(`/dish/${dish.id}`);
        return;
      }

      const created = await dishAPI.createDish(payload);
      navigate(`/dish/${created.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel panel-form">
      <div className="panel-header">
        <div>
          <p className="eyebrow">菜品编辑</p>
          <h1>{isEditing ? '编辑菜品' : '添加新菜品'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <section className="form-section">
          <h2 className="section-title">基础信息</h2>

          <div className="field-grid">
            <label className="field-wrap">
              <span>菜品名称 *</span>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                className="field-input"
                placeholder="请输入菜品名称"
                required
              />
            </label>

            <label className="field-wrap">
              <span>分类</span>
              <select
                value={formData.category}
                onChange={(event) => handleInputChange('category', event.target.value)}
                className="field-input"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-wrap">
              <span>难度等级</span>
              <select
                value={formData.difficulty}
                onChange={(event) => handleInputChange('difficulty', parseInt(event.target.value, 10))}
                className="field-input"
              >
                <option value={1}>简单</option>
                <option value={2}>一般</option>
                <option value={3}>中等</option>
                <option value={4}>困难</option>
                <option value={5}>大师</option>
              </select>
            </label>

            <label className="field-wrap">
              <span>制作时间（分钟）</span>
              <input
                type="number"
                value={formData.cooking_time}
                onChange={(event) =>
                  handleInputChange('cooking_time', parseInt(event.target.value, 10) || 1)
                }
                className="field-input"
                min="1"
                max="1440"
              />
            </label>

            <label className="field-wrap">
              <span>份量（人份）</span>
              <input
                type="number"
                value={formData.servings}
                onChange={(event) => handleInputChange('servings', parseInt(event.target.value, 10) || 1)}
                className="field-input"
                min="1"
                max="50"
              />
            </label>

            <label className="field-wrap">
              <span>图片 URL（可选）</span>
              <input
                type="url"
                value={formData.image}
                onChange={(event) => handleInputChange('image', event.target.value)}
                className="field-input"
                placeholder="https://..."
              />
            </label>

            <div className="field-wrap field-span-2">
              <label className="field-label" htmlFor="tutorialUrl">
                教程链接（可选）
              </label>
              <div className="tutorial-input-wrap">
                <input
                  id="tutorialUrl"
                  type="url"
                  value={formData.tutorial_url}
                  onChange={(event) => handleInputChange('tutorial_url', event.target.value)}
                  className="field-input"
                  placeholder="https://www.bilibili.com/video/..."
                />
                {formData.tutorial_url && (
                  <a
                    href={formData.tutorial_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tutorial-link"
                    title="在新窗口打开教程"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="hint-text">支持 B 站、YouTube 等视频教程链接。</p>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">标签与食材</h2>

          <label className="field-wrap">
            <span>标签（用逗号分隔）</span>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(event) => handleTagsChange(event.target.value)}
              className="field-input"
              placeholder="例如：辣、下饭、简单"
            />
          </label>

          <div>
            <label className="field-label">所需食材 *</label>
            <div className="list-editor">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="list-row">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(event) => handleArrayChange('ingredients', index, event.target.value)}
                    className="field-input"
                    placeholder={`食材 ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('ingredients', index)}
                    disabled={formData.ingredients.length <= 1}
                    className="icon-action danger"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => addArrayItem('ingredients')} className="ghost-action">
                <Plus className="h-4 w-4" />
                添加食材
              </button>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">制作步骤</h2>

          <div className="list-editor">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="step-row">
                <span className="step-index">{index + 1}</span>
                <textarea
                  value={instruction}
                  onChange={(event) => handleArrayChange('instructions', index, event.target.value)}
                  className="field-input field-textarea"
                  rows={2}
                  placeholder={`步骤 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('instructions', index)}
                  disabled={formData.instructions.length <= 1}
                  className="icon-action danger"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button type="button" onClick={() => addArrayItem('instructions')} className="ghost-action">
              <Plus className="h-4 w-4" />
              添加步骤
            </button>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-glass">
            <X className="h-4 w-4" />
            取消
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save className="h-4 w-4" />
            {loading ? '保存中...' : '保存菜品'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DishForm;
