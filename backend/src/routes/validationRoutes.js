import express from 'express';
import { validatePlanEndpoint } from '../controllers/validationController.js';

const router = express.Router();

router.post('/validate', validatePlanEndpoint);

export default router;
