import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";
import { UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId),
    })
        .populate("assignedTo", "avatar username fullName")
        .populate("assignedBy", "avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL || ""}/images/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    });

    const newTask = await Task.create({
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
    const { projectId, taskId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        throw new ApiError(400, "Invalid Project or Task ID");
    }

    const result = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
                project: new mongoose.Types.ObjectId(projectId),
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
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedBy",
                foreignField: "_id",
                as: "assignedBy",
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
                assignedBy: {
                    $arrayElemAt: ["$assignedBy", 0],
                },
            },
        },
    ]);

    if (!result || result.length === 0) {
        throw new ApiError(404, "Task not found in this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title, description, assignedTo, status } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        throw new ApiError(400, "Invalid Project or Task ID");
    }

    const existingTask = await Task.findOne({
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId),
    });

    if (!existingTask) {
        throw new ApiError(404, "Task not found in this project");
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (assignedTo !== undefined) {
        updateFields.assignedTo = assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : null;
    }

    const files = req.files || [];
    if (files.length > 0) {
        const newAttachments = files.map((file) => ({
            url: `${process.env.SERVER_URL || ""}/images/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        }));
        updateFields.$push = { attachments: { $each: newAttachments } };
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, {
        new: true,
    })
        .populate("assignedTo", "avatar username fullName")
        .populate("assignedBy", "avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        throw new ApiError(400, "Invalid Project or Task ID");
    }

    const existingTask = await Task.findOne({
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId),
    });

    if (!existingTask) {
        throw new ApiError(404, "Task not found in this project");
    }

    // Clean up local attachment files on disk
    if (existingTask.attachments && existingTask.attachments.length > 0) {
        existingTask.attachments.forEach((att) => {
            if (att.url) {
                const parts = att.url.split("/images/");
                const filename = parts[1];
                if (filename) {
                    const filePath = path.join(
                        process.cwd(),
                        "public",
                        "images",
                        filename,
                    );
                    if (fs.existsSync(filePath)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(
                                    "Failed to delete attachment:",
                                    filePath,
                                    err,
                                );
                            }
                        });
                    }
                }
            }
        });
    }

    // Cascade delete subtasks
    await Subtask.deleteMany({ task: existingTask._id });

    // Delete task
    await Task.findByIdAndDelete(existingTask._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        throw new ApiError(400, "Invalid Project or Task ID");
    }

    const existingTask = await Task.findOne({
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId),
    });

    if (!existingTask) {
        throw new ApiError(404, "Task not found in this project");
    }

    const newSubTask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        isCompleted: false,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newSubTask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;
    const { title, isCompleted } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(subTaskId)
    ) {
        throw new ApiError(400, "Invalid Project or Subtask ID");
    }

    // Role-based rule: members can only update completion status
    if (req.user.role === UserRolesEnum.MEMBER && title !== undefined) {
        throw new ApiError(
            403,
            "Members are only allowed to update completion status of a subtask",
        );
    }

    const subTask = await Subtask.findById(subTaskId).populate("task");

    if (!subTask || subTask.task?.project?.toString() !== projectId) {
        throw new ApiError(404, "Subtask not found in this project");
    }

    if (title !== undefined && req.user.role !== UserRolesEnum.MEMBER) {
        subTask.title = title;
    }

    if (isCompleted !== undefined) {
        subTask.isCompleted = Boolean(isCompleted);
    }

    await subTask.save();

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(subTaskId)
    ) {
        throw new ApiError(400, "Invalid Project or Subtask ID");
    }

    const subTask = await Subtask.findById(subTaskId).populate("task");

    if (!subTask || subTask.task?.project?.toString() !== projectId) {
        throw new ApiError(404, "Subtask not found in this project");
    }

    await Subtask.findByIdAndDelete(subTaskId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});

export {
    getTasks,
    getTasksById,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
};
