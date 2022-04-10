import mongoose from "mongoose";

export default new mongoose.Schema(
    {
        _id: Number,
        tagList: [String],
        yrange: [[Number, Number]],
    }
);