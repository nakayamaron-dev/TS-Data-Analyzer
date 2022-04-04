import express from "express";
const router = express.Router();
import plotinfo from "../models/plotinfo.schema";
import * as db from "../models/mongo-local-db";

/* M-1 [GET] IPlantconfiguration */
router.get("/plotInfo", async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const PlotInfo = conn.model("PlotInfo", plotinfo, "plotinfo");
      const result = await PlotInfo.findOne({}) as any;
      const doc = result ? result.graph : {};
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  });

// Error Handling.
// See: https://expressjs.com/en/guide/error-handling.html 
router.use((err: unknown, _req: express.Request, res: express.Response<{ error: unknown }>) => {
  res.status(500).json({ error: err }); // for debug. too much shown details.
});

export default router;