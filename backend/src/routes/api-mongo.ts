import express from "express";
const router = express.Router();
import plotinfo from "../models/plotinfo.schema";
import * as db from "../models/mongo-local-db";

interface Igraph {
  _id: number,
  tagList: string[]
}

router.get("/plotinfo/list", async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const PlotInfo = conn.model("PlotInfo", plotinfo, "plotinfo");
      const result = await PlotInfo.find({}) as Igraph[];
      const doc = result ? result : {};
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  });

router.get("/plotinfo/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const PlotInfo = conn.model("PlotInfo", plotinfo, "plotinfo");
    const result = await PlotInfo.findOne({'_id': req.params.id}) as Igraph;
    const doc = result ? result : {};
    res.status(200).json(doc);
  } catch (err) {
    next(err);
  } finally {
    if (conn) {
      conn.close();
    }
  }
});

router.patch("/plotinfo", async (req: express.Request, res: express.Response<string>, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const PlotInfo = conn.model("PlotInfo", plotinfo, "plotinfo");
    await PlotInfo.findByIdAndUpdate(req.body._id, {$set: req.body}, { upsert: true });
    res.status(200).json("status OK");
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