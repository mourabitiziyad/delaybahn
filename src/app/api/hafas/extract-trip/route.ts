import { db } from "~/server/db";
import { api } from "~/trpc/server";
import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "mourabitiziyad@gmail.com";
const client = createClient(dbProfile, userAgent);

export async function GET() {
  // 1|1000083|7|81|24122023
  // 1|1000083|6|81|24122023
  const {trip} = await client.trip("1|702400|21|81|24122023", {
    stopovers: true,
  });
  return Response.json({ trip: trip});
}
