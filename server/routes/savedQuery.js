import { Router } from 'express';
import savedQueryController from '../controllers/savedQuery.js';
import validate from '../middleware/validate.js';
import { saveSavedQuerySchema, updateSavedQuerySchema } from '../validations/savedQuery.js';

const savedQueryRouter = Router();

savedQueryRouter.post(
	'/',
	validate(saveSavedQuerySchema),
	savedQueryController.addSavedQuery,
);
savedQueryRouter.get('/:connectionId', savedQueryController.getSavedQueries);
savedQueryRouter.patch(
	'/:id',
	validate(updateSavedQuerySchema),
	savedQueryController.updateSavedQuery,
);
savedQueryRouter.delete('/:id', savedQueryController.deleteSavedQuery);

export default savedQueryRouter;
