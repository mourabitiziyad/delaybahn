import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "station-extraction";
const client = createClient(dbProfile, userAgent);

export const delayExtractionRouter = createTRPCRouter({
  getRouteDelays: publicProcedure.query(async () => {
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
      trainType: string;
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
                trainType: departure.line.product || "-",
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
      } else {
        const data = await db.trip.createMany({
          data: departuresList,
          skipDuplicates: true,
        });
        tripsAddedCount = data.count;
        console.log(
          data.count +
            " departures stored in database with Prisma skipDuplicates",
        );
      }
      console.log("Done");
      console.log("total departures: " + departuresList.length);
      return { success: true, message: `${tripsAddedCount} Added to Database` };
    } catch (error: any) {
      console.error(error);
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong: " + error?.message,
      });
    }
  }),
  addOrUpdateJourneyDelays: publicProcedure.query(async () => {
    try {
      const aggregatedData = await db.trip.groupBy({
        by: ['depId', 'depName', 'arrId', 'arrName', 'trainType'],
        _avg: {
          depDelay: true,
        },
        _min: {
          depDelay: true,
        },
        _max: {
          depDelay: true,
        },
        _count: {
          depDelay: true,
          cancelled: true,
        }
      });
      console.log(aggregatedData.length + " aggregated data found");

      for (const data of aggregatedData) {
        await db.journeyDelays.upsert({
          where: {
            // Unique constraint
            depId_arrId_trainType: {
              depId: data.depId,
              arrId: data.arrId,
              trainType: data.trainType,
            },
          },
          update: {
            avgDelay: data._avg.depDelay,
            minDelay: data._min.depDelay,
            maxDelay: data._max.depDelay,
            numOfTrips: data._count.depDelay,
            numOfCancellations: data._count.cancelled,
            // Other fields can be updated similarly
          },
          create: {
            depId: data.depId,
            depName: data.depName,
            arrId: data.arrId,
            arrName: data.arrName,
            trainType: data.trainType,
            avgDelay: data._avg.depDelay,
            minDelay: data._min.depDelay,
            maxDelay: data._max.depDelay,
            numOfTrips: data._count.depDelay,
            numOfCancellations: data._count.cancelled,
  
            // Other fields can be set similarly
          },
        });
      }
      return { success: true, message: "Found " + aggregatedData.length + " aggregated data"  };
    } catch (error) {
      console.error("An error occurred:", error);
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong: " + error?.message,
      });
    }
  }),
})