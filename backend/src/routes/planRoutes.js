import express from 'express';
import { getPlanByStudent, savePlan, recommendPlan, agreePlan, approvePlan, recalculatePlan } from '../controllers/planController.js';

const router = express.Router();

router.get('/student/:studentId', getPlanByStudent);
router.post('/', savePlan);
router.post('/:planId/recommend', recommendPlan);
router.post('/:planId/agree', agreePlan);
router.post('/:planId/approve', approvePlan);
router.post('/recalculate', recalculatePlan);

export default router;
