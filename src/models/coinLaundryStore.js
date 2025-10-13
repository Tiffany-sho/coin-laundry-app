import CollectMoney from "@/app/collectMoney/page";
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
  moneyData: [{ type: Schema.Types.ObjectId, ref: "CollectMoney" }],
  images: [
    {
      type: String,
    },
  ],
});

coinLaundryStoreShema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await CollectMoney.deleteMany({
      _id: {
        $in: doc.moneyData,
      },
    });
  }
});

const coinLaundryStoreModel =
  mongoose.models.CoinlaundryStore ||
  mongoose.model("CoinlaundryStore", coinLaundryStoreShema);

export default coinLaundryStoreModel;
