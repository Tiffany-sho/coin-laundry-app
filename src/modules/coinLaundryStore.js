import { mongoose } from "mongoose";
const Schema = mongoose.Schema;

const coinLaundryStoreShema = new Schema({
  store: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  machines: [
    {
      type: String,
      required: true,
    },
  ],
});

const coinLaundryStoreModel = mongoose.model(
  "CoinlaundryStore",
  coinLaundryStoreShema
);

export default coinLaundryStoreModel;
