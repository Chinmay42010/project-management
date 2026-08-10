import express from "express";
import cors from "cors";


const app = express();

// basic congigurations
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

// cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN ||  "https://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders:["Content-Type", "Authorization"],
    })
)

// import thr routes

import healthCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter)

app.get("/", (req, res) => {
    res.send(`Welcome to postman`);
})

export default app;