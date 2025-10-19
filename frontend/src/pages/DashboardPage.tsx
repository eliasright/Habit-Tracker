import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import OnboardingFlow from '../components/OnboardingFlow';
import TodoCreateForm from '../components/TodoCreateForm';
import apiClient from '../config/apiClient';
import moment from 'moment-timezone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category, ChecklistItem, Todo, Habit, Daily } from '../types/todo.types';

// Presentational Todo Component for drag overlay
function TodoItemPresentation({ todo, onToggle, onViewDetails, onToggleChecklistItem, isDragging = false, dragAttributes, dragListeners }: {
  todo: Todo;
  onToggle: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
  onToggleChecklistItem: (todoId: string, itemId: string) => void;
  isDragging?: boolean;
  dragAttributes?: any;
  dragListeners?: any;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={`bg-card-bg border border-border rounded-lg p-4 transition-all duration-300 ${
      todo.completed ? 'opacity-60' : ''
    } ${isDragging ? 'shadow-lg rotate-3' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
          className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-accent border-accent text-white'
              : 'border-border hover:border-accent'
          }`}
        >
          {todo.completed && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onViewDetails(todo)}
        >
          <div>
            <h4 className={`font-medium text-sm ${todo.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
              {todo.title}
            </h4>
            {todo.notes && (
              <p className={`text-xs mt-1 ${todo.completed ? 'text-text-secondary' : 'text-text-secondary'}`}>
                {todo.notes}
              </p>
            )}
          </div>

          {todo.checklistItems.length > 0 && (
            <div className="mt-2 space-y-1">
              {todo.checklistItems.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleChecklistItem(todo.id, item.id);
                    }}
                    className={`w-2.5 h-2.5 rounded border transition-colors ${
                      item.completed ? 'bg-accent border-accent' : 'border-border hover:border-accent'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <span className={`truncate ${item.completed ? 'line-through text-text-secondary' : 'text-text-secondary'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
              {todo.checklistItems.length > 2 && (
                <div className="text-xs text-text-secondary">+{todo.checklistItems.length - 2} more</div>
              )}
            </div>
          )}
        </div>

        {/* Drag Handle */}
        {dragAttributes && dragListeners && (
          <div 
            className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary transition-colors p-1"
            {...dragAttributes}
            {...dragListeners}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Todo Component
function SortableTodoItem({ todo, onToggle, onViewDetails, onToggleChecklistItem }: {
  todo: Todo;
  onToggle: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
  onToggleChecklistItem: (todoId: string, itemId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <TodoItemPresentation
        todo={todo}
        onToggle={onToggle}
        onViewDetails={onViewDetails}
        onToggleChecklistItem={onToggleChecklistItem}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function DashboardPage() {
  const { isAuthenticated, user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check onboarding status when component loads and user is available
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      if (user?.timezone) {
        const time = moment.tz(user.timezone);
        setCurrentTime(time.format('MMM D, YYYY - h:mm A'));
      }
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.timezone]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await apiClient.get('/api/onboarding/status');
      if (!response.data.onboarded) {
        setShowOnboarding(true);
      }
      await fetchTodos();
      setLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await apiClient.get('/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const toggleTodo = async (todoId: string) => {
    try {
      const response = await apiClient.patch(`/api/todos/${todoId}/toggle`, {});
      const updatedTodo = response.data;
      
      // If todo was just completed, play sound and remove immediately
      if (updatedTodo.completed) {
        // Play completion sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYgCjaFzvLZiTYIG2m98OWoTwwPVank7rdhGgU+ltDu2YU4BXau8viMOhFdj8c=');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
        
        // Remove todo immediately
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      } else {
        // Just update normally for uncomplete
        setTodos(prev => prev.map(todo => 
          todo.id === todoId ? updatedTodo : todo
        ));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await apiClient.delete(`/api/todos/${todoId}`);
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const toggleChecklistItem = async (todoId: string, itemId: string) => {
    try {
      const response = await apiClient.patch(`/api/checklist/${itemId}/toggle`, {});
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? {
          ...todo,
          checklistItems: todo.checklistItems.map(item =>
            item.id === itemId ? response.data : item
          )
        } : todo
      ));
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find(t => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (active.id !== over?.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchUser();
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-text-secondary mt-1">
              {user?.motivationQuote || "Let's build some great habits today!"}
            </p>
          </div>
          
          {currentTime && (
            <div className="text-right">
              <p className="text-lg font-semibold text-accent">
                {currentTime}
              </p>
            </div>
          )}
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Todos Column */}
          <div className="bg-card-bg border border-border rounded-xl p-6 h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Todos
              </h2>
              <button
                onClick={() => setShowTodoForm(true)}
                className="bg-accent hover:bg-accent-hover text-white p-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {todos.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-text-secondary text-sm mb-4">No todos yet</p>
                <button
                  onClick={() => setShowTodoForm(true)}
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Add Todo
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 max-h-[700px] overflow-y-auto">
                    {todos.map(todo => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onViewDetails={setSelectedTodo}
                        onToggleChecklistItem={toggleChecklistItem}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeTodo ? (
                    <TodoItemPresentation
                      todo={activeTodo}
                      onToggle={() => {}}
                      onViewDetails={() => {}}
                      onToggleChecklistItem={() => {}}
                      isDragging={true}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Habits Column */}
          <div className="bg-card-bg border border-border rounded-xl p-6 h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Habits
              </h2>
              <button className="bg-accent hover:bg-accent-hover text-white p-2 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="text-center py-8">
              <svg className="w-12 h-12 text-text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-text-secondary text-sm mb-4">No habits yet</p>
              <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Add Habit
              </button>
            </div>
          </div>

          {/* Dailies Column */}
          <div className="bg-card-bg border border-border rounded-xl p-6 h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Daily Tasks
              </h2>
              <button className="bg-accent hover:bg-accent-hover text-white p-2 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="text-center py-8">
              <svg className="w-12 h-12 text-text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-text-secondary text-sm mb-4">No daily tasks yet</p>
              <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Add Daily Task
              </button>
            </div>
          </div>
        </div>

        {showTodoForm && (
          <TodoCreateForm
            onClose={() => setShowTodoForm(false)}
            onTodoCreated={fetchTodos}
          />
        )}

        {selectedTodo && (
          <TodoCreateForm
            editingTodo={selectedTodo}
            onClose={() => setSelectedTodo(null)}
            onTodoCreated={() => {
              fetchTodos();
              setSelectedTodo(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;