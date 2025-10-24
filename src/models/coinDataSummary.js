import mongoose from "mongoose";
const { Schema } = mongoose;

const coinDataSummarySchema = new Schema({
  store: {
    type: String,
    required: true,
  },
  storeId: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  average: {
    type: Number,
    required: true,
  },
});

const coinDataSummaryModel = mongoose.model(
  "CoinDataSummary",
  coinDataSummarySchema
);

export default coinDataSummaryModel;
