import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, _ ,next)=> {
    try {
        // Normalize token coming from cookie or Authorization header (Bearer token)
        const authHeader = req.header("Authorization") || req.header("authorization");
        const token = req.cookies?.accessToken || authHeader?.replace(/^Bearer\s+/i, "").trim();

        if(!token){
            throw new ApiError(401, "Unauthorized request") 
        }

        if(!process.env.ACCESS_TOKEN_SECRET){
            throw new ApiError(500, "Missing ACCESS_TOKEN_SECRET environment variable")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})