"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const influx_1 = require("influx");
const moment_1 = __importDefault(require("moment"));
const executeInfluxQuery = async (influxQueries, res) => {
    const influx = getInfluxInstance();
    const result = (await influx.query(influxQueries)).flat();
    res.status(200).json(result);
};
const getInfluxInstance = () => {
    return new influx_1.InfluxDB({
        host: process.env.INFLUXDB_HOST,
        database: process.env.INFLUXDB_NAME,
        username: "",
        password: "",
        port: Number(process.env.INFLUXDB_PORT),
        protocol: process.env.INFLUXDB_PROTOCOL
    });
};
router.get("/:measurement/last", async (req, res, next) => {
    let query = String.raw `SELECT last(value) as value FROM "${req.params.measurement}"`;
    try {
        await executeInfluxQuery([query], res);
    }
    catch (err) {
        next(err);
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
    query += " group by \"tag\"";
    try {
        await executeInfluxQuery([query], res);
    }
    catch (err) {
        next(err);
    }
});
router.use(function (err, _req, res, _next) {
    res.status(500).json({ error: err });
});
exports.default = router;
//# sourceMappingURL=api-influx.js.map