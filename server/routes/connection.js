import { Router } from 'express';
import validate from '../middleware/validate.js';
import { connectDbSchema } from '../validations/connection.js';
import connectionController from '../controllers/connection.js';

const connectionRouter = Router();

connectionRouter.post(
	'/connect',
	validate(connectDbSchema),
	connectionController.connect,
);
connectionRouter.get('/', connectionController.list);
connectionRouter.post('/:id/activate', connectionController.activate);
connectionRouter.post('/:id/disconnect', connectionController.disconnect);
connectionRouter.delete('/:id', connectionController.remove);

export default connectionRouter;
