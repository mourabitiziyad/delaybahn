import { MongoClient } from "mongodb";
import { env } from "~/env.mjs";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
};

// MongoDB connection URL
const mongoURL = "mongodb+srv://delybahn:pWe7RNtcr3m5uhVl@tripsdb.oy7y3i2.mongodb.net/?retryWrites=true&w=majority&ssl=true";

export async function connectToMongo() {
  const client = new MongoClient(`${mongoURL}&useNewUrlParser=true&useUnifiedTopology=true`);

  await client.connect();

  return client;
}

export const mongoClient =
  globalForMongo.mongoClient ?? (env.NODE_ENV !== "production" ? connectToMongo() : undefined);

if (env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient as MongoClient;
}
