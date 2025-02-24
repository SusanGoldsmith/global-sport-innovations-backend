import express from "express"
import * as formController from "../controllers/formController.js"
import { formSubmissionLimiter } from "../middleware/rateLimiter.js"
import { validateContactForm, validate } from "../middleware/validator.js"

const router = express.Router()

router.post(
  "/contact",
  formSubmissionLimiter,
  validateContactForm,
  validate,
  formController.submitContactForm
)

export default router
