import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const todos = await prisma.todo.findMany({
      where: { 
        userId,
        completed: false
      },
      include: {
        category: true,
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, notes, difficulty, dueDate, categoryId, checklistItems } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        notes,
        difficulty: difficulty || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
        userId,
        checklistItems: checklistItems?.length ? {
          create: checklistItems.map((item: any, index: number) => ({
            text: item.text,
            orderIndex: index
          }))
        } : undefined
      },
      include: {
        category: true,
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, notes, difficulty, dueDate, categoryId, completed } = req.body;

    const todo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        notes,
        difficulty,
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
        completed,
        completedAt: completed ? new Date() : null
      },
      include: {
        category: true,
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const todo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    await prisma.todo.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

export const toggleTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const todo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : null
      },
      include: {
        category: true,
        checklistItems: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
};