import { Router } from 'express';
import validate from '../middleware/validate.js';
import { connectDbSchema } from '../middleware/schemas.js';
import connectionController from '../controllers/connection.js';

const connectionRouter = Router();

connectionRouter.post(
	'/connect',
	validate(connectDbSchema),
	connectionController.connect,
);
connectionRouter.get('/', connectionController.list);
connectionRouter.post('/:id/activate', connectionRouter.activate);
connectionRouter.post('/:id/disconnect', connectionController.disconnect);
connectionRouter.delete('/:id', connectionController.remove);

export default connectionRouter;
