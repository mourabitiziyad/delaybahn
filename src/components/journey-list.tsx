"use client";
import React from "react";
import { useJourneyStore } from "~/store/useStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem } from "./ui/accordion";
import { AccordionTrigger } from "@radix-ui/react-accordion";
import { ArrowRightIcon, ClockIcon } from "@radix-ui/react-icons";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { PersonStanding, TrainFrontIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Journey } from "~/types/types";

export default function JourneyList() {
  const { journey, reset } = useJourneyStore();

  const calculateWaitTime = (
    currentLegArrival: string,
    nextLegDeparture: string,
  ) => {
    if (!currentLegArrival || !nextLegDeparture) return null;
    const arrivalDate = parseISO(currentLegArrival);
    const departureDate = parseISO(nextLegDeparture);
    const waitTimeMinutes = differenceInMinutes(departureDate, arrivalDate);
    return waitTimeMinutes > 0 ? waitTimeMinutes : null;
  };

  const formatTripDuration = (departure: string, arrival: string) => {
    const departureDate = parseISO(departure);
    const arrivalDate = parseISO(arrival);
    const duration = differenceInMinutes(arrivalDate, departureDate);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateDurationInMinutes = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return differenceInMinutes(endDate, startDate);
  };

  const calculateLegRatio = (leg: Journey, totalDuration: number) => {
    const legDuration = calculateDurationInMinutes(leg.departure, leg.arrival);
    // Convert toFixed result back to a number
    return Math.floor(Number((legDuration / totalDuration).toFixed(4)) * 100);
  };

  if (!journey?.journeys) {
    return null;
  }

  return (
    <Card className="mx-auto w-full max-w-4xl py-4">
      <CardHeader>
        <CardTitle>Journey List</CardTitle>
        <CardDescription>Available Journeys.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {journey?.journeys?.map((journey, index) => {
            if (!journey.legs || journey.legs.length === 0) {
              return null;
            }
            const firstLeg = journey.legs[0]!;
            const lastLeg = journey.legs[journey.legs.length - 1]!;
            const journeyDuration = formatTripDuration(
              firstLeg.departure,
              lastLeg.arrival,
            );
            const totalDuration = calculateDurationInMinutes(
              firstLeg.departure,
              lastLeg.arrival,
            );
            return (
              <AccordionItem className="" value={index.toString()} key={index}>
                <AccordionTrigger className="mb-4 flex w-full justify-between rounded-lg bg-slate-100 p-2">
                  <div className="w-full">
                    <div className="text-left">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {format(parseISO(firstLeg.departure), "HH:mm")} -{" "}
                          {format(parseISO(lastLeg.arrival), "HH:mm")} |{" "}
                          {journeyDuration} | {journey.legs.length - 1} Transfer
                          {journey.legs.length - 1 > 1 ? "s" : ""}
                        </span>
                        <span className="mr-4 text-sm font-medium text-muted-foreground">
                          {format(parseISO(firstLeg.departure), "EEEE MMM do")}
                        </span>
                      </div>
                      <div className="flex w-full">
                        {journey?.legs?.map((leg, index) => {
                          const legRatio = calculateLegRatio(
                            leg,
                            totalDuration,
                          );
                          return (
                            <div
                              key={index}
                              className={cn(
                                `my-2 mr-1 flex h-8 flex-auto justify-center rounded-md`,
                                leg.walking
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-slate-400 text-white",
                              )}
                              style={{ minWidth: `${legRatio}%` }}
                            >
                              {!leg.line && leg.walking ? (
                                <div className="flex items-center text-center">
                                  <PersonStanding className="h-6 w-6" />
                                </div>
                              ) : (
                                <p className="m-auto mx-1 text-xs font-bold">
                                  {leg.line?.name}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <span className="font-semiBold text-xs text-muted-foreground">
                          Expect arrival delays of about{" "}
                          <span className="font-bold">
                            {Math.floor(
                              Number((Math.random() * 100).toFixed(1)) / 3,
                            )}{" "}
                          </span>{" "}
                          mins
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="my-auto -mr-4 ml-2 flex h-6 w-6 rounded-full bg-slate-400">
                    <ArrowRightIcon className="m-auto h-4 w-4 font-bold text-slate-50" />
                  </div>
                </AccordionTrigger>
                <div className="mb-4 rounded-lg bg-slate-200">
                  <AccordionContent className="w-full rounded-md py-4">
                    {journey?.legs?.map((leg, index) => {
                      const nextLeg = journey?.legs[index + 1];
                      const waitTime = calculateWaitTime(
                        leg.arrival,
                        nextLeg?.departure ?? "",
                      );
                      return (
                        <>
                          <div
                            className="flex w-full gap-1 bg-slate-100 pl-8"
                            key={index}
                          >
                            {/* Timeline dot and line */}
                            <div className="mr-4 flex flex-col items-center gap-0">
                              {/* <div className="h-3 w-3 rounded-full bg-slate-500"></div> */}
                              <div
                                className="w-0.5 bg-gray-300"
                                style={{ height: "100%" }}
                              ></div>
                              {/* {index === journey?.legs?.length - 1 && (
                                <div>
                                  <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                                </div>
                              )} */}
                            </div>
                            {/* Content */}
                            <div className="my-2">
                              <div>
                                <p className="text-lg font-semibold text-gray-800">
                                  {leg.origin.name}
                                </p>
                                <span className="font-semibold">
                                  {format(
                                    parseISO(leg.plannedDeparture),
                                    "HH:mm",
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    parseISO(leg.plannedArrival),
                                    "HH:mm",
                                  )}{" "}
                                </span>
                                {leg.arrivalDelay || leg.departureDelay ? (
                                  <span className="font-semibold text-red-500">
                                    ({format(parseISO(leg.departure), "HH:mm")}{" "}
                                    - {format(parseISO(leg.arrival), "HH:mm")})
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center font-semibold ">
                                {leg?.line && (
                                  <span className="my-1 flex">
                                    <TrainFrontIcon className="mr-1 h-4 w-4" />
                                    <span className="text-xs">
                                      {leg?.line?.name}
                                    </span>
                                  </span>
                                )}
                              </div>
                              <span className="my-1 flex">
                                <ClockIcon className="mr-1 h-4 w-4" />
                                <span className="text-xs">
                                  {formatTripDuration(
                                    leg.departure,
                                    leg.arrival,
                                  )}
                                </span>
                              </span>
                              <div className="mt-2">
                                {!leg?.line && leg.walking && (
                                  <div className="flex items-center text-center">
                                    <PersonStanding className="h-6 w-6" />
                                  </div>
                                )}
                                {index === journey?.legs?.length - 1 && (
                                  <p className="text-lg font-semibold text-gray-800">
                                    {leg.destination.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {waitTime && (
                            <div className="flex gap-1 pl-8" key={index}>
                              {/* Timeline dot and line */}
                              <div className="mr-4 flex flex-col items-center">
                                {/* <div className="h-3 w-3 rounded-full bg-slate-500"></div> */}
                                <div
                                  className="w-0.5 border-l-2 border-dashed border-slate-500 bg-transparent"
                                  style={{ height: "100%" }}
                                ></div>
                              </div>
                              <div className="bg-slate-10 flex h-24 w-full flex-col justify-center">
                                Transfer — Wait Time {waitTime} mins
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
        <Button onClick={() => reset()}>Reset</Button>
      </CardContent>

      {/* <div className="">{journey?.journeys && JSON.stringify(journey)}</div> */}
    </Card>
  );
}
