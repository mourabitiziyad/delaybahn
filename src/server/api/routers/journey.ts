import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const locationSchema = z.object({
  type: z.string().optional(),
  id: z.string().optional(),
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
  type: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
});

const lineSchema = z.object({
  type: z.string().optional(),
  id: z.string().optional(),
  fahrtNr: z.string().optional(),
  name: z.string().optional(),
  public: z.boolean(),
  adminCode: z.string().optional(),
  productName: z.string().optional(),
  mode: z.string().optional(),
  product: z.string().optional(),
  operator: operatorSchema,
});

const remarkSchema = z.object({
  text: z.string().optional(),
  type: z.string().optional(),
  code: z.string().optional(),
  summary: z.string().optional(),
});

const journeySchema = z.object({
  origin: z.object({
    type: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    location: locationSchema,
    products: productsSchema,
  }).optional(),
  destination: z.object({
    type: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    location: locationSchema,
    products: productsSchema,
  }).optional(),
  departure: z.string().optional(),
  plannedDeparture: z.string().optional(),
  departureDelay: z.number().optional(),
  arrival: z.string().optional(),
  plannedArrival: z.string().optional(),
  arrivalDelay: z.number().optional(),
  reachable: z.boolean().optional(),
  tripId: z.string().optional(),
  line: lineSchema.optional(),
  direction: z.string().optional(),
  currentLocation: locationSchema.optional(),
  arrivalPlatform: z.string().optional(),
  plannedArrivalPlatform: z.string().optional(),
  arrivalPrognosisType: z.string().optional(),
  departurePlatform: z.string().optional(),
  plannedDeparturePlatform: z.string().optional(),
  departurePrognosisType: z.string().optional(),
  remarks: z.array(remarkSchema).optional(),
  loadFactor: z.string().optional(),
});

const JourneyResponseSchema = z.object({
  journeys: z.array(journeySchema),
  refreshToken: z.string().optional(),
  price: z.object({
    amount: z.number(),
    currency: z.string().optional(),
    hint: z.string().nullable(),
  }).optional(),
});



export const journeyRouter = createTRPCRouter({
  searchJourney: publicProcedure
    .input(z.object({ from: z.string().optional(), to: z.string().optional(), date: z.date(), now: z.boolean() }))
    .mutation(async ({ input }) => {
      console.log(input);
      try {
        const res = await fetch(
          `https://v6.db.transport.rest/journeys?from=${input.from}&to=${input.to}&departure=${input.now ? "now" : input.date.toISOString()}&results=10&language=en`,
        );
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