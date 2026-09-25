const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Task = require("./models/Task");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("TaskFlow API is running");
});


app.post("/api/tasks", async (req, res) => {
    try {
        const task = await Task.create(req.body);

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create task",
            error: error.message
        });
    }
});
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await Task.find();

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});
app.get("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
});
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update task",
            error: error.message
        });
    }
});
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
});
app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { completed: true },
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });