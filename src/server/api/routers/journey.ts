import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

const userAgent = "station-extraction";
const client = createClient(dbProfile, userAgent);

const transportTypes = z.object({
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
})

export const journeyRouter = createTRPCRouter({
  searchJourney: publicProcedure
    .input(z.object({ from: z.string(), to: z.string(), date: z.date(), now: z.boolean(), transportTypes: transportTypes}))
    .mutation(async ({ input }) => {
      console.log(input);
      try {
        const data = await client.journeys(input.from, input.to, {
          departure: input.now ? new Date() : input.date,
          results: 20,
          language: "en",
          products: {
            nationalExpress: input.transportTypes.nationalExpress,
            national: input.transportTypes.national,
            regionalExpress: input.transportTypes.regionalExpress,
            regional: input.transportTypes.regional,
            suburban: input.transportTypes.suburban,
            bus: input.transportTypes.bus,
            ferry: input.transportTypes.ferry,
            subway: input.transportTypes.subway,
            tram: input.transportTypes.tram,
            taxi: input.transportTypes.taxi,
          },
        })
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        });
      }
    }),
});