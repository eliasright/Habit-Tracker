export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  orderIndex: number;
}

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  dueDate?: string;
  completed: boolean;
  category?: Category;
  checklistItems: ChecklistItem[];
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  completions: any[];
}

export interface Daily {
  id: string;
  title: string;
  completed: boolean;
}