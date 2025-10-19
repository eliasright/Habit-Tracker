import React, { useState } from 'react';
import apiClient from '../config/apiClient';
import CategoryManager from './CategoryManager';

interface ChecklistItem {
  text: string;
  completed: boolean;
}

interface Todo {
  id: string;
  title: string;
  notes?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  dueDate?: string;
  completed: boolean;
  categoryId?: string;
  checklistItems: Array<{
    id: string;
    text: string;
    completed: boolean;
    orderIndex: number;
  }>;
}

interface TodoCreateFormProps {
  onClose: () => void;
  onTodoCreated: () => void;
  editingTodo?: Todo;
}

export default function TodoCreateForm({ onClose, onTodoCreated, editingTodo }: TodoCreateFormProps) {
  const [formData, setFormData] = useState({
    title: editingTodo?.title || '',
    notes: editingTodo?.notes || '',
    difficulty: (editingTodo?.difficulty || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
    dueDate: editingTodo?.dueDate || '',
    categoryId: editingTodo?.categoryId || ''
  });
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    editingTodo?.checklistItems?.map(item => ({ text: item.text, completed: item.completed })) || []
  );
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingTodo) {
        // Update existing todo
        await apiClient.put(`/api/todos/${editingTodo.id}`, {
          ...formData,
          checklistItems: checklistItems.map(item => ({ text: item.text }))
        });
      } else {
        // Create new todo
        await apiClient.post('/api/todos', {
          ...formData,
          checklistItems: checklistItems.map(item => ({ text: item.text }))
        });
      }

      onTodoCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTodo) return;
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/todos/${editingTodo.id}`);
      onTodoCreated(); // Refresh the list
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete todo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [...prev, { text: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {editingTodo ? 'Edit Todo' : 'Create New Todo'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional details..."
                rows={3}
                className="w-full px-4 py-3 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Checklist Items */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Checklist Items
              </label>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-bg-secondary border border-border p-2 rounded-lg">
                    <div className="w-4 h-4 border border-border rounded"></div>
                    <span className="flex-1 text-sm text-text-primary">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item..."
                    className="flex-1 px-3 py-2 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Difficulty and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-text-primary mb-2">
                  Difficulty
                </label>
                <div className="relative">
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors appearance-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-text-primary mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category
              </label>
              <CategoryManager
                value={formData.categoryId}
                onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
                placeholder="Select a category"
                type="todos"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-secondary transition-colors font-medium"
              >
                Cancel
              </button>
              {editingTodo && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  editingTodo ? 'Update Todo' : 'Create Todo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}