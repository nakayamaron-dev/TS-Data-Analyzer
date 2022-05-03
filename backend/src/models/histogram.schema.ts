import mongoose from "mongoose";

export default new mongoose.Schema({
  _id: Number,
  dateRange: [String],
  items: [
    {
      tag: String,
      xbin: {
        end: Number,
        size: Number,
        start: Number,
      },
    },
  ],
});
