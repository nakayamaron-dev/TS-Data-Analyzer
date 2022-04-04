import mongoose from "mongoose";

// For the DBConnenction
const hostName = "localhost:27017";
const user = "mongo";
const pass = "mongo";

const mongoOption = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

export const createConnection = async function (mongoDbName: string) {

    const mongoUri = `mongodb://${user}:${pass}@${hostName}/${mongoDbName}`;
    const conn = await mongoose.createConnection(mongoUri, mongoOption);
    console.log("Mongo - open(userdb: " + mongoDbName + ")"); // after await, db was opend.
 
    const events = [ "disconnecting", "disconnected", "reconnected"];
    events.forEach((eventname) => {
        conn.on(eventname, () => {
            console.log("Mongo - "+ eventname + "(userdb: " + mongoDbName + ")");
        });
    });

    return conn;

};