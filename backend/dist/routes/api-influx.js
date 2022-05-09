"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const influx_1 = require("influx");
const moment_1 = __importDefault(require("moment"));
const http_1 = __importDefault(require("http"));
const executeInfluxQuery = async (influxQueries, res) => {
    const influx = getInfluxInstance();
    const result = (await influx.query(influxQueries)).flat();
    res.status(200).json(result);
};
const getInfluxInstance = (host, dbname) => {
    return new influx_1.InfluxDB({
        host: host ? host : process.env.INFLUXDB_HOST,
        database: dbname ? dbname : process.env.INFLUXDB_NAME,
        username: "",
        password: "",
        port: Number(process.env.INFLUXDB_PORT),
        protocol: process.env.INFLUXDB_PROTOCOL,
    });
};
router.get("/:measurement/last", async (req, res, next) => {
    let query = String.raw `SELECT last(value) as value FROM "${req.params.measurement}"`;
    const conditions = [];
    if (req.query.tags) {
        const tags = "^" + req.query.tags.replace(/,/g, "$|^") + "$";
        conditions.push(String.raw `"tag" =~ /${tags}/`);
    }
    if (conditions.length > 0) {
        query += " WHERE ";
        query += conditions.join(" AND ");
    }
    query += ' group by "tag"';
    try {
        await executeInfluxQuery([query], res);
    }
    catch (err) {
        next(err);
    }
});
router.post("/createdb", async (req, res, next) => {
    try {
        const influx = getInfluxInstance(req.body.host);
        influx.createDatabase(req.body.dbname);
        res.status(200).json("status ok");
    }
    catch (err) {
        next(err);
    }
});
router.get("/databases", async (req, res) => {
    let query = String.raw `SHOW DATABASES`;
    try {
        const influx = getInfluxInstance(req.query.host);
        const result = (await influx.query(query)).flat();
        res.status(200).json(result);
    }
    catch (err) {
        res.status(404).json("not found");
        return;
    }
});
router.get("/:measurement", async (req, res, next) => {
    let query = String.raw `SELECT "tag", "value" FROM "${req.params.measurement}"`;
    const conditions = [];
    if (req.query.tags) {
        const tags = "^" + req.query.tags.replace(/,/g, "$|^") + "$";
        conditions.push(String.raw `"tag" =~ /${tags}/`);
    }
    if (req.query.from) {
        conditions.push(String.raw `time >= ${(0, moment_1.default)(req.query.from).valueOf()}ms`);
    }
    if (req.query.to) {
        conditions.push(String.raw `time <= ${(0, moment_1.default)(req.query.to).valueOf()}ms`);
    }
    if (conditions.length > 0) {
        query += " WHERE ";
        query += conditions.join(" AND ");
    }
    query += ' group by "tag"';
    try {
        await executeInfluxQuery([query], res);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:measurement/timestamp/last", async (req, res, next) => {
    let query = String.raw `SELECT last(value) FROM "${req.params.measurement}"`;
    try {
        const influx = getInfluxInstance();
        const result = (await influx.query(query)).flat();
        res.status(200).json(result[0].time);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/delete", async (req, res, next) => {
    let tags = req.query.tags;
    let influxQuery = "";
    try {
        if (!tags) {
            res.status(400).json({ msg: "Bad Request(select at least one tag.)" });
            return;
        }
        if (tags === "all") {
            influxQuery = String.raw `DROP SERIES FROM /.*/`;
        }
        else {
            tags = "^" + tags.replace(/,/g, "$|^") + "$";
            influxQuery = String.raw `DROP SERIES WHERE "tag" =~ /${tags}/`;
        }
        await executeInfluxQuery([influxQuery], res);
    }
    catch (err) {
        next(err);
    }
});
router.post("/:measurement/upload", async (req, res) => {
    let lines = req.body.split("\n");
    const buffer = [];
    while (lines.length > 0) {
        buffer.push(lines.splice(0, 200000).join("\n"));
    }
    const postDataFunc = async (postData) => {
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
        const statusCode = await new Promise((resolve) => {
            const req_post = http_1.default
                .request(options, (influxResponse) => {
                console.log("STATUS: " + influxResponse.statusCode);
                console.log("HEADERS: " + JSON.stringify(influxResponse.headers));
                influxResponse.setEncoding("utf8");
                influxResponse.on("data", (chunk) => {
                    console.log("BODY: " + chunk);
                });
                influxResponse.on("end", () => {
                    var _a;
                    resolve((_a = influxResponse.statusCode) !== null && _a !== void 0 ? _a : 0);
                });
            })
                .on("error", (err) => {
                console.log(err.name);
                console.log(err.message);
                resolve(500);
            });
            req_post.write(postData);
            req_post.end();
        });
        return statusCode;
    };
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
router.use(function (err, _req, res, _next) {
    res.status(500).json({ error: err });
});
exports.default = router;
//# sourceMappingURL=api-influx.js.map