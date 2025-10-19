import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, timezone, motivationQuote } = req.body;

    if (!name || !timezone) {
      res.status(400).json({ error: 'Name and timezone are required' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        timezone,
        motivationQuote,
        onboarded: true
      }
    });

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Work', color: '#f97316' },
      { name: 'Personal', color: '#f97316' },
      { name: 'School', color: '#f97316' },
      { name: 'Health', color: '#f97316' },
      { name: 'Exercise', color: '#f97316' },
      { name: 'Learning', color: '#f97316' }
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId
      }))
    });

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        timezone: updatedUser.timezone,
        motivationQuote: updatedUser.motivationQuote,
        onboarded: updatedUser.onboarded
      }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

export const getOnboardingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        motivationQuote: true,
        onboarded: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
};