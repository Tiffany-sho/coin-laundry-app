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

  description: {
    type: String,
    required: true,
  },
  machines: [
    {
      name: {
        type: String,
        required: true,
      },
      num: {
        type: Number,
        required: true,
      },
    },
  ],
  images: [
    {
      type: String,
    },
  ],
});

const coinLaundryStoreModel =
  mongoose.models.CoinlaundryStore ||
  mongoose.model("CoinlaundryStore", coinLaundryStoreShema);

export default coinLaundryStoreModel;
