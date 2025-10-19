import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem
} from '../controllers/checklistController';

const router = express.Router();

router.use(authenticateToken);

router.post('/todos/:todoId/checklist', addChecklistItem);
router.put('/checklist/:id', updateChecklistItem);
router.patch('/checklist/:id/toggle', toggleChecklistItem);
router.delete('/checklist/:id', deleteChecklistItem);

export default router;