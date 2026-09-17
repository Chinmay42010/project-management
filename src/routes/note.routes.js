import { Router } from "express";
import {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";
import {
    createNoteValidator,
    updateNoteValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    validateProjectpermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

// All note routes require authentication
router.use(verifyJWT);

// Project Notes listing and creation
router
    .route("/:projectId")
    .get(validateProjectpermission(AvailableUserRole), getNotes)
    .post(
        validateProjectpermission([UserRolesEnum.ADMIN]),
        createNoteValidator(),
        validate,
        createNote,
    );

// Individual Note details, update, and deletion
router
    .route("/:projectId/n/:noteId")
    .get(validateProjectpermission(AvailableUserRole), getNoteById)
    .put(
        validateProjectpermission([UserRolesEnum.ADMIN]),
        updateNoteValidator(),
        validate,
        updateNote,
    )
    .delete(
        validateProjectpermission([UserRolesEnum.ADMIN]),
        deleteNote,
    );

export default router;
