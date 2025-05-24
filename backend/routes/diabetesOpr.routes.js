import express from 'express';
import {getDiabetesDetails, updateDiabetesDetails} from '../controllers/diabetes.controller.js';
import { protectRoute } from '../middleware/protectedRoute.js';

const router = express.Router();

router.get('/getDiabetesDetails/:userId', protectRoute, getDiabetesDetails);
router.put('/updateDiabetesDetails', protectRoute, updateDiabetesDetails);

export default router;