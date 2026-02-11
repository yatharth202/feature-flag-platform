import express from "express"
import { createFeatureFlag,getAllFeatureFlags,evaluateFlag,updateTargeting,getFeatureFlagVersionsController} from "../controllers/featureFlag.controller.js"


const router = express.Router();

router.post("/",createFeatureFlag);
router.get("/",getAllFeatureFlags);
router.get("/evaluate", evaluateFlag);
router.put("/:id/targeting", updateTargeting);
router.get("/:id/versions", getFeatureFlagVersionsController);


export default router;