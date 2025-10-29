import { mongoose } from "mongoose";
import CollectMoney from "@/models/collectMoney";
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
  images: [
    {
      path: {
        type: String,
      },
      url: {
        type: String,
      },
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
