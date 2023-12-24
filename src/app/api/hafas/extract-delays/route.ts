import { db } from "~/server/db";
import { api } from "~/trpc/server";
import { createClient } from 'hafas-client'
import {profile as dbProfile} from 'hafas-client/p/db/index.js'

const userAgent = 'mourabitiziyad@gmail.com'
const client = createClient(dbProfile, userAgent)

export async function GET() {
  const stops = await db.station.findMany();
  // loop through stops and get delay info
  if (stops.length > 0) {
    for (const element of stops) {
      const stop = element;
      const { departures } = await client.departures(stop.id, {
        linesOfStops: true,
      });
      console.log("nice", departures.length);
    }
  }
  return Response.json({response: stops});
}
