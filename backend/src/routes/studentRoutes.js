import express from 'express';
import { getStudents, getStudentById, getStudentHistory } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.get('/:id/history', getStudentHistory);

export default router;
