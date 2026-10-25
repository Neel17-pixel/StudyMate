import express from 'express';
import { getNotes, createNote, updateNote, deleteNote, summarizeNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.post('/:id/summarize', summarizeNote);
router.delete('/:id', deleteNote);

export default router;
