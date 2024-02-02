import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "station-extraction";
const client = createClient(dbProfile, userAgent);

export const tripRouter = createTRPCRouter({
  getStation: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const locations = await client.locations(input.query, {
            fuzzy: true,
            stops: true,
            addresses: false,
            poi: false,
            linesOfStops: false,
            language: "en",
            results: 20,
        });
        return locations;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        });
      }
    }),
});
