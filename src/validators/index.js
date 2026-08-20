import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is retuired")
            .isEmail
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({min: 3})
            .withMessage("Username must be atleast 3 charecters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password can't be empty"),
        body("fullName")
            .trim()
            .optional()
    ]
}

export {
    userRegisterValidator
}
