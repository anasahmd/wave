import { Router } from 'express';
import authController from '../controllers/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema } from '../validations/auth.js';
import { authenticate } from '../middleware/auth.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authenticate, authController.me);
authRouter.put('/password', authController.changePassword);

export default authRouter;
