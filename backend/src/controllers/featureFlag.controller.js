import { FeatureFlag } from "../models/featureFlag.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { evaluateFeatureFlag } from "../services/featureFlag.service.js";

export const createFeatureFlag = asyncHandler(async(req,res) => {
    const {
        name,
        key,
        description,
        enabled,
        rolloutPercentage,
        environment,
        value,
        defaultValue
    } = req.body

    if(!name){
        throw new ApiError(400,"Feature name is required");
    }
    if(!key){
        throw new ApiError(400, "Feature key is required");
    }
    
    if(rolloutPercentage !== undefined && (rolloutPercentage<0 || rolloutPercentage>100)){
        throw new ApiError(400,"rolloutPercentage must be between 0 and 100");
    }

    const existingFlag = await FeatureFlag.findOne({ key });

    if(existingFlag){
        throw new ApiError(409,"Feature flag already exists");
    }

    const flag = await FeatureFlag.create({
        name,
        key,
        description,
        enabled,
        rolloutPercentage,
        environment,
        value,
        defaultValue
    });

    return res
    .status(201)
    .json(new ApiResponse(201,flag,"Feature flag created"));

})

export const getAllFeatureFlags = asyncHandler(async(req,res) => {
    const flags = await FeatureFlag.find().sort({createdAt: -1});

    return res.
    status(200)
    .json(new ApiResponse(200,flags,"Feature flags fetched"));
})

export const evaluateFlag = asyncHandler(async(req,res)=> {
    const {key,env,userId} = req.query;

    if(!key){
        throw new ApiError(400, "Flag key is required");
    }

    const allowedEnvs = ["dev", "prod"];

    if(env && !allowedEnvs.includes(env)){
        throw new ApiError(400, "Invalid environment use 'dev' or 'prod'");
    }


    const result = await evaluateFeatureFlag({
        key,
        environment: env || "prod",
        userId: userId || "anonymous"
    });

    return res
    .status(200)
    .json(new ApiResponse(200,result,"flag evaluated"));
})
