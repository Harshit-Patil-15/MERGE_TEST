import { Request, Response } from 'express';
import { Task } from '../models/task.model.js';
import { ApiError } from '../middleware/error.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

interface TaskQuery {
  user: string;
  status?: any;
  priority?: any;
}

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, status, priority } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    user: req.user.id, // Set user from auth session
  });

  return ApiResponse.success(res, 'Task created successfully', task, 211);
});

/**
 * @desc    Get all tasks for the logged-in user
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  // Option to filter by status or priority if provided via query
  const queryObj: TaskQuery = { user: req.user.id };
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.priority) queryObj.priority = req.query.priority;

  const tasks = await Task.find(queryObj).sort({ createdAt: -1 });

  return ApiResponse.success(res, 'Tasks retrieved successfully', tasks);
});

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  // Ensure user owns the task
  if (task.user.toString() !== req.user.id) {
    throw new ApiError('Not Authorized: Access denied to this resource', 403);
  }

  return ApiResponse.success(res, 'Task retrieved successfully', task);
});

/**
 * @desc    Update a task (partially or fully)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  // Ensure user owns the task
  if (task.user.toString() !== req.user.id) {
    throw new ApiError('Not Authorized: Access denied to this resource', 403);
  }

  // Update properties
  const fieldsToUpdate = ['title', 'description', 'status', 'priority'] as const;
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      (task as any)[field] = req.body[field];
    }
  });

  const updatedTask = await task.save();

  return ApiResponse.success(res, 'Task updated successfully', updatedTask);
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  // Ensure user owns the task
  if (task.user.toString() !== req.user.id) {
    throw new ApiError('Not Authorized: Access denied to this resource', 403);
  }

  // Remove matching document
  await task.deleteOne();

  return ApiResponse.success(res, 'Task deleted successfully', {});
});
