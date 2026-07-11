import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// Pre-defined validation configurations
const taskCreateValidation = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
];

const taskUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid task ID parameter'),
  ...taskCreateValidation.map(v => v.optional())
];

const checkIdParam = [
  param('id').isMongoId().withMessage('Invalid task ID parameter')
];

// Router connections
router
  .route('/')
  .get(getTasks)
  .post(validate(taskCreateValidation), createTask);

router
  .route('/:id')
  .get(validate(checkIdParam), getTaskById)
  .put(validate(taskUpdateValidation), updateTask)
  .delete(validate(checkIdParam), deleteTask);

export default router;
