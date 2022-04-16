import express from "express";
const router = express.Router();
import { InfluxDB } from "influx";
import moment from "moment";

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
      protocol: process.env.INFLUXDB_PROTOCOL as "http" | "https"
    });
};

router.get("/:measurement/last", async (req: any, res, next) => {
    let query = String.raw`SELECT last(value) as value FROM "${req.params.measurement}"`;
    const conditions = [];
    
    if (req.query.tags) {
        const tags = "^" + req.query.tags.replace(/,/g, "$|^",) + "$";
        conditions.push(String.raw`"tag" =~ /${tags}/`);
    }

    if (conditions.length > 0) {
        query += " WHERE ";
        query += conditions.join(" AND ");
    }

    query += " group by \"tag\""

    try {
        await executeInfluxQuery([query], res);
    } catch (err) {
        next(err);
    }
})

router.get("/:measurement", async (req: any, res, next) => {
    let query = String.raw`SELECT "tag", "value" FROM "${req.params.measurement}"`;
    const conditions = [];

    if (req.query.tags) {
        const tags = "^" + req.query.tags.replace(/,/g, "$|^",) + "$";
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

    query += " group by \"tag\""

    try {
        await executeInfluxQuery([query], res);
    } catch (err) {
        next(err);
    }
})

router.get("/:measurement/timestamp/last", async (req: any, res, next) => {
    let query = String.raw`SELECT last(value) FROM "${req.params.measurement}"`;
    
    try {
        const influx = getInfluxInstance();
        const result = (await influx.query(query)).flat() as IinfluxValue[];
        res.status(200).json(result[0].time);
    } catch (err) {
        next(err);
    }
})

// Error Handling.
// See: https://expressjs.com/en/guide/error-handling.html
router.use(function (err: any, _req: any, res: any, _next: any) {
    res.status(500).json({ error: err }); // for debug. too much shown details.
});  

export default router;