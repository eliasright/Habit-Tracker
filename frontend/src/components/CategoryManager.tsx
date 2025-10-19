import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../config/apiClient';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerProps {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  type?: 'todos' | 'habits' | 'dailies';
}

export default function CategoryManager({ 
  value, 
  onChange, 
  placeholder = "Select a category", 
  type = 'todos' 
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#f97316');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#f97316', // Orange
    '#ef4444', // Red
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const calculateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If less than 300px space below, open upwards
      setDropdownPosition(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/categories', {
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      setCategories(prev => [...prev, response.data]);
      setNewCategoryName('');
      setNewCategoryColor('#f97316');
      setShowAddForm(false);
      
      // Auto-select the newly created category
      onChange(response.data.id);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await apiClient.delete(`/api/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // If deleted category was selected, clear selection
      if (value === categoryId) {
        onChange('');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Dropdown Button */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            calculateDropdownPosition();
          }
          setIsOpen(!isOpen);
        }}
        className="w-full px-4 py-3 pr-12 border border-border bg-bg-primary text-left rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors appearance-none"
      >
        <div className="flex items-center gap-2">
          {selectedCategory && (
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className={selectedCategory ? 'text-text-primary' : 'text-text-secondary'}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full bg-bg-primary border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto ${
          dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {/* Add Category Form */}
          {showAddForm && (
            <div className="p-3 border-b border-border">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Color:</span>
                  <div className="flex gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newCategoryColor === color ? 'border-text-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={!newCategoryName.trim() || isLoading}
                    className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs py-2 rounded-md transition-colors"
                  >
                    {isLoading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#f97316');
                    }}
                    className="flex-1 bg-bg-secondary hover:bg-border text-text-primary text-xs py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category List */}
          <div className="max-h-48 overflow-y-auto">
            {/* Clear Selection Option */}
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-bg-secondary transition-colors text-text-secondary"
            >
              <span className="text-sm">No category</span>
            </button>

            {/* Categories */}
            {categories.map(category => (
              <div key={category.id} className="flex items-center hover:bg-bg-secondary">
                <button
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-2 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-text-primary">{category.name}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add Category Button */}
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full px-3 py-2 text-left hover:bg-bg-secondary transition-colors text-accent"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add new category</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}