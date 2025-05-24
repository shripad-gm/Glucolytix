import express from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectedRoute.js';

const router = express.Router();

router.get('/user', protectRoute, getUser);
router.put('/user', protectRoute, updateUser);
router.delete('/user', protectRoute, deleteUser);

export default router;