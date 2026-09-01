import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const getProject = asyncHandler(async (req, res) => {
    //test
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "projects",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "projects",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$project",
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);
});

const getProjectById = asyncHandler(async (req, res) => {
    //test
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
    //test
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.types.ObjectId(req.user._id),
    });

    await ProjectMember.create({
        user: new mongoose.types.ObjectId(req.user._id),
        project: new mongoose.types.ObjectId(project._id),
        role: UserRoleEnum.ADMIN,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, peoject, "Project Created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
    //test
    const { name, description } = req.body;
    const { projectId } = req.params;

    await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, "Project Not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project Updated Successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
    //test
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project Not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project Deleted Successfully"));
});

const addMemberesToProject = asyncHandler(async (req, res) => {
    //test
    const { email, role } = req.body;
    const { projectId } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exixst");
    }

    await ProjectMember.findByIdAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role,
        },
        {
            new: true,
            upsert: true,
        },
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Project member added successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    //test
    const { projectId } = req.params;
    const project = await Project.findById(req.params);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.types.ObjectId(projectId),
            },
        },

        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$user", 0],
                },
            },
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                createdAt: 1,
                createdBy: 1,
                updatedAt: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                projectMembers,
                "Project Members fetched successfully",
            ),
        );
});

const updateMemberRole = asyncHandler(async (req, res) => {
    //test
    const {projectId, userID} = req.params
    const { newRole } = req.body

    if(!AvailableUserRole.includes(newRole)) {
        throw new ApiError(400, "Invalid Role")
    }

    let projectMember = await projectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userID)
    })

    if (!projectMember) {
        throw new ApiError(400, "Project member not found");
    }

    projectMember = await projectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role: newRole
        },
        {new: true}
    )
    if (!projectMember) {
         throw new ApiError(400, "Project member not found");
    }

    return res
        .staus(200)
        .json(
            new ApiResponse(
                200,
                {projectMember},
                "Member updated successfully"
            )
        )
});
const deleteMember = asyncHandler(async (req, res) => {
    //test
    const { projectId, userID } = req.params;y;

    let projectMember = await projectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userID),
    });

    if (!projectMember) {
        throw new ApiError(400, "Project member not found");
    }

    projectMember = await projectMember.findByIdAndDelete(projectMember._id);

    if (!projectMember) {
        throw new ApiError(400, "Project member not found");
    }

    return res
        .staus(200)
        .json(
            new ApiResponse(
                200,
                { projectMember },
                "Member deleted successfully",
            ),
        );

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
