import CollectMoney from "@/models/collectMoney";
import mongoose from "mongoose";
const { Schema } = mongoose;

const coinLaundryStoreSchema = new Schema({
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
  monthDatas: [{ type: Schema.Types.ObjectId, ref: "CoinDataAverage" }],
  images: [
    {
      type: String,
    },
  ],
});

coinLaundryStoreSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await CollectMoney.deleteMany({
      _id: {
        $in: doc.moneyData,
      },
    });
  }
});

const coinLaundryStoreModel =
  mongoose.models.CoinLaundryStore ||
  mongoose.model("CoinLaundryStore", coinLaundryStoreSchema);

export default coinLaundryStoreModel;
