import express from "express";
const router = express.Router();
import tagInfoSchema from "../models/taginfo.schema";
import * as db from "../models/mongo-local-db";

export interface ItagInfo {
  _id: any;
  items: {
    tag: String;
    unit: String;
    description: String;
  }[];
}

router.get(
  "/",
  async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let conn;

    try {
      conn = await db.createConnection("data");
      const tagInfo = conn.model("tagInfo", tagInfoSchema, "taginfo");
      const result = (await tagInfo.findOne({})) as ItagInfo;
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
      const tagInfo = conn.model("tagInfo", tagInfoSchema, "taginfo");
      await tagInfo.findByIdAndUpdate(
        req.body._id,
        { $set: req.body },
        { upsert: true }
      );
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
