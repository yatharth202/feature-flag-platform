import express from "express"
import { createFeatureFlag,getAllFeatureFlags } from "../controllers/featureFlag.controller.js"

const router = express.Router();

router.post("/",createFeatureFlag);
router.get("/",getAllFeatureFlags);

export default router;