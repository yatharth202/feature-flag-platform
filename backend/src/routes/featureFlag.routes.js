import express from "express"
import { createFeatureFlag,getAllFeatureFlags,evaluateFlag,updateTargeting,getFeatureFlagVersionsController,rollbackFeatureFlagController} from "../controllers/featureFlag.controller.js"


const router = express.Router();

router.post("/",createFeatureFlag);
router.get("/",getAllFeatureFlags);
router.get("/evaluate", evaluateFlag);
router.put("/:id/targeting", updateTargeting);
router.get("/:id/versions", getFeatureFlagVersionsController);
router.post("/:id/rollback", rollbackFeatureFlagController);


export default router;