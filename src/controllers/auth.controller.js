import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_error.js";
import { emailVerificationMailGenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefresh = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError{
            500,
            "Something went wrong while generating the token"
        }
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or name already exists", [])
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    })

    const  { unHashedToken, hashedToken, tokenExpiry } =  user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    const sendEmail = await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken -emailVerificationtoken -emailVerificationExpiry",
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res
        .status(201)
        .josn(
            new ApiResponse(
                200,
                {user: createdUser},
                "User registered Successfully & verification email has been sent",
            )
        )
}) 

export { registerUser };

