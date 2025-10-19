import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { todoId } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    // Verify todo belongs to user
    const todo = await prisma.todo.findFirst({
      where: { id: todoId, userId }
    });

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    // Get the next order index
    const lastItem = await prisma.todoChecklistItem.findFirst({
      where: { todoId },
      orderBy: { orderIndex: 'desc' }
    });

    const orderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

    const checklistItem = await prisma.todoChecklistItem.create({
      data: {
        text,
        todoId,
        orderIndex
      }
    });

    res.status(201).json(checklistItem);
  } catch (error) {
    console.error('Error adding checklist item:', error);
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
};

export const updateChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { text, completed } = req.body;

    // Verify checklist item belongs to user's todo
    const checklistItem = await prisma.todoChecklistItem.findFirst({
      where: { 
        id,
        todo: { userId }
      }
    });

    if (!checklistItem) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    const updatedItem = await prisma.todoChecklistItem.update({
      where: { id },
      data: { text, completed }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
};

export const deleteChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Verify checklist item belongs to user's todo
    const checklistItem = await prisma.todoChecklistItem.findFirst({
      where: { 
        id,
        todo: { userId }
      }
    });

    if (!checklistItem) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    await prisma.todoChecklistItem.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
};

export const toggleChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Verify checklist item belongs to user's todo
    const checklistItem = await prisma.todoChecklistItem.findFirst({
      where: { 
        id,
        todo: { userId }
      }
    });

    if (!checklistItem) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    const updatedItem = await prisma.todoChecklistItem.update({
      where: { id },
      data: { completed: !checklistItem.completed }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    res.status(500).json({ error: 'Failed to toggle checklist item' });
  }
};