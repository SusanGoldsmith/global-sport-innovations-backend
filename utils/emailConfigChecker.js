import nodemailer from "nodemailer"

export const checkEmailConfig = async () => {
  const requiredEnvVars = [
    "EMAIL_USER",
    "EMAIL_PASS",
    "RECIPIENT_EMAIL",
    "MONGO_URI",
  ]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    )
  }

  // Test email configuration for Hostinger
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: process.env.NODE_ENV !== "production",
  })

  try {
    await transporter.verify()
    console.log("Email configuration verified successfully")
    return true
  } catch (error) {
    console.error("Email configuration error:", error)
    throw new Error(`Email configuration failed: ${error.message}`)
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Detailed error:", err)

  // Handle specific known errors
  if (err.code === "EAUTH") {
    return res.status(500).json({
      success: false,
      message: "Email authentication failed. Please check email credentials.",
      error: err.message,
    })
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({
      success: false,
      message:
        "Could not connect to email server. Please check email configuration.",
      error: err.message,
    })
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "An error occurred while processing your request",
    error: err.message,
  })
}
