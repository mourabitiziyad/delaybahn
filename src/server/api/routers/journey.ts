import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const locationSchema = z.object({
  type: z.string(),
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const productsSchema = z.object({
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

const operatorSchema = z.object({
  type: z.string(),
  id: z.string(),
  name: z.string(),
});

const lineSchema = z.object({
  type: z.string(),
  id: z.string(),
  fahrtNr: z.string(),
  name: z.string(),
  public: z.boolean(),
  adminCode: z.string(),
  productName: z.string(),
  mode: z.string(),
  product: z.string(),
  operator: operatorSchema,
});

const remarkSchema = z.object({
  text: z.string(),
  type: z.string(),
  code: z.string(),
  summary: z.string(),
});

const journeySchema = z.object({
  origin: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    location: locationSchema,
    products: productsSchema,
  }),
  destination: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    location: locationSchema,
    products: productsSchema,
  }),
  departure: z.string(),
  plannedDeparture: z.string(),
  departureDelay: z.number().nullable(),
  arrival: z.string(),
  plannedArrival: z.string(),
  arrivalDelay: z.number().nullable(),
  reachable: z.boolean(),
  tripId: z.string(),
  line: lineSchema,
  direction: z.string(),
  currentLocation: locationSchema,
  arrivalPlatform: z.string(),
  plannedArrivalPlatform: z.string(),
  arrivalPrognosisType: z.string().nullable(),
  departurePlatform: z.string(),
  plannedDeparturePlatform: z.string(),
  departurePrognosisType: z.string().nullable(),
  remarks: z.array(remarkSchema),
  loadFactor: z.string(),
});

const JourneyResponseSchema = z.object({
  journeys: z.array(journeySchema),
  refreshToken: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
    hint: z.string().nullable(),
  }),
});

const JourneyResponseArraySchema = z.array(JourneyResponseSchema);



export const journeyRouter = createTRPCRouter({
  searchJourney: publicProcedure
    .input(z.object({ from: z.string(), to: z.string(), date: z.date(), now: z.boolean() }))
    .mutation(async ({ input }) => {
      console.log(input);
      try {
        const res = await fetch(
          `https://v6.db.transport.rest/journeys?from=${input.from}&to=${input.to}&departure=${input.now ? "now" : input.date}&results=10&language=en`,
        );
        const data = await res.json();
        const parsedData = JourneyResponseArraySchema.parse(data);
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