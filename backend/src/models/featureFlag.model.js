import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description:{
            type: String,
            default:"",
        },

        enabled: {
             type: Boolean,
             default: false,
        },

        rolloutPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        environment: {
            type: String,
            enum: ["dev","prod"],
            default: "prod",
        },
    },
    {timestamps: true}
)

export const FeatureFlag = mongoose.model("FeatureFlag",featureFlagSchema)