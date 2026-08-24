import { Router } from 'express';
import patternController from '../controllers/patternController.js';
import validate from '../middleware/validate.js';
import { savePatternSchema, updatePatternSchema } from '../validations/pattern.js';

const patternRouter = Router();

patternRouter.post(
	'/',
	validate(savePatternSchema),
	patternController.addPattern,
);
patternRouter.get('/:connectionId', patternController.getPatterns);
patternRouter.patch(
	'/:id',
	validate(updatePatternSchema),
	patternController.updatePattern,
);
patternRouter.delete('/:id', patternController.deletePattern);

export default patternRouter;
