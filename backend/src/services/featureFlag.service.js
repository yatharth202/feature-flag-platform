import { FeatureFlag } from "../models/featureFlag.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserRolloutBucket } from "../utils/hash.util.js";
import { AuditLog } from "../models/auditLog.model.js";
import { version } from "mongoose";


export const evaluateFeatureFlag = async({key,environment,userId,userAttributes ={}}) => {
    
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
            reason: "FLAG_DISABLED"

        }
    }

    const {targeting} = flag;

    if(targeting?.explicit){
        const {userIds = [],roles = []} = targeting.explicit;

        if(userIds.includes(userId)){
            return{
                enabled: true,
                value: flag.value,
                reason: "EXPLICIT_USER_ID"
            }
        }
        
        if(userAttributes.role && roles.includes(userAttributes.role)){
            return {
                enabled: true,
                value: flag.value,
                reason: "EXPLICIT_ROLE"

            }
        }
    };

      if (targeting?.rules?.length){
        for(const rule of targeting.rules){
            const userValue = userAttributes[rule.field];
        if(rule.operator === "equals" && userValue === rule.value){
            return{
                enabled: true,
                value: flag.value,
                reason: "RULE_MATCH"
            };
        }
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

export const getFeatureFlagVersions = async(flagId,{page=1,limit=10}) => {
    const flag = await FeatureFlag.findById(flagId)

    if(!flag){
        throw new ApiError(404,"Feature flag not found")
    }

    const skip = (page-1)*limit

    const auditLog = await AuditLog.find({flagId})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()

    return auditLog.map(log =>({
        versionId: log._id,
        action: log.action,
        changedBy: log.changedBy,
        createdAt: log.createdAt,
        snapshot: log.after
    }));
}

export const rollbackFeatureFlag = async(flagId,versionId,changedBy = "system") => {
    const flag = await FeatureFlag.findById(flagId)

    if(!flag){
        throw new ApiError(404,"Feature flag not found")
    }

    const versionLog = await AuditLog.findById(versionId)
    if(!versionLog){
        throw new ApiError(404,"Version not found")
    }

    if (versionLog.flagId.toString()!==flagId.toString()){
        throw new ApiError(400, "Version does not belong to this feature flag");
    }
    
    //current state
    const beforeState = flag.toObject();

    //change wali state
    const snapshot = versionLog.after;

    flag.name = snapshot.name;
    flag.key = snapshot.key;
    flag.description = snapshot.description;
    flag.type = snapshot.type;
    flag.enabled = snapshot.enabled;
    flag.value = snapshot.value;
    flag.defaultValue = snapshot.defaultValue;
    flag.targeting = snapshot.targeting;
    flag.rolloutPercentage = snapshot.rolloutPercentage;
    flag.environment = snapshot.environment;

    await flag.save();

    try{
        await AuditLog.create({
            flagId: flagId,
            action: "ROLLBACK",
            changedBy,
            before: beforeState,
            after: flag.toObject()
        })
    } catch(err){
        console.error("Audit log failed!!", err.message)
    }

    return flag;
}