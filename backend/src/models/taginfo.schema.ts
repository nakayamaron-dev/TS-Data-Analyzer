import mongoose from "mongoose";

export default new mongoose.Schema({
  _id: Object,
  items: [
    {
      tag: String,
      unit: String,
      description: String,
    },
  ],
});
