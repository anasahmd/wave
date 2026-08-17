import { Router } from 'express';
import authController from '../controllers/auth.js';
import validate from '../middleware/validate.js';
import {
	registerSchema,
	changePasswordSchema,
	updateProfileSchema,
	loginSchema,
} from '../validations/auth.js';
import { authenticate } from '../middleware/auth.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/account', authenticate, authController.me);
authRouter.put(
	'/password',
	authenticate,
	validate(changePasswordSchema),
	authController.changePassword,
);
authRouter.patch(
	'/account',
	authenticate,
	validate(updateProfileSchema),
	authController.updateProfile,
);
authRouter.post('/guest', authController.guestLogin);
authRouter.delete('/account', authenticate, authController.deleteAccount);

export default authRouter;
