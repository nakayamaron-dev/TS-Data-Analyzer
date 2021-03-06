import mongoose from "mongoose";

export default new mongoose.Schema({
  _id: Number,
  tag_x: String,
  tag_y: String,
  xrange: {
    min: Number,
    max: Number,
  },
  yrange: {
    min: Number,
    max: Number,
  },
});
