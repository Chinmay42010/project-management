import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";

const getProject = asyncHandler(async (req, res) => {
    //test
});

const getProjectById = asyncHandler(async (req, res) => {
    //test
});

const createProject = asyncHandler(async (req, res) => {
    //test
});

const updateProject = asyncHandler(async (req, res) => {
    //test
});

const deleteProject = asyncHandler(async (req, res) => {
    //test
});

const addMemberesToProject = asyncHandler(async (req, res) => {
    //test
});

const getProjectMembers = asyncHandler(async (req, res) => {
    //test
});

const updateMemberRole = asyncHandler(async (req, res) => {
    //test
});
const deleteMember = asyncHandler(async (req, res) => {
    //test
});

export {
    createProject,
    getProject,
    updateProject,
    getProjectMembers,
    getProjectById,
    addMemberesToProject,
    updateMemberRole,
    deleteMember,
    deleteProject,
};
