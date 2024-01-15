"use client";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { JSX, SVGProps, useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { useDelayStore, useJourneyStore, useStore } from "~/store/useStore";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import useDebounce from "~/hooks/useDebounce";
import { SearchDropdown } from "./ui/search-dropdown";
import { JourneyResponse, Stop } from "~/types/types";
import { Spinner } from "./ui/spinner";

export default function TripSelection() {
  const [departureQuery, setDeparture] = useState("");
  const [arrivalQuery, setArrival] = useState("");

  const debouncedDeparture = useDebounce(departureQuery, 300);
  const debouncedArrival = useDebounce(arrivalQuery, 300);

  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showArrivalResults, setShowArrivalResults] = useState(false);

  const {
    from,
    to,
    date,
    time,
    now,
    setFrom,
    setTo,
    setDate,
    setTime,
    setNow,
  } = useStore();

  const {journey, reset, setJourney} = useJourneyStore();
  const {delays, setDelays} = useDelayStore();

  const {
    mutate: getJourneyDelays,
    isLoading: isDelayLoading,
    isError: isDelayError,
    error: delayError,
  } = api.delayStorage.getJourneyDelayPerTrip.useMutation({
    onSuccess: (data) => {
      console.log("delay data", data);
      console.log("delays", delays);
      setDelays(data);
    },
  });
  const {
    mutate: searchJourneys,
    isLoading: isJourneyLoading,
    isError: isDepartureError,
    error: JourneyError,
  } = api.journey.searchJourney.useMutation({
    onSuccess: (data: JourneyResponse) => {
      reset();
      setJourney(data);
      data?.journeys.forEach((journey) => {
        journey.legs.forEach((leg) => {
          const origin = leg.origin.id;
          const destination = leg.destination.id;
          const trainType = leg.line.product
          getJourneyDelays({ origin, destination, trainType });
        });
      });
    }});

  const {
    data: DepartureQueryResults,
    mutate: queryDepartures,
    isLoading: isDepartureQueryLoading,
    isError: isDepartureQueryError,
    error: departureQueryError,
  } = api.trip.getStation.useMutation();

  const {
    data: ArrivalQueryResults,
    mutate: queryArrivals,
    isLoading: isArrivalQueryLoading,
    isError: isArrivalQueryError,
    error: arrivalQueryError,
  } = api.trip.getStation.useMutation();

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeparture(e.target.value);
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArrival(e.target.value);
  };

  useEffect(() => {
    if (departureQuery) {
      console.log("departureQuery", departureQuery);
      if (departureQuery !== from.name) {
        queryDepartures({ query: departureQuery });
        setShowDepartureResults(true);
      }
    }
  }, [debouncedDeparture]);

  useEffect(() => {
    if (arrivalQuery) {
      console.log("arrivalQuery", arrivalQuery);
      if (arrivalQuery !== to.name) {
        queryArrivals({ query: arrivalQuery });
        setShowArrivalResults(true);
      }
    }
  }, [debouncedArrival]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Trip Selection</CardTitle>
        <CardDescription>Enter your trip details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative space-y-2">
          <Label className="flex justify-start" htmlFor="from">
            <MapPinIcon className="mr-1 h-4 w-4 -translate-x-1" />
            <span>{`From ${from.name ? from.name + " -" : ""} ${
              from.id ? from.id : ""
            }`}</span>
          </Label>
          <Input
            id="from"
            value={departureQuery}
            onChange={handleDepartureChange}
            onClick={() => {
              if (from) {
                setDeparture("");
              }
              DepartureQueryResults && setShowDepartureResults(true);
            }
            }
            placeholder="Enter departure location"
          />
          <SearchDropdown
            showResults={showDepartureResults}
            setSearchVisibility={setShowDepartureResults}
            errorMessage={departureQueryError?.message}
            isError={isDepartureQueryError}
            isLoading={isDepartureQueryLoading}
            searchResults={DepartureQueryResults}
            onResultSelect={(result: Stop) => {
              setFrom(result);
              setDeparture(result.name);
              setShowDepartureResults(false);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex justify-start" htmlFor="to">
            <MapPinIcon className="mr-1 h-4 w-4 -translate-x-1" />
            <span>{`To ${to.name ? to.name + " -" : ""} ${
              to.id ? to.id : ""
            }`}</span>
          </Label>
          <Input
            id="to"
            value={arrivalQuery}
            onChange={handleArrivalChange}
            onClick={() => {
              if (to) {
                setArrival("");
              }
              ArrivalQueryResults && setShowArrivalResults(true)
            }}
            placeholder="Enter destination location"
          />
          <SearchDropdown
            showResults={showArrivalResults}
            setSearchVisibility={setShowArrivalResults}
            errorMessage={arrivalQueryError?.message}
            isError={isArrivalQueryError}
            isLoading={isArrivalQueryLoading}
            searchResults={ArrivalQueryResults}
            onResultSelect={(result: Stop) => {
              setTo(result);
              setArrival(result.name);
              setShowArrivalResults(false);
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              className={now ? "text-muted-foreground" : ""}
              htmlFor="departure-date"
            >
              Departure Date
            </Label>
            <Popover>
              <PopoverTrigger disabled={now} asChild>
                <Button
                  className="w-full justify-start text-left font-normal"
                  variant="outline"
                >
                  <CalendarDaysIcon className="mr-1 h-4 w-4 -translate-x-1" />
                  {date ? format(date, "PPP") : <span>Select Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  id="departure-date"
                  mode="single"
                  selected={date}
                  onSelect={(date: Date | undefined) =>
                    setDate(date ?? new Date())
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="now-date">Now: </Label>
            <div className="flex w-auto items-center">
              <Switch
                id="now-date"
                checked={now}
                onCheckedChange={() => setNow(!now)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
        disabled={isJourneyLoading || from.id === to.id || !from.id || !to.id}
          onClick={() =>
            searchJourneys({
              from: from.id,
              to: to.id,
              date: date,
              now: now,
            })
          }
          className="w-full"
          type="submit"
        >
          Search
          {isJourneyLoading && <Spinner className="ml-2 text-white" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CalendarDaysIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

function MapPinIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
