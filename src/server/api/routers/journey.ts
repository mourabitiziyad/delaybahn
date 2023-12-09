import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const journeyRouter = createTRPCRouter({
  searchJourney: publicProcedure
    .input(z.object({ from: z.string(), to: z.string(), date: z.date(), now: z.boolean() }))
    .mutation(async ({ input }) => {
      console.log(input);
      try {
        const res = await fetch(
          `https://v6.db.transport.rest/journeys?from=${input.from}&to=${input.to}&departure=${input.now ? "now" : input.date}&results=10&language=en`,
        );
        // const res = await fetch(`https://v6.db.transport.rest/journeys?from=${}&to=${}&departure=tomorrow+2pm&results=2&language=en`);
        const data = await res.json();
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
