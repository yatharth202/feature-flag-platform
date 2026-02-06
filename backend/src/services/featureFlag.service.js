import { FeatureFlag } from "../models/featureFlag.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserRolloutBucket } from "../utils/hash.util.js";


export const evaluateFeatureFlag = async({key,environment,userId}) => {
    
    const flag = await FeatureFlag.findOne({key});

    if(!flag){
        throw new ApiError(404,"Feature flag not found");
    }

    if(flag.environment!==environment){
        return{
            enabled: false,
            value: flag.defaultValue,
            reason: "ENV_MISMATCH"
        };
    }

    if(!flag.enabled){
        return{
            enabled: false,
            value: flag.defaultValue,
            reason: "FLAG_DISABLE"
        }
    }

    if(flag.rolloutPercentage<100){
        const bucket = getUserRolloutBucket(userId,flag.key);

        if(bucket>=flag.rolloutPercentage){
            return{
                enabled: false,
                value: flag.defaultValue,
                reason: "ROLLOUT_MISS"
            }
        }
    }

    return{
        enabled: true,
        value: flag.value,
        reason: "ROLLOUT_MATCH"
    }
}