// Replace with your actual TRPC library import
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const prisma = new PrismaClient();

const inputSchema = z.object({
  depId: z.string().optional(),
  arrId: z.string().optional(),
  trainType: z.string().optional(),
});

export const insightsRouter = createTRPCRouter({
  //number of cancellation last week for a trip(depId, arrId, trainType)
  getNumberOfCancellationsLastWeek: publicProcedure.query(async (opts) => {
    const today = new Date();
    const lastWeekStartDate = new Date(today);
    lastWeekStartDate.setDate(today.getDate() - 30);

    console.log(lastWeekStartDate);

    const trips = await prisma.trip.findMany({
      where: {
        depId: "8000261",
        arrId: "8000106",
        trainType: "regional",
        cancelled: true,
        depDate: {
          gte: lastWeekStartDate,
          lte: today,
        },
      },
    });

    console.log(trips.slice(0, 5));

    const numberOfTrips = trips.length;

    return {
      numberOfTrips,
    };
  }),


  //compute average delay of same trip(depId, arrId, trainType) in last 7 days
  getAverageDelayForSpecificRoute: publicProcedure.query(
    async () => {
      const today = new Date();
      const lastWeekStartDate = new Date(today);
      lastWeekStartDate.setDate(today.getDate() - 7); 

      console.log(lastWeekStartDate);
      const trips = await prisma.trip.findMany({
        where: {
          depId: "8000261",
          arrId: "8089106 ",
          trainType: "regional",

          depDate: {
            gte: lastWeekStartDate,
          },
        },
        select: {
          depDelay: true,
        },
      });

      console.log( trips);

      let totalDelay = 0;
      let tripCount = 0;

      for (const trip of trips) {
        if (trip.depDelay !== null && trip.depDelay !== undefined) {
          totalDelay += trip.depDelay;
          tripCount++;
        }
      }

      const averageDelay = tripCount > 0 ? totalDelay / tripCount : 0;

      return {
        averageDelay,
      };
    },
  ),


  //get last 20 delay for this trip (depId, arrId, trainType). they can be used to draw a graph 
  getLast20TripDelays: publicProcedure.query(async () => {
    const trips = await prisma.trip.findMany({
        where: {
            depId: '378258', 
            arrId: '8004903',
          trainType: "regional",
        },
        orderBy: {
            depDate: 'desc' 
        },
        take: 5, 
        select: {
            depId: true,
            arrId: true,
            depDelay: true
        }
    });
    console.log(trips);

    const delaysArray = trips.map(trip => trip.depDelay || 0);
    return {
        delays: delaysArray
    };
}),

//see the delays of the train by train id for all trips. it gives an idea about the punctuality of the train in general.
getLast20TripDelaysByTrainId: publicProcedure.query(async () => {
    const trips = await prisma.trip.findMany({
        where: {
            trainId: "re-4",
        },
        orderBy: {
            depDate: 'desc' },
        take: 50, 
        select: {
            depDelay: true
        }
    });

    const delaysArray = trips.map(trip => trip.depDelay || 0); 

    return {
        delays: delaysArray
    };
}),
    
});


