"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const bodyParserJson = body_parser_1.default.json({ limit: "1gb" });
const api_influx_1 = __importDefault(require("./routes/api-influx"));
const api_tssingle_1 = __importDefault(require("./routes/api-tssingle"));
const api_tsmulti_1 = __importDefault(require("./routes/api-tsmulti"));
const api_tagInfo_1 = __importDefault(require("./routes/api-tagInfo"));
const api_histogram_1 = __importDefault(require("./routes/api-histogram"));
const api_scatter_1 = __importDefault(require("./routes/api-scatter"));
const api_generalsetting_1 = __importDefault(require("./routes/api-generalsetting"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const app = (0, express_1.default)();
app.use("/api/v1/mongo/tssingle", bodyParserJson, api_tssingle_1.default);
app.use("/api/v1/mongo/tsmulti", bodyParserJson, api_tsmulti_1.default);
app.use("/api/v1/mongo/taginfo", bodyParserJson, api_tagInfo_1.default);
app.use("/api/v1/mongo/histogram", bodyParserJson, api_histogram_1.default);
app.use("/api/v1/mongo/scatter", bodyParserJson, api_scatter_1.default);
app.use("/api/v1/mongo/generalsettings", bodyParserJson, api_generalsetting_1.default);
app.use("/api/v1/ts", bodyParserJson, api_influx_1.default);
app.use("/api/*", (_, res) => {
    res.status(404).json({ error: "404 Not Found(No route for API)" });
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist/ts-data-analyzer")));
app.use("/*", express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist/ts-data-analyzer/index.html")));
app.use(function (next) {
    next((0, http_errors_1.default)(404));
});
app.use(function (err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
exports.default = app;
//# sourceMappingURL=app.js.map