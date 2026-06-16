// import { body, validationResult } from "express-validator";

// export const registerValidator = [
//   body("username")
//     .trim()
//     .notEmpty()
//     .withMessage("Username is required")
//     .isLength({ min: 3 })
//     .withMessage("Username must be at least 3 characters long"),
  
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Email must be valid"),
  
//   body("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters long"),
  
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   }
// ];


import { body, validationResult } from "express-validator";

// 1. THE REUSABLE ERROR CHECKER
// We write this once, and attach it to the end of every validator array
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 2. YOUR REGISTER FORMAT (Cleaned up)
export const registerValidator = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 6 }).withMessage("Username must be at least 6 characters long"),
  
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be valid"),
  
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  
  handleValidationErrors // <-- Reusing the function!
];


export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be valid"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  handleValidationErrors
];

export const resendVerificationValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be valid"),

  handleValidationErrors
];