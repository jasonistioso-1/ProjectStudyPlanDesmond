import express from 'express';
import { getPlanByStudent, savePlan, recommendPlan, rejectPlan, agreePlan, approvePlan, recalculatePlan, getAuditLog } from '../controllers/planController.js';

const router = express.Router();

router.get('/audit-log', getAuditLog);
router.get('/student/:studentId', getPlanByStudent);
router.post('/', savePlan);
router.post('/:planId/recommend', recommendPlan);
router.post('/:planId/reject', rejectPlan);
router.post('/:planId/agree', agreePlan);
router.post('/:planId/approve', approvePlan);
router.post('/recalculate', recalculatePlan);

export default router;
