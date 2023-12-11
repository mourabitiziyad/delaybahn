import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
  } from "~/server/api/trpc";
  import { z } from "zod";


export const stationRouter = createTRPCRouter({
  // to be moved to app 
    getAllStation: publicProcedure.query(async ({ ctx }) => {
      const stations = await ctx.db.station.findMany()
      console.log(stations)
      return stations;
    }),
  });

  