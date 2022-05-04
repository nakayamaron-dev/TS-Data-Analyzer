import express from "express";
const router = express.Router();
import tssingleSchema from "../models/tssingle.schema";
import * as db from "../models/mongo-local-db";

export interface IplotSingle {
  _id: number;
  dateRange?: string[];
  tag: string;
  bin?: number;
  xbin?: {
    end: number;
    size: number;
    start: number;
  };
  yrange?: {
    min: number;
    max: number;
  };
}

router.get(
  "/list",
  async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const TSSingle = conn.model("TSSingle", tssingleSchema, "tssingle");
      const result = (await TSSingle.find({})) as IplotSingle[];
      const doc = result ? result : {};
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  }
);

router.get(
  "/:id",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const TSSingle = conn.model("TSSingle", tssingleSchema, "tssingle");
      const result = (await TSSingle.findOne({
        _id: req.params.id,
      })) as IplotSingle;
      const doc = result ? result : {};
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  }
);

router.patch(
  "/",
  async (
    req: express.Request,
    res: express.Response<string>,
    next: express.NextFunction
  ) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const TSSingle = conn.model("TSSingle", tssingleSchema, "tssingle");
      for (const body of req.body) {
        await TSSingle.findByIdAndUpdate(
          body._id,
          { $set: body },
          { upsert: true }
        );
      }

      res.status(200).json("status OK");
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  }
);

router.delete(
  "/",
  async (
    req: express.Request,
    res: express.Response<string>,
    next: express.NextFunction
  ) => {
    let conn;
    try {
      conn = await db.createConnection("data");
      const TSSingle = conn.model("TSSingle", tssingleSchema, "tssingle");
      for (const body of req.body) {
        await TSSingle.findByIdAndDelete(body._id);
      }
      res.status(200).json("status OK");
    } catch (err) {
      next(err);
    } finally {
      if (conn) {
        conn.close();
      }
    }
  }
);

// Error Handling.
// See: https://expressjs.com/en/guide/error-handling.html
router.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response<{ error: unknown }>
  ) => {
    res.status(500).json({ error: err }); // for debug. too much shown details.
  }
);

export default router;
