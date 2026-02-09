import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },


        description: {
            type: String,
            default:"",
        },

        type: {
            type: String,
            enum: ["boolean", "string", "number", "json"],
            default: "boolean"
        },

        enabled: {
             type: Boolean,
             default: false,
        },

        value: {
            type: mongoose.Schema.Types.Mixed,
            default: true
        },

        defaultValue: {
            type: mongoose.Schema.Types.Mixed,
            default: false
        },

        targeting: {
            explicit:{
                    roles:{
                        type: [String],
                        default: []
                    },
                    userIds: {
                        type: [String],
                        default: []
                    }
        },

        rules:[
            {
            field:{
                type: String,
                required: true
            },
            operator:{
                type: String,
                enum: ["equals"],
                default: "equals"
            },
            value:{
                type: String
            }
            }
        ]
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