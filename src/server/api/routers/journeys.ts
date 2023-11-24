import { MongoClient } from "mongodb";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { connectToMongo } from "~/server/mongodb";
import Journey from "~/server/models/Journey";


// MongoDB connection URL
const mongoURL = "mongodb+srv://delybahn:pWe7RNtcr3m5uhVl@tripsdb.oy7y3i2.mongodb.net/?retryWrites=true&w=majority&ssl=true";

export const postRouter = createTRPCRouter({
  getAllJourneys: publicProcedure
    .input(z.undefined({}))
    .query(async () => {
      try {

        const client = await connectToMongo();
        // Access the MongoDB collection
        const db = client.db("journeys");
        const collection = db.collection<Journey>('journeys_data');

        // Retrieve data from MongoDB
        const journeysData: Journey[] = await collection.find().toArray();
     
        return {
          journeys: journeysData,
        };
      } catch (error) {
        console.error('Error fetching journeys from MongoDB:', error);
        throw new Error('Failed to fetch journeys from MongoDB');
      }
    }),
});




