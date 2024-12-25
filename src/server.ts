import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protectedRoute";
import cookieParser from "cookie-parser";
import pool from "./config/database";

dotenv.config();

const app = express();
const cors = require("cors");

// Database connection test
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL database");
    client.release();
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.get("/health", async (req, res) => {
  const dbConnected = await testDatabaseConnection();
  res.json({
    status: "OK",
    database: dbConnected ? "Connected" : "Disconnected",
  });
});

const PORT = process.env.PORT || 3000;

// Start server only after testing database connection
const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error("Server not started due to database connection failure");
    process.exit(1);
  }
};

startServer();
