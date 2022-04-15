import express from "express";
const router = express.Router();
import tsmultiSchema from "../models/tsmulti.schema";
import * as db from "../models/mongo-local-db";

export interface IplotMulti {
  _id: number,
  dateRange?: string[],
  items: {
    tag: string,
    yrange?: {
        min: number,
        max: number
    }
  }[]
}

router.get("/tsmulti/list", async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const TSMulti = conn.model("TSMulti", tsmultiSchema, "tsmulti");
      const result = await TSMulti.find({}) as IplotMulti[];
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

router.get("/tsmulti/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const TSMulti = conn.model("TSMulti", tsmultiSchema, "tsmulti");
    const result = await TSMulti.findOne({'_id': req.params.id}) as IplotMulti;
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

router.patch("/tsmulti", async (req: express.Request, res: express.Response<string>, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const TSMulti = conn.model("TSMulti", tsmultiSchema, "tsmulti");
    for (const body of req.body) {
      await TSMulti.findByIdAndUpdate(body._id, {$set: body}, { upsert: true });
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

router.delete("/tsmulti", async (req: express.Request, res: express.Response<string>, next: express.NextFunction) => {
  let conn;
  try {
    conn = await db.createConnection("data");
    const TSMulti = conn.model("TSMulti", tsmultiSchema, "tsmulti");
    for (const body of req.body) {
      await TSMulti.findByIdAndDelete(body._id);
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