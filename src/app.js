import express from "express";
import cors from "cors";
import { ApiError } from "./utils/api_error.js";
import { ApiResponse } from "./utils/api_response.js";

const app = express();

// basic congigurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "https://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// import thr routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
    res.send(`Welcome to postman`);
});

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode, null, err.message),
        );
    }

    return res.status(500).json(
        new ApiResponse(500, null, err?.message || "Internal Server Error"),
    );
});

export default app;
