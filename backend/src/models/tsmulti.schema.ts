import mongoose from "mongoose";

export default new mongoose.Schema(
    {
        _id: Number,
        dateRange: [String],
        items: [
            {
                tag: String,
                yrange: {
                    min: Number,
                    max: Number
                }
            }
        ]
    }
);