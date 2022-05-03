import express from "express";
const router = express.Router();
import { InfluxDB } from "influx";
import moment from "moment";
import http from "http";

interface IinfluxValue {
  time: string;
  value: number;
}

const executeInfluxQuery = async (influxQueries: string[], res: any) => {
  const influx = getInfluxInstance();
  const result = (await influx.query(influxQueries)).flat();
  res.status(200).json(result);
};

const getInfluxInstance = () => {
  return new InfluxDB({
    host: process.env.INFLUXDB_HOST,
    database: process.env.INFLUXDB_NAME,
    username: "",
    password: "",
    port: Number(process.env.INFLUXDB_PORT),
    protocol: process.env.INFLUXDB_PROTOCOL as "http" | "https",
  });
};

router.get("/:measurement/last", async (req: any, res, next) => {
  let query = String.raw`SELECT last(value) as value FROM "${req.params.measurement}"`;
  const conditions = [];

  if (req.query.tags) {
    const tags = "^" + req.query.tags.replace(/,/g, "$|^") + "$";
    conditions.push(String.raw`"tag" =~ /${tags}/`);
  }

  if (conditions.length > 0) {
    query += " WHERE ";
    query += conditions.join(" AND ");
  }

  query += ' group by "tag"';

  try {
    await executeInfluxQuery([query], res);
  } catch (err) {
    next(err);
  }
});

router.get("/:measurement", async (req: any, res, next) => {
  let query = String.raw`SELECT "tag", "value" FROM "${req.params.measurement}"`;
  const conditions = [];

  if (req.query.tags) {
    const tags = "^" + req.query.tags.replace(/,/g, "$|^") + "$";
    conditions.push(String.raw`"tag" =~ /${tags}/`);
  }

  if (req.query.from) {
    conditions.push(String.raw`time >= ${moment(req.query.from).valueOf()}ms`);
  }

  if (req.query.to) {
    conditions.push(String.raw`time <= ${moment(req.query.to).valueOf()}ms`);
  }

  if (conditions.length > 0) {
    query += " WHERE ";
    query += conditions.join(" AND ");
  }

  query += ' group by "tag"';

  try {
    await executeInfluxQuery([query], res);
  } catch (err) {
    next(err);
  }
});

router.get("/:measurement/timestamp/last", async (req: any, res, next) => {
  let query = String.raw`SELECT last(value) FROM "${req.params.measurement}"`;

  try {
    const influx = getInfluxInstance();
    const result = (await influx.query(query)).flat() as IinfluxValue[];
    res.status(200).json(result[0].time);
  } catch (err) {
    next(err);
  }
});

router.delete("/delete", async (req: any, res, next) => {
  let tags = req.query.tags;
  let influxQuery = "";

  try {
    if (!tags) {
      res.status(400).json({ msg: "Bad Request(select at least one tag.)" });
      return;
    }

    if (tags === "all") {
      influxQuery = String.raw`DROP SERIES FROM /.*/`;
    } else {
      tags = "^" + tags.replace(/,/g, "$|^") + "$";
      influxQuery = String.raw`DROP SERIES WHERE "tag" =~ /${tags}/`;
    }

    await executeInfluxQuery([influxQuery], res);
  } catch (err) {
    next(err);
  }
});

router.post("/:measurement/upload", async (req: any, res) => {
  let lines = (req.body as string).split("\n");

  // Divide
  const buffer: string[] = [];
  while (lines.length > 0) {
    buffer.push(lines.splice(0, 200000).join("\n"));
  }

  const postDataFunc = async (postData: string): Promise<number> => {
    const options = {
      host: process.env.INFLUXDB_HOST,
      port: process.env.INFLUXDB_PORT,
      path: "/write?db=" + process.env.INFLUXDB_NAME,

      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(postData),
      },
    };
    const statusCode = await new Promise<number>((resolve) => {
      const req_post = http
        .request(options, (influxResponse) => {
          console.log("STATUS: " + influxResponse.statusCode);
          console.log("HEADERS: " + JSON.stringify(influxResponse.headers));
          influxResponse.setEncoding("utf8");
          influxResponse.on("data", (chunk) => {
            console.log("BODY: " + chunk);
          });
          influxResponse.on("end", () => {
            resolve(influxResponse.statusCode ?? 0);
          });
        })
        .on("error", (err: Error) => {
          console.log(err.name);
          console.log(err.message);
          resolve(500);
        });
      req_post.write(postData);
      req_post.end();
    });

    return statusCode;
  };

  // send all
  let idx = 0;
  let statusCode = 0;
  for (idx = 0; idx < buffer.length; idx++) {
    console.log(`Uploading...(${idx + 1}/${buffer.length})`);
    statusCode = await postDataFunc(buffer[idx]);
    if (statusCode === 500) {
      res.status(500).json({ status: "error" });
      return;
    }
  }
  res.status(statusCode).json({ status: "completed" });
});

// Error Handling.
// See: https://expressjs.com/en/guide/error-handling.html
router.use(function (err: any, _req: any, res: any, _next: any) {
  res.status(500).json({ error: err }); // for debug. too much shown details.
});

export default router;
