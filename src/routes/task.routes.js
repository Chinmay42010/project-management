import { Router } from "express";
import {
    getTasks,
    getTasksById,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controllers/task.controller.js";
import {
    createTaskValidator,
    updateTaskValidator,
    createSubTaskValidator,
    updateSubTaskValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    validateProjectpermission,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

const adminAndProjectAdmin = [
    UserRolesEnum.ADMIN,
    UserRolesEnum.PROJECT_ADMIN,
];

// Project Tasks
router
    .route("/:projectId")
    .get(validateProjectpermission(AvailableUserRole), getTasks)
    .post(
        validateProjectpermission(adminAndProjectAdmin),
        upload.array("attachments"),
        createTaskValidator(),
        validate,
        createTask,
    );

// Individual Task routes
router
    .route("/:projectId/t/:taskId")
    .get(validateProjectpermission(AvailableUserRole), getTasksById)
    .put(
        validateProjectpermission(adminAndProjectAdmin),
        upload.array("attachments"),
        updateTaskValidator(),
        validate,
        updateTask,
    )
    .delete(validateProjectpermission(adminAndProjectAdmin), deleteTask);

// Subtask creation
router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        validateProjectpermission(adminAndProjectAdmin),
        createSubTaskValidator(),
        validate,
        createSubTask,
    );

// Subtask update & delete
router
    .route("/:projectId/st/:subTaskId")
    .put(
        validateProjectpermission(AvailableUserRole),
        updateSubTaskValidator(),
        validate,
        updateSubTask,
    )
    .delete(validateProjectpermission(adminAndProjectAdmin), deleteSubTask);

export default router;
