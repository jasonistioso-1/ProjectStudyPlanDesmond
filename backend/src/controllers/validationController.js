import { validateStudyPlan } from '../services/validationEngine.js';

export async function validatePlanEndpoint(req, res) {
    try {
        const { studentId, locationId, planUnits } = req.body;

        if (!planUnits || !Array.isArray(planUnits)) {
            return res.status(400).json({ error: 'planUnits must be an array of units' });
        }

        const result = await validateStudyPlan({ studentId, locationId, planUnits });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
