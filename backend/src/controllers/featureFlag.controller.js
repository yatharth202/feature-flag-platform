import { FeatureFlag } from "../models/featureFlag.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createFeatureFlag = asyncHandler(async(req,res) => {
    const {
        name,
        description,
        enabled,
        rolloutPercentage,
        environment
    } = req.body

    if(!name){
        throw new ApiError(400,"Feature name is required");
    }

    const existingFlag = await FeatureFlag.findOne({name});

    if(existingFlag){
        throw new ApiError(409,"Feature flag already exists");
    }

    const flag = await FeatureFlag.create({
        name,
        description,
        enabled,
        rolloutPercentage,
        environment
    });

    return res
    .status(201)
    .json(new ApiResponse(201,flag,"Feature flag created"));

})

export const getAllFeatureFlags = asyncHandler(async(req,res) => {
    const flags = await FeatureFlag.find().sort({created: -1});

    return res.
    status(200)
    .json(new ApiResponse(200,flags,"Feature flags fetched"));
})
