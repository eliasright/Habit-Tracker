import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo
} from '../controllers/todosController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);
router.delete('/:id', deleteTodo);

export default router;