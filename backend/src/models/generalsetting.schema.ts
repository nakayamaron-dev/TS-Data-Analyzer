import mongoose from "mongoose";

export default new mongoose.Schema({
  _id: Object,
  dateRange: {
    From: String,
    To: String,
  },
  viewMode: String,
});
