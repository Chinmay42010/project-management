import { Project } from "../models/project.models.js";
import { task } from "../models/task.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async (req, res) => {
    //test
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await task
        .find({
            project: new mongoose.Types.ObjectId(projectId),
        })
        .populate("assignedTo", "avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
    //test
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    });

    const newTask = await task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newTask, "Task created successfully"));
});

const getTasksById = asyncHandler(async (req, res) => {
    //test
    const { taskId } = req.params;
    const result = await task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0],
                },
            },
        },
    ]);

    if(!result || result.length === 0) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result[0],
                "Tasks fetched successfully"
            )
        )
});

const updateTask = asyncHandler(async (req, res) => {
    //test
});

const deleteTask = asyncHandler(async (req, res) => {
    //test
});

const createSubTask = asyncHandler(async (req, res) => {
    //test
});

const updateSubTask = asyncHandler(async (req, res) => {
    //test
});

const deleteSubTask = asyncHandler(async (req, res) => {
    //test
});

export {
    getTasks,
    getTasksById,
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    updateSubTask,
    updateTask,
};
