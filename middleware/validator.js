import { validationResult, body } from "express-validator"

const validateContactForm = [
  body("name").trim().isLength({ min: 2, max: 50 }).escape(),
  body("email").trim().isEmail().normalizeEmail(),
  body("message").trim().isLength({ max: 1000 }).escape(),
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

export { validateContactForm, validate }
