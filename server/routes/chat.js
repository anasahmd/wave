import { Router } from 'express';
import validate from '../middleware/validate.js';
import { chatSchema, updateThreadTitleSchema } from '../validations/chat.js';
import chatController from '../controllers/chat.js';

const chatRouter = Router();

chatRouter.post('/', validate(chatSchema), chatController.chat);
chatRouter.get('/threads/:connectionId', chatController.getThreads);
chatRouter.get('/messages/:threadId', chatController.getMessages);
chatRouter.delete('/threads/:threadId', chatController.deleteThread);
chatRouter.patch('/threads/:threadId/pin', chatController.togglePin);
chatRouter.patch('/threads/:threadId/title', validate(updateThreadTitleSchema), chatController.updateThreadTitle);

export default chatRouter;
