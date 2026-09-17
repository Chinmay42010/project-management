import { body } from "express-validator";
import { AvailableUserRole, AvailableTaskStatus } from "../utils/constants.js";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullName").optional().trim(),
    ];
};

const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage("Email is invalid"),
        body("password").notEmpty().withMessage("Password is required"),
    ];
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required"),
    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
    ];
};

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("New password is required"),
    ];
};

const createProjectValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("description").optional(),
    ];
};

const addMemberToProjectValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("role")
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRole)
            .withMessage("Role is invalid"),
    ];
};

const createTaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("description").optional(),
        body("status")
            .optional()
            .isIn(AvailableTaskStatus)
            .withMessage("Invalid task status"),
        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Invalid assignedTo user ID"),
    ];
};

const updateTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Title cannot be empty"),
        body("description").optional(),
        body("status")
            .optional()
            .isIn(AvailableTaskStatus)
            .withMessage("Invalid task status"),
        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Invalid assignedTo user ID"),
    ];
};

const createSubTaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("Title is required"),
    ];
};

const updateSubTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Title cannot be empty"),
        body("isCompleted")
            .optional()
            .isBoolean()
            .withMessage("isCompleted must be a boolean"),
    ];
};

const createNoteValidator = () => {
    return [
        body("content").trim().notEmpty().withMessage("Content is required"),
    ];
};

const updateNoteValidator = () => {
    return [
        body("content").trim().notEmpty().withMessage("Content is required"),
    ];
};

export {
    addMemberToProjectValidator,
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    createProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubTaskValidator,
    updateSubTaskValidator,
    createNoteValidator,
    updateNoteValidator,
};
