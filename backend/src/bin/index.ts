import app from "../app";
import http from "http";

// Get port from environment and store in Express.
const port = process.env.PORT || '8000';
app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(parseInt(port, 10), "0.0.0.0");

