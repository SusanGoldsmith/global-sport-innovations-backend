import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import expressXssSanitizer from "express-xss-sanitizer"
import mongoSanitize from "express-mongo-sanitize"
import compression from "compression"
import connectDB from "./config/db.js"
import formRoutes from "./routes/formRoutes.js"
import { errorHandler, checkEmailConfig } from "./utils/emailConfigChecker.js"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Connect to MongoDB
connectDB()

// Verify email configuration on startup
checkEmailConfig().catch((err) => {
  console.error("Email configuration error:", err.message)
  console.log(
    "Application will continue to run, but email functionality may not work."
  )
})

// Set up allowed origins for CORS
const allowedOrigins = [
  "https://globalsportinnovations.com",
  "http://localhost:3000",
  "http://localhost:5173", // Vite's default port
  process.env.FRONTEND_URL, // Your environment variable if set
].filter(Boolean) // Remove any undefined entries

console.log("CORS allowed origins:", allowedOrigins)

// CORS Configuration with multiple origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        console.log("CORS blocked origin:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Middleware
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
)
app.use(morgan("dev"))

// Apply mongoSanitize first with dontSanitize option
app.use(
  mongoSanitize({
    dontSanitize: ["params", "query"], // This prevents modification of req.query
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`Request sanitized for key: ${key}`)
    },
  })
)

// Then apply XSS sanitizer
app.use(expressXssSanitizer.xss())

app.use(compression())

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to API",
  })
})

// Routes
app.use("/api/forms", formRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err)

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    })
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate key error",
      field: Object.keys(err.keyPattern)[0],
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  )
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...")
  console.error(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...")
  console.error(err.name, err.message)
  process.exit(1)
})

export default app
