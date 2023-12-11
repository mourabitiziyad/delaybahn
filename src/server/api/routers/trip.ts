import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import axios from 'axios';

const LocationSchema = z.object({
    type: z.string(),
    id: z.string(),
    latitude: z.number(),
    longitude: z.number(),
});

const ProductsSchema = z.object({
    nationalExpress: z.boolean(),
    national: z.boolean(),
    regionalExpress: z.boolean(),
    regional: z.boolean(),
    suburban: z.boolean(),
    bus: z.boolean(),
    ferry: z.boolean(),
    subway: z.boolean(),
    tram: z.boolean(),
    taxi: z.boolean(),
});

const StopSchema = z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    location: LocationSchema,
    products: ProductsSchema,
});

// If the API returns an array of Stops
const StopsArraySchema = z.array(StopSchema);

// Use StopsArraySchema for validation in your tRPC router
export const tripRouter = createTRPCRouter({
  getStation: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const res = await fetch(`https://v6.db.transport.rest/locations?query=${input.query}&fuzzy=true&results=20&stops=true&addresses=false&poi=false&linesOfStops=false&language=en`);
        const data = await res.json();
        const parsedData = StopsArraySchema.parse(data); // Validate the data shape
        return parsedData;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        });
      }
    }),

    
insertTripsPeriodically: publicProcedure
.mutation(async ({ ctx, input }) => {
  
  try {

   // get all stations !
  const res = await fetch("http://localhost:3000/api/trpc/station.getAllStation");
  const data = await res.json();
  const jsonArray = data.result.data.json;

  //prepare date + 15min
  const currentTime = new Date();
  const fifteenMinLater = new Date(currentTime.getTime() + 15 * 60 * 1000); //add 15 minutes to currenttime
  const timeFrame = fifteenMinLater.toISOString();


  //for each station we read the arrivals
 for (const station of jsonArray) {

      const url = `https://v6.db.transport.rest/stops/${jsonArray.id}/arrivals?when=${timeFrame}`;
      const response = await fetch(url)
      const resdata = await response.json();
 
      const createdTrip = await ctx.db.trip.create({
        data: {
          depId: resdata.stop.id,
          depName: resdata.stop.name,
          depLatitude: resdata.stop.location.latitude,
          depLongitude: resdata.stop.location.longitude,
          depDelay: resdata.delay || 0,
          arrId: resdata, 
          trainId: resdata.line.id,
          trainName: resdata.line.name,
          arrName: "", 
          arrLatitude: 0, 
          arrLongitude: 0,
          arrDelay: 0,
          tripDate: resdata.when ? new Date(resdata.when) : new Date(resdata.plannedWhen),
          // Add other fields as needed
        },
      });
  }

  return ;

  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      cause: error,
    });
  }
}),
});
