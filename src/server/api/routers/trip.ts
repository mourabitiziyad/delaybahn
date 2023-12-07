import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tripRouter = createTRPCRouter({
  getStation: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const res = await fetch(`https://v6.db.transport.rest/locations?query=${input.query}&fuzzy=true&results=10&stops=true&addresses=false&poi=false&linesOfStops=false&language=en`)
        const data = await res.json()
        return data;
      } catch (error) {
        console.error(error)
        return error;
      }
    }),
});
