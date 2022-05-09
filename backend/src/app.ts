import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
const bodyParserJson = bodyParser.json({ limit: "1gb" });

import apiInfluxRouter from "./routes/api-influx";
import apiTSSingleRouter from "./routes/api-tssingle";
import apiTSMultiRouter from "./routes/api-tsmulti";
import apiTagInfoRouter from "./routes/api-tagInfo";
import apiHistogramRouter from "./routes/api-histogram";
import apiScatterRouter from "./routes/api-scatter";
import apiGeneralSettingRouter from "./routes/api-generalsetting";

// read environment variables.
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

app.use("/api/v1/mongo/tssingle", bodyParserJson, apiTSSingleRouter);
app.use("/api/v1/mongo/tsmulti", bodyParserJson, apiTSMultiRouter);
app.use("/api/v1/mongo/taginfo", bodyParserJson, apiTagInfoRouter);
app.use("/api/v1/mongo/histogram", bodyParserJson, apiHistogramRouter);
app.use("/api/v1/mongo/scatter", bodyParserJson, apiScatterRouter);
app.use(
  "/api/v1/mongo/generalsettings",
  bodyParserJson,
  apiGeneralSettingRouter
);
app.use("/api/v1/ts", bodyParserJson, apiInfluxRouter);
app.use("/api/*", (_, res) => {
  res.status(404).json({ error: "404 Not Found(No route for API)" });
});

// Angularのルーティング
app.use(
  express.static(path.join(__dirname, "../../frontend/dist/ts-data-analyzer"))
);
app.use(
  "/*",
  express.static(
    path.join(__dirname, "../../frontend/dist/ts-data-analyzer/index.html")
  )
);

// catch 404 and forward to error handler
app.use(function (next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
