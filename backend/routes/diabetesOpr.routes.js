import express from 'express';
import {getDiabetesDetails, updateDiabetesDetails,addGlucoseReading, analyticsChart} from '../controllers/diabetes.controller.js';
import { protectRoute } from '../middleware/protectedRoute.js';

const router = express.Router();

router.get('/getDiabetesDetails', protectRoute, getDiabetesDetails);
router.put('/updateDiabetesDetails', protectRoute, updateDiabetesDetails);
router.post('/addGlucoseReading', protectRoute, addGlucoseReading);
router.get('/analyticsChart', protectRoute, analyticsChart);

export default router;