import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
});
