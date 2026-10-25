import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;
