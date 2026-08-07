import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import videoRouter from "./video";
import developerRouter from "./developer";
import studyRouter from "./study";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(studyRouter);
router.use(videoRouter);
router.use(developerRouter);

export default router;
