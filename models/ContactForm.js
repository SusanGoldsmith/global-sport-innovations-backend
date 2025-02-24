import mongoose from "mongoose"
import validator from "validator"

const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
})

const ContactForm = mongoose.model("ContactForm", contactFormSchema)

export { ContactForm }
