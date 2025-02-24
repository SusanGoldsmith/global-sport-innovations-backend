import nodemailer from "nodemailer"
import { ContactForm } from "../models/ContactForm.js"
import { contactFormTemplate } from "./emailTemplates.js"

// Create transporter configured for Hostinger
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: process.env.NODE_ENV !== "production",
    logger: process.env.NODE_ENV !== "production",
  })
}

export const submitContactForm = async (req, res) => {
  let savedForm = null

  try {
    const { name, email, message } = req.body
    const submittedAt = new Date()

    // First, save to database independently of email status
    const contactForm = new ContactForm({
      name,
      email,
      message,
      submittedAt,
    })

    savedForm = await contactForm.save()
    console.log("Form data saved to database successfully")

    // Then attempt to send emails
    const transporter = createTransporter()

    // Test connection first
    await transporter.verify()
    console.log("Transporter verified successfully")

    // Send admin notification
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: "🔔 New Contact Form Submission",
      html: contactFormTemplate({
        name,
        email,
        message,
        submittedAt,
      }),
    }

    await transporter.sendMail(mailOptions)
    console.log("Admin notification sent successfully")

    // Send user confirmation
    const userConfirmation = {
      from: `"Enlinque" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000048;">Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you shortly.</p>
          <p>Best regards,<br>Enlinque Team</p>
        </div>
      `,
    }

    await transporter.sendMail(userConfirmation)
    console.log("User confirmation sent successfully")

    res.status(200).json({
      success: true,
      message: "Message sent and stored successfully",
      formId: savedForm._id,
    })
  } catch (error) {
    console.error("Detailed error:", error)

    // If we successfully saved to database but email failed
    if (savedForm) {
      res.status(200).json({
        success: true,
        message:
          "Your message was stored successfully, but email notification failed. We will contact you soon.",
        formId: savedForm._id,
        emailError: true,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to process your request",
        error: error.message,
      })
    }
  }
}
