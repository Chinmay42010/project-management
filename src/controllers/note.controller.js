import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";
import mongoose from "mongoose";

const getNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const notes = await ProjectNote.find({
        project: new mongoose.Types.ObjectId(projectId),
    })
        .populate("createdBy", "avatar username fullName")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const note = await ProjectNote.create({
        project: new mongoose.Types.ObjectId(projectId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        content,
    });

    const populatedNote = await ProjectNote.findById(note._id).populate(
        "createdBy",
        "avatar username fullName",
    );

    return res
        .status(201)
        .json(new ApiResponse(201, populatedNote, "Note created successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(noteId)
    ) {
        throw new ApiError(400, "Invalid Project or Note ID");
    }

    const note = await ProjectNote.findOne({
        _id: new mongoose.Types.ObjectId(noteId),
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("createdBy", "avatar username fullName");

    if (!note) {
        throw new ApiError(404, "Note not found in this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const { content } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(noteId)
    ) {
        throw new ApiError(400, "Invalid Project or Note ID");
    }

    const note = await ProjectNote.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(noteId),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            content,
        },
        { new: true },
    ).populate("createdBy", "avatar username fullName");

    if (!note) {
        throw new ApiError(404, "Note not found in this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(noteId)
    ) {
        throw new ApiError(400, "Invalid Project or Note ID");
    }

    const note = await ProjectNote.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(noteId),
        project: new mongoose.Types.ObjectId(projectId),
    });

    if (!note) {
        throw new ApiError(404, "Note not found in this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

export {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
};
