import mongoose from "mongoose";

const mongoOption = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

export const createConnection = async function (mongoDbName: string) {

    const mongoUri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}/${mongoDbName}`;
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