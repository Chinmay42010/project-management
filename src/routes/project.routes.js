import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import {
    createProject,
    getProject,
    updateProject,
    getProjectMembers,
    getProjectById,
    addMemberesToProject,
    updateMemberRole,
    deleteMember,
    deleteProject,
} from "../controllers/project.controllers.js";
import {
    createProjectValidator,
    addMemberToProjectValidator,
} from "../validators/index.js";

import {
    verifyJWT,
    validateProjectpermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getProject)
    .post(createProjectValidator(), validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectpermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectpermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject,
    )
    .delete(validateProjectpermission([UserRolesEnum.ADMIN]), deleteProject);

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectpermission([UserRolesEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMemberesToProject,
    );

router
    .route("/:projectId/members/:userId")
    .put(validateProjectpermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectpermission([UserRolesEnum.ADMIN]), deleteMember);

export default router;
