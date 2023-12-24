import { db } from "~/server/db";
import { api } from "~/trpc/server";
import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "station-extraction";
const client = createClient(dbProfile, userAgent);

export async function GET() {
  let stops = await db.station.findMany();
  console.log(stops.length + " stops found");
  // loop over stops and extract arrivals
  // const departuresList: { id: string; depId: string | undefined; depName: string | undefined; depDate: string | undefined; arrId: string | undefined; arrName: string | undefined; trainId: string | undefined; trainName: string | undefined; cancelled: boolean | undefined; }[] = [];
  const departuresList = [];

  const departurePromises = stops.map(async (stop) => {
    const { departures } = await client.departures(stop.id, {
      linesOfStops: false,
      remarks: true,
      products: {
        nationalExpress: true,
        national: true,
        regionalExpress: true,
        regional: true,
        suburban: false,
        bus: false,
        ferry: true,
        subway: false,
        tram: false,
        taxi: false,
      },
      when: undefined, // corresponds to Date.now()
      duration: 150, // show departures for the next n mins
      results: 1000, // show departures for the next n mins
    });

    // store trip ids in departures in arrays
    for (const departure of departures) {
      if (!departure.delay && departure.delay !== 0 && departure.cancelled == false) {
        departuresList.push({
          id: departure.tripId,
          depId: departure.stop?.id || null,
          depName: departure.stop?.name || null,
          depDate: departure.plannedWhen,
          depDelay: departure.delay ?? NaN,
          arrId: departure.destination?.id,
          arrName: departure.destination?.name,
          trainId: departure.line?.id,
          trainName: departure.line?.name,
          cancelled: departure.cancelled || false,
          remarks: departure.remarks || [],
        });
      }
    }
    console.log("departures for " + stop.name + ": " + departures.length);
  });

  await Promise.all(departurePromises);
  console.log("Done");

  return Response.json(departuresList);

  // return Response.json(await client.departures(stops[1].id, {
  //     linesOfStops: false,
  //     remarks: true,
  //     products: {
  //         nationalExpress: true,
  //         national: true,
  //         regionalExpress: true,
  //         regional: true,
  //         suburban: false,
  //         bus: false,
  //         ferry: true,
  //         subway: false,
  //         tram: false,
  //         taxi: false,
  //     },
  //     when: undefined, // corresponds to Date.now()
  //     duration: 150, // show departures for the next n mins
  //     results: 1000, // show departures for the next n mins
  // }));
}
// localhost:3000/api/hafas/extract-stations
