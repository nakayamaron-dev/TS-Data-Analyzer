import mongoose from "mongoose";

export default new mongoose.Schema(
    {
        _id: Number,
        dateRange: [String],
        plotTag: [String]
    }
);