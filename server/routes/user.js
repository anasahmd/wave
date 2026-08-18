import { Router } from 'express';
import authController from '../controllers/auth.js';
import validate from '../middleware/validate.js';
import {
	changePasswordSchema,
	updateProfileSchema,
} from '../validations/auth.js';

const userRouter = Router();

userRouter.get('/me', authController.me);
userRouter.patch(
	'/me',
	validate(updateProfileSchema),
	authController.updateProfile,
);
userRouter.put(
	'/me/password',
	validate(changePasswordSchema),
	authController.changePassword,
);
userRouter.delete('/me', authController.deleteAccount);

export default userRouter;
