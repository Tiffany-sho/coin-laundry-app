import mongoose from "mongoose";
const { Schema } = mongoose;

const collectMoneySchema = new Schema({
  store: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  moneyArray: [
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
  mongoose.models.CollectMoney ||
  mongoose.model("CollectMoney", collectMoneySchema);

export default collectMoneyModel;
