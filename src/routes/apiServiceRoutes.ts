import { Router } from "express";
import {
  getFdRoutes,
  getSupportedActions,
} from "../controllers/apiServiceController";
import validateRequiredParams from "../middleware/index";

const router = Router();

router.get(
  "/supportedActions",
  validateRequiredParams(["domain", "version"]),
  getSupportedActions
);

router.get(
  "/fdRoutes",
  validateRequiredParams(["domain", "version"]),
  getFdRoutes
);

export default router;
