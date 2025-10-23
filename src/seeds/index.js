import { mongoose } from "mongoose";
import stores from "./store.js";
import CoinLaundryStore from "../models/coinLaundryStore.js";
import CollectMoney from "../models/collectMoney.js";

const MONGODB_URL = process.env.MONGODB_URL;

mongoose
  .connect(MONGODB_URL)

  .then(() => {
    console.log("MongDB接続しました");
  })
  .catch((err) => {
    console.log("MongDB接続できませんでした");
    console.log(err);
  });

const seedDB = async () => {
  await CoinLaundryStore.deleteMany({});
  await CollectMoney.deleteMany({});

  for (let i = 0; i < stores.length; i++) {
    const newCoinlaundryStore = new CoinLaundryStore(stores[i]);
    await newCoinlaundryStore.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
