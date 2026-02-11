import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        flagId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeatureFlag",
            required: true
        },

        action: {
            type: String,
            enum: ["CREATE_FLAG","UPDATE_TARGETING","ROLLBACK"],
            required: true
        },

        changedBy: {
            type: String,
            default: "system",
        },

        before: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        after: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    { timestamps: true}
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema)