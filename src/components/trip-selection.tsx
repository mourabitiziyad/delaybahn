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
import { Stop } from "~/types/types";
import { Spinner } from "./ui/spinner";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Settings2Icon } from "lucide-react";
import { Journeys, Station } from "hafas-client";

export default function TripSelection() {
  const [departureQuery, setDeparture] = useState("");
  const [arrivalQuery, setArrival] = useState("");

  const debouncedDeparture = useDebounce(departureQuery, 300);
  const debouncedArrival = useDebounce(arrivalQuery, 300);

  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showArrivalResults, setShowArrivalResults] = useState(false);

  const [transportOption, setTransportOption] = useState("all");

  const {
    from,
    to,
    date,
    time,
    now,
    transportTypes,
    setTransportTypes,
    setFrom,
    setTo,
    setDate,
    setTime,
    setNow,
  } = useStore();

  const { reset, setJourney } = useJourneyStore();
  const { setDelays } = useDelayStore();

  const { mutate: getJourneyDelays } =
    api.delayStorage.getJourneyDelayPerTrip.useMutation({
      onSuccess: (data) => {
        setDelays(data);
      },
    });
  const { mutate: searchJourneys, isLoading: isJourneyLoading } =
    api.journey.searchJourney.useMutation({
      onSuccess: (data: Journeys) => {
        reset();
        setJourney(data);
        data.journeys?.forEach((journey) => {
          journey.legs.forEach((leg) => {
            const origin = leg.origin?.id ?? "";
            const destination = leg.destination?.id ?? "";
            const trainType = leg.line?.product ?? "";
            getJourneyDelays({ origin, destination, trainType });
          });
        });
      },
    });

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
      if (departureQuery !== from.name) {
        queryDepartures({ query: departureQuery });
        setShowDepartureResults(true);
      }
    }
  }, [debouncedDeparture]);

  useEffect(() => {
    if (arrivalQuery) {
      if (arrivalQuery !== to.name) {
        queryArrivals({ query: arrivalQuery });
        setShowArrivalResults(true);
      }
    }
  }, [debouncedArrival]);

  const [radioSelection, setRadioSelection] = useState("all"); // State to track radio selection

  // Update radio selection based on transportTypes
  useEffect(() => {
    // Determine the radio selection based on transportTypes state
    const isLocal =
      transportTypes.regional &&
      transportTypes.suburban &&
      transportTypes.bus &&
      transportTypes.ferry &&
      transportTypes.subway &&
      transportTypes.tram &&
      transportTypes.taxi &&
      !transportTypes.nationalExpress &&
      !transportTypes.national &&
      !transportTypes.regionalExpress;
    const isLongDistance =
      transportTypes.nationalExpress &&
      transportTypes.national &&
      transportTypes.regionalExpress &&
      !transportTypes.regional &&
      !transportTypes.suburban &&
      !transportTypes.bus &&
      !transportTypes.ferry &&
      !transportTypes.subway &&
      !transportTypes.tram &&
      !transportTypes.taxi;
    const isAll =
      transportTypes.nationalExpress &&
      transportTypes.national &&
      transportTypes.regionalExpress &&
      transportTypes.regional &&
      transportTypes.suburban &&
      transportTypes.bus &&
      transportTypes.ferry &&
      transportTypes.subway &&
      transportTypes.tram &&
      transportTypes.taxi;

    if (isLocal) {
      setRadioSelection("local");
    } else if (isLongDistance) {
      setRadioSelection("long");
    } else if (isAll) {
      setRadioSelection("all"); // Default or mixed selection
    } else {
      setRadioSelection(""); // Default or mixed selection
    }
  }, [transportTypes]); // Depend on transportTypes state

  const handleSwitchChange = (key: keyof typeof transportTypes) => {
    // Update the specific transportType based on its current state
    const updatedTransportTypes = {
      ...transportTypes,
      [key]: !transportTypes[key],
    };
    setTransportTypes(updatedTransportTypes);
  };

  const combineDateTime = (selectedDate: Date, selectedTime: string): Date => {
    const timeParts = selectedTime.split(":").map(Number);
    const hours = timeParts[0] ?? 0; // Default to 0 if undefined
    const minutes = timeParts[1] ?? 0; // Default to 0 if undefined

    selectedDate.setHours(hours, minutes);
    return selectedDate;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return; // Early return if no date is selected

    const newDate = time
      ? combineDateTime(new Date(selectedDate), time)
      : new Date(selectedDate);
    setDate(newDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setTime(newTime);

    if (date) {
      const updatedDate = combineDateTime(new Date(date), newTime);
      setDate(updatedDate);
    }
  };

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
            }}
            placeholder="Enter departure location"
          />
          <SearchDropdown
            showResults={showDepartureResults}
            setSearchVisibility={setShowDepartureResults}
            errorMessage={JSON.stringify(departureQueryError)}
            isError={isDepartureQueryError}
            isLoading={isDepartureQueryLoading}
            searchResults={DepartureQueryResults as Stop[]}
            onResultSelect={(result: Stop | Station) => {
              setFrom(result as Stop);
              setDeparture(result.name ?? "");
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
              ArrivalQueryResults && setShowArrivalResults(true);
            }}
            placeholder="Enter destination location"
          />
          <SearchDropdown
            showResults={showArrivalResults}
            setSearchVisibility={setShowArrivalResults}
            errorMessage={JSON.stringify(arrivalQueryError)}
            isError={isArrivalQueryError}
            isLoading={isArrivalQueryLoading}
            searchResults={ArrivalQueryResults as Stop[]}
            onResultSelect={(result: Stop) => {
              setTo(result);
              setArrival(result.name);
              setShowArrivalResults(false);
            }}
          />
        </div>
        <div className="grid grid-cols-12 gap-1">
          <div className="col-span-3 space-y-2 p-2">
            <Label className="block" htmlFor="transport-mode">
              Transport Mode
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="w-full justify-start text-left font-normal"
                  variant="outline"
                >
                  <Settings2Icon className="mr-1 h-4 w-4 -translate-x-1" />
                  Options
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-2">
                <RadioGroup
                  id="transport-mode"
                  value={radioSelection}
                  defaultValue={transportOption}
                  onValueChange={(value: string) => {
                    setTransportOption(value); // Update local state for conditional rendering
                    switch (value) {
                      case "local":
                        // Enable all except nationalExpress, national, and regionalExpress
                        setTransportTypes({
                          nationalExpress: false,
                          national: false,
                          regionalExpress: false,
                          regional: true,
                          suburban: true,
                          bus: true,
                          ferry: true,
                          subway: true,
                          tram: true,
                          taxi: true,
                        });
                        break;
                      case "long":
                        // Enable only nationalExpress, national, and regionalExpress
                        setTransportTypes({
                          nationalExpress: true,
                          national: true,
                          regionalExpress: true,
                          regional: false,
                          suburban: false,
                          bus: false,
                          ferry: false,
                          subway: false,
                          tram: false,
                          taxi: false,
                        });
                        break;
                      case "all":
                        // Enable all
                        setTransportTypes({
                          nationalExpress: true,
                          national: true,
                          regionalExpress: true,
                          regional: true,
                          suburban: true,
                          bus: true,
                          ferry: true,
                          subway: true,
                          tram: true,
                          taxi: true,
                        });
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  <Label className="inline-flex w-full gap-2 p-1">
                    <RadioGroupItem value="local" id="r1" />
                    Local/regional transport only
                  </Label>
                  <Label className="inline-flex w-full gap-2 p-1">
                    <RadioGroupItem value="long" id="r2" />
                    Long-distance travel only
                  </Label>
                  <Label className="inline-flex w-full gap-2 p-1">
                    <RadioGroupItem value="all" id="r2" />
                    All
                  </Label>
                </RadioGroup>

                <div className="p-2">
                  <Separator />
                </div>

                <ScrollArea className="h-60">
                  {[
                    {
                      imageSrc: "/highspeed.png",
                      label: "InterCityExpress (ICE)",
                      key: "nationalExpress",
                    },
                    {
                      imageSrc: "/intercity.png",
                      label: "InterCity & EuroCity (IC/EC)",
                      key: "national",
                    },
                    {
                      imageSrc: "/interregio.png",
                      label: "InterRegio & Fast Trains (RE/IR)",
                      key: "regionalExpress",
                    },
                    {
                      imageSrc: "/regional.png",
                      label: "Regional & Other Trains",
                      key: "regional",
                    },
                    {
                      imageSrc: "/sbahn.png",
                      label: "Suburban",
                      key: "suburban",
                    },
                    { imageSrc: "/bus.png", label: "Bus", key: "bus" },
                    { imageSrc: "/ferry.png", label: "Ferry", key: "ferry" },
                    {
                      imageSrc: "/ubahn.png",
                      label: "Underground",
                      key: "subway",
                    },
                    { imageSrc: "/tram.png", label: "Tram", key: "tram" },
                    {
                      imageSrc: "/taxi.png",
                      label: "Services requiring tel. registration",
                      key: "taxi",
                    },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between gap-2 p-2">
                        <div>
                          <div className="space-x-2">
                            <Image
                              className="inline-flex h-6 w-6 rounded-sm"
                              width={100}
                              height={100}
                              src={item.imageSrc}
                              alt=""
                            />
                            <Label>{item.label}</Label>
                          </div>
                        </div>
                        <Switch
                          id={item.key}
                          checked={
                            transportTypes[
                              item.key as keyof typeof transportTypes
                            ]
                          }
                          onCheckedChange={() =>
                            handleSwitchChange(
                              item.key as keyof typeof transportTypes,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-8 space-y-1">
            <Label
              className={now ? "text-muted-foreground" : ""}
              htmlFor="departure-date"
            >
              Departure Date
            </Label>
            <div className="flex">
              <Popover>
                <PopoverTrigger disabled={now} asChild>
                  <Button
                    className="mt-0.5 w-full justify-start text-left font-normal"
                    variant="outline"
                  >
                    <CalendarDaysIcon className="mr-1 h-4 w-4 -translate-x-1" />
                    {date ? format(date, "PPPp") : <span>Select Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    id="departure-date"
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  <input
                    type="time"
                    className="w-full border-t border-gray-200 p-2"
                    value={time}
                    onChange={handleTimeChange}
                  />
                </PopoverContent>
              </Popover>
              <div>
                <div className="ml-2 mt-1.5 flex items-center gap-2">
                  <Label htmlFor="now-date">Now </Label>
                  <Switch
                    id="now-date"
                    checked={now}
                    onCheckedChange={() => setNow(!now)}
                  />
                </div>
              </div>
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
              transportTypes: transportTypes,
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
