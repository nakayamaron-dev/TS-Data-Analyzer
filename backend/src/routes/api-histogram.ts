import express from "express";
const router = express.Router();
import histogramSchema from "../models/histogram.schema";
import * as db from "../models/mongo-local-db";

export interface IplotHist {
    _id: number,
    dateRange: string[],
    plotTag: string[]
}

router.get("/list", async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    let conn;
    
    try {
        conn = await db.createConnection("data");
        const histogram = conn.model("histogram", histogramSchema, "histogram");
        const result = await histogram.find({}) as IplotHist[];
        const doc = result ? result : {};
        res.status(200).json(doc);
    } catch (err) {
        next(err)
    } finally {
        if (conn) {
            conn.close();
        }
    }
})

router.patch("/", async (req: express.Request, res: express.Response<string>, next: express.NextFunction) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const histogram = conn.model("histogram", histogramSchema, "histogram");
      for (let body of req.body) {
        await histogram.findByIdAndUpdate(body._id, {$set: body}, { upsert: true });
      }
      res.status(200).json("status OK");
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  });

router.delete("/", async (req: express.Request, res: express.Response<string>, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const histogram = conn.model("histogram", histogramSchema, "histogram");
    for (const body of req.body) {
      await histogram.findByIdAndDelete(body._id);
    }
    res.status(200).json('status OK');
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