import express from 'express';
import { getCourses, getUnits, getTeachingPeriods, getLocations } from '../controllers/courseController.js';

const router = express.Router();

router.get('/courses', getCourses);
router.get('/units', getUnits);
router.get('/periods', getTeachingPeriods);
router.get('/locations', getLocations);

export default router;
