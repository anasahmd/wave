import { Router } from 'express';
import authController from '../controllers/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/guest', authController.guestLogin);

export default authRouter;
