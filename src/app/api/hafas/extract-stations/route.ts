import { db } from "~/server/db";
import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "station-extraction";
const client = createClient(dbProfile, userAgent);

export async function GET() {
  let tripsAddedCount = 0;
  const stops = await db.station.findMany();
  console.log(stops.length + " stops found");
  // loop over stops and extract arrivals
  // const departuresList: { id: string; depId: string | undefined; depName: string | undefined; depDate: string | undefined; arrId: string | undefined; arrName: string | undefined; trainId: string | undefined; trainName: string | undefined; cancelled: boolean | undefined; }[] = [];
  const departuresList: {
    id: string;
    depId: string;
    depName: string | null;
    depDate: Date;
    depDelay: number;
    arrId: string;
    arrName: string | undefined;
    trainId: string;
    trainType: string | undefined;
    trainName: string | undefined;
    cancelled: boolean;
    remarks: string;
  }[] = [];

  try {

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
        duration: 61, // show departures for the next n mins
        results: 1000, // show departures for the next n mins
      });
  
      // store trip ids in departures in arrays
      for (const departure of departures) {
        if (departure.delay !== null || departure.cancelled) {
          if (
            departure.stop?.id &&
            departure.destination?.id &&
            departure.line?.id &&
            departure.plannedWhen
          ) {
            departuresList.push({
              id: departure.tripId,
              depId: departure.stop?.id,
              depName: departure.stop?.name || null,
              depDelay: departure.delay ?? NaN,
              depDate: new Date(departure.plannedWhen),
              arrId: departure.destination?.id,
              arrName: departure.destination?.name,
              trainId: departure.line?.id,
              trainType: departure.line?.product,
              trainName: departure.line?.name,
              remarks: JSON.stringify(departure.remarks || null),
              cancelled: departure.cancelled || false,
            });
          }
        }
      }
      console.log("departures for " + stop.name + ": " + departures.length);
    });
  
    await Promise.all(departurePromises);
    if (departuresList.length === 0) {
      console.log("No departures found");
      return Response.json(departuresList);
    } else {
      const data = await db.trip.createMany({
        data: departuresList,
        skipDuplicates: true,
      });
      tripsAddedCount = data.count;
      console.log(data.count + " departures stored in database with Prisma skipDuplicates");
    }
    console.log("Done");
  
    const uniqueDepartures = departuresList.filter(
      (departure, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.id === departure.id &&
            t.depId === departure.depId &&
            t.depName === departure.depName &&
            t.depDate === departure.depDate &&
            t.arrId === departure.arrId &&
            t.arrName === departure.arrName &&
            t.depDelay === departure.depDelay &&
            t.trainId === departure.trainId &&
            t.trainName === departure.trainName &&
            t.cancelled === departure.cancelled,
        ),
    );
    console.log("unique departures in manual filter: " + uniqueDepartures.length);
    console.log(
      "duplicate departures in manual filter: " +
        (departuresList.length - uniqueDepartures.length),
    );
    console.log("total departures: " + departuresList.length);
    return new Response(JSON.stringify(departuresList.length > 0 ? {success: true, message: `${tripsAddedCount} Added to Database`} : {success: false}), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }); 
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({success: false, message: error}), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }); 
  }


}

export const fetchCache = 'force-no-store';
export const revalidate = 0;

// localhost:3000/api/hafas/extract-stations
