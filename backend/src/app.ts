import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import path from "path";
import express from "express";
// import swaggerUi from "swagger-ui-express";
// import swaggerJSDoc from "swagger-jsdoc";
import bodyParser from "body-parser";
const bodyParserText = bodyParser.text({ limit: "1gb" });

import apiInfluxRouter from "./routes/api-influx";

// read environment variables.
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// // Swagger
// const options = {
//   swaggerDefinition: {
//     info: {
//       title: "Express TypeScript",
//       version: "1.0.0"
//     }
//   },
//   apis: ["routes/*"]
// };
// app.use("/spec", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));

app.use("/api/v1/ts", bodyParserText, apiInfluxRouter);

// Angularのルーティング
app.use(express.static(path.join(__dirname, '../../frontend/dist/ts-data-analyzer')));
app.use('/*', express.static(path.join(__dirname, '../../frontend/dist/ts-data-analyzer/index.html')));

// catch 404 and forward to error handler
app.use(function(next: NextFunction) {
    next(createError(404));
  });

// error handler
app.use(function(err: any, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;