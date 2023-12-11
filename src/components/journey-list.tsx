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
import {
  ArrowRightIcon,
  ClockIcon,
  DotFilledIcon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import {
  format,
  parseISO,
  differenceInMinutes,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import { PersonStanding, TrainFrontIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Journey, JourneyResponse } from "~/types/types";

export default function JourneyList() {
  const { journey, setJourney, reset } = useJourneyStore();

  const convertSecondsToDuration = (seconds: number) => {
    // Convert seconds to a duration object
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    // Format the duration as a string "x minutes y seconds"
    return formatDuration(duration);
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
    <Card className="mx-auto w-full max-w-2xl py-4">
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
                        {/* <span className="text-sm">{format(parseISO(firstLeg.departure), 'p')} - {format(parseISO(lastLeg.arrival), 'p')} | {journeyDuration} | Transfers: {journey.legs.length}</span> */}
                        <span className="text-sm font-medium text-muted-foreground">
                          {format(parseISO(firstLeg.departure), "HH:mm")} -{" "}
                          {format(parseISO(firstLeg.arrival), "HH:mm")} |{" "}
                          {journeyDuration}
                          {/* {journey.legs.length - 1} Transfer
                        {journey.legs.length - 1 > 1 ? "s" : ""} */}
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
                                  {/* {legRatio} */}
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
                  {journey?.legs?.map((leg, index) => (
                    <AccordionContent
                      className="ml-8 mt-4 w-3/4 rounded-md"
                      key={index}
                    >
                      <div className="grid grid-cols-12">
                        <div className="col-span-1">
                          <DotFilledIcon className="h-4 w-4 text-muted-foreground" />
                          {Array(
                            Math.floor(
                              Math.min(
                                Math.max(
                                  calculateLegRatio(leg, totalDuration),
                                  1,
                                ),
                                10,
                              ),
                            ),
                          ).fill(
                            <DotsVerticalIcon className="h-4 w-4 text-muted-foreground" />,
                          )}
                          {index === journey?.legs?.length - 1 && (
                            <DotFilledIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="col-span-11">
                          <div className="flex h-full flex-col justify-between">
                            <div>
                              <p>{leg.origin.name}</p>
                              <span className="font-semibold">
                                {format(
                                  parseISO(leg.plannedDeparture),
                                  "HH:mm",
                                )}{" "}
                                -{" "}
                                {format(parseISO(leg.plannedArrival), "HH:mm")}{" "}
                              </span>
                              {(leg.arrivalDelay || leg.departureDelay) ? (
                                <span className="font-semibold text-red-500">
                                  ({format(parseISO(leg.departure), "HH:mm")} -{" "}
                                  {format(parseISO(leg.arrival), "HH:mm")})
                                </span>
                              ) : null}
                            </div>
                            <div>
                              {leg?.line && (
                                <span className="my-1 flex">
                                  <TrainFrontIcon className="mr-1 h-4 w-4" />
                                  <span className="text-xs">
                                    {leg?.line?.name}
                                  </span>
                                </span>
                              )}
                              <span className="my-1 flex">
                                <ClockIcon className="mr-1 h-4 w-4" />
                                <span className="text-xs">
                                  {formatTripDuration(
                                    leg.departure,
                                    leg.arrival,
                                  )}
                                </span>
                              </span>
                              {!leg?.line && leg.walking && (
                                <div className="flex items-center text-center">
                                  <PersonStanding className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            {index === journey?.legs?.length - 1 && (
                              <div>{leg.destination.name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  ))}
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
