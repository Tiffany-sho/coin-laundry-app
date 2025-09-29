import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;
console.log(MONGODB_URL);

if (!MONGODB_URL) {
  throw new Error("Not define MONGODB_URL");
}

let cached = global.mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
