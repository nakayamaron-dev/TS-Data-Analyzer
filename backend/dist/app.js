"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
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