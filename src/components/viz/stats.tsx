"use client";
import React, { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { formatPeriod } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LineChart } from "@tremor/react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import StatsBar from "./bar-list";

export default function Stats() {
  const {
    data: trainData,
    isLoading,
    isError,
    error,
  } = api.delayStorage.getJourneyDelays.useQuery();
  const {
    data: tripData,
    isLoading: isTripDelayLoading,
    isError: isTripDelayError,
    error: TripDelayError,
    mutate: fetchTripDelays,
  } = api.delayStorage.getAdvancedDelaysPerTrip.useMutation();

  const [selectedDeparture, setSelectedDeparture] = useState({
    name: "",
    id: "",
  });
  const [selectedArrival, setSelectedArrival] = useState({ name: "", id: "" });
  const [selectedTrainType, setSelectedTrainType] = useState("");

  // Extract unique departures for the first dropdown, including both name and ID
  const departures = useMemo(() => {
    const departureSet = new Set(
      trainData?.map((journey) =>
        JSON.stringify({ name: journey.depName, id: journey.depId }),
      ) ?? [],
    );
    const departuresArray = Array.from(departureSet).map((jsonStr) =>
      JSON.parse(jsonStr),
    );

    // Sorting the departures array by name in ascending order
    // departuresArray.sort((a, b) => a.name.localeCompare(b.name));

    return departuresArray;
  }, [trainData]);

  // Filter arrivals based on selected departure
  const arrivals = useMemo(() => {
    if (!selectedDeparture.id) return [];
    const filteredArrivals =
      trainData
        ?.filter((journey) => journey.depId === selectedDeparture.id)
        .map((journey) => ({ name: journey.arrName, id: journey.arrId })) || [];
    const arrivalSet = new Set(
      filteredArrivals.map((arrival) => JSON.stringify(arrival)),
    );
    const arrivalsArray = Array.from(arrivalSet).map((jsonStr) =>
      JSON.parse(jsonStr),
    );

    // Sorting the arrivals array by name in ascending order
    arrivalsArray.sort((a, b) => a.name.localeCompare(b.name));

    return arrivalsArray;
  }, [selectedDeparture, trainData]);

  // Filter train types based on selected departure and arrival
  const trainTypes = useMemo(() => {
    if (!selectedDeparture.id || !selectedArrival.id) return [];
    const filteredTrainTypes =
      trainData
        ?.filter(
          (journey) =>
            journey.depId === selectedDeparture.id &&
            journey.arrId === selectedArrival.id,
        )
        .map((journey) => journey.trainType) || [];
    return Array.from(new Set(filteredTrainTypes));
  }, [selectedDeparture, selectedArrival, trainData]);

  // Handle changes
  const handleDepartureChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    // Use optional chaining with ?. and provide a default value with ?? in case anything is undefined
    const selectedIndex = event.target.selectedIndex;
    const selectedOptionAttribute =
      event.target.options[selectedIndex]?.getAttribute("data-key") ?? "{}";
    const selectedOption = JSON.parse(selectedOptionAttribute);
    setSelectedDeparture(selectedOption);
    setSelectedArrival({ name: "", id: "" }); // Reset arrival on departure change
  };

  const handleArrivalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.selectedIndex;
    const selectedOptionAttribute =
      event.target.options[selectedIndex]?.getAttribute("data-key") ?? "{}";
    const selectedOption = JSON.parse(selectedOptionAttribute);
    setSelectedArrival(selectedOption);
  };

  const selectedBarListData = useMemo(() => {
    if (!selectedDeparture.id) return [];
    const filteredData =
      trainData?.filter((journey) => journey.depId === selectedDeparture.id) ||
      [];

    // Sort data by number of trips in descending order
    const sortedDatabyCount = filteredData.toSorted(
      (a, b) => (b.numOfTrips || 0) - (a.numOfTrips || 0),
    );

    const sortedDatabyDelays = filteredData.toSorted(
      (a, b) => (b.avgDelay || 0) - (a.avgDelay || 0),
    );

    // Map data to "name" and "value"
    const mappedDatabyTrips = sortedDatabyCount.map((journey) => ({
      name: `${journey.arrName} — ${journey.trainType}`,
      value: journey.numOfTrips,
    }));

    const mappedDatabyDelays = sortedDatabyDelays.map((journey) => ({
      name: `${journey.arrName} — ${journey.trainType}`,
      value: journey.avgDelay,
    }));

    return [mappedDatabyTrips, mappedDatabyDelays];
  }, [selectedDeparture]);

  const selectedJourney = useMemo(() => {
    if (!selectedDeparture.id || !selectedArrival.id || !selectedTrainType)
      return null;
    return trainData?.find(
      (journey) =>
        journey.depId === selectedDeparture.id &&
        journey.arrId === selectedArrival.id &&
        journey.trainType === selectedTrainType,
    );
  }, [selectedDeparture, selectedArrival, selectedTrainType, trainData]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const chartData =
    tripData &&
    tripData.map((journey) => ({
      date: new Date(journey.depDate).toLocaleDateString(),
      // time: new Date(journey.depDate).getTime(),
      delay: journey.depDelay,
      cancelled: journey.cancelled && -100,
    }));

  return (
    <div className="container mb-4 mt-4">
      <div className="flex flex-wrap justify-center gap-4">
        <div>
          <label htmlFor="departure" className="m-2">
            Departure
          </label>
          <select
            id="departure"
            value={selectedDeparture.id}
            onChange={handleDepartureChange}
          >
            <option value="">Select a departure</option>
            {departures.map((departure, index) => (
              <option
                key={index}
                value={departure.id}
                data-key={JSON.stringify(departure)}
              >
                {departure.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="arrival" className="m-2">
            Arrival:
          </label>
          <select
            id="arrival"
            value={selectedArrival.id}
            onChange={handleArrivalChange}
            disabled={!selectedDeparture.id}
          >
            <option value="">Select an arrival</option>
            {arrivals.map((arrival, index) => (
              <option
                key={index}
                value={arrival.id}
                data-key={JSON.stringify(arrival)}
              >
                {arrival.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="traintype" className="m-2">
            Train Type:
          </label>
          <select
            id="traintype"
            value={selectedTrainType}
            onChange={(e) => setSelectedTrainType(e.target.value)}
            disabled={!selectedArrival.id}
          >
            <option value="">Select a train type</option>
            {trainTypes.map((trainType, index) => (
              <option key={index} value={trainType}>
                {trainType}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={
            !selectedJourney?.trainType ||
            !selectedJourney?.depId ||
            !selectedJourney?.arrId
          }
          className="my-auto"
          onClick={() =>
            fetchTripDelays({
              trainType: selectedJourney?.trainType ?? "",
              depId: selectedJourney?.depId ?? "",
              arrId: selectedJourney?.arrId ?? "",
            })
          }
        >
          Display Delay Metrics
        </Button>
        <div className="w-full">
          <div className="my-2 grid grid-cols-4 gap-2">
            <Card className="text-center">
              <CardTitle className="p-2">Number of Trips</CardTitle>
              <p className="pb-2 text-xl">{selectedJourney?.numOfTrips}</p>
            </Card>
            <Card className="text-center">
              <CardTitle className="p-2">Average Delay</CardTitle>
              <p className="pb-2 text-xl">
                {typeof selectedJourney?.avgDelay === "number"
                  ? selectedJourney.avgDelay > 0
                    ? formatPeriod(selectedJourney.avgDelay)
                    : "0 minutes" // This handles the case where maxDelay is exactly 0
                  : "-"}
              </p>
            </Card>
            <Card className="text-center">
              <CardTitle className="p-2">Number of Cancellations</CardTitle>
              <p className="pb-2 text-xl">
                {selectedJourney?.numOfCancellations}
              </p>
            </Card>
            <Card className="text-center">
              <CardTitle className="p-2">Worst Delay</CardTitle>
              <p className="pb-2 text-xl">
                {typeof selectedJourney?.maxDelay === "number"
                  ? selectedJourney.maxDelay > 0
                    ? formatPeriod(selectedJourney.maxDelay)
                    : "0 minutes" // This handles the case where maxDelay is exactly 0
                  : "-"}
              </p>
            </Card>
          </div>
          <Card className="w-full">
            <CardTitle className="p-4">
              Trip Delay Progression with time
            </CardTitle>
            <CardContent>
              <LineChart
                className="mt-6 min-w-full"
                data={chartData || []}
                index="date"
                autoFocus
                noDataText="Please Select Data from the Dropdowns Above"
                showTooltip
                showYAxis
                connectNulls
                showXAxis
                categories={["delay", "cancelled"]}
                colors={["blue", "red"]}
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Card className="mt-2 w-full">
              <StatsBar
                data={selectedBarListData[0]}
                Label="Number of Trips"
                Color={null}
              />
            </Card>
            <Card className="mt-2 w-full">
              <StatsBar
                data={selectedBarListData[1]}
                Label="Average Delays"
                Color="red"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
