import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  try {
    const coinLaundryStories = await CoinLaundryStore.find({});
    return Response.json({ success: true, data: coinLaundryStories });
  } catch (err) {
    return Response.json({ success: false }, { status: 400 });
  }
}
