"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const bodyParserText = body_parser_1.default.text({ limit: "1gb" });
const bodyParserJson = body_parser_1.default.json({ limit: "1gb" });
const api_influx_1 = __importDefault(require("./routes/api-influx"));
const api_tsmulti_1 = __importDefault(require("./routes/api-tsmulti"));
const api_tagInfo_1 = __importDefault(require("./routes/api-tagInfo"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const app = (0, express_1.default)();
app.use("/api/v1/mongo/tsmulti", bodyParserJson, api_tsmulti_1.default);
app.use("/api/v1/mongo/taginfo", bodyParserJson, api_tagInfo_1.default);
app.use("/api/v1/ts", bodyParserText, api_influx_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist/ts-data-analyzer')));
app.use('/*', express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist/ts-data-analyzer/index.html')));
app.use(function (next) {
    next((0, http_errors_1.default)(404));
});
app.use(function (err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
//# sourceMappingURL=app.js.map