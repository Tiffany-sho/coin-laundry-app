import mongoose from "mongoose";
const { Schema } = mongoose;

const coinLaundryStoreShema = new Schema({
  store: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
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

const coinLaundryStoreModel =
  mongoose.models.CoinlaundryStore ||
  mongoose.model("CoinlaundryStore", coinLaundryStoreShema);

export default coinLaundryStoreModel;
