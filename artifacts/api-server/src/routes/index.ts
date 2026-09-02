import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import videoRouter from "./video";
import developerRouter from "./developer";
import pdfRouter from "./pdf";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(videoRouter);
router.use(developerRouter);
router.use(pdfRouter);

export default router;
