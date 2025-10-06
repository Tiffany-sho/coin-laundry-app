import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectMoneySchema = new Schema({
  store: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  money: [
    {
      machine: {
        name: {
          type: String,
          required: true,
        },
        num: {
          type: Number,
          required: true,
        },
      },
      money: {
        type: Number,
        required: true,
      },
    },
  ],
});

const collectMoneyModel =
  mongoose.models.collectMoney ||
  mongoose.model("CollectMoney", collectMoneySchema);

export default collectMoneyModel;
