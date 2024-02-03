"use client";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "~/trpc/react";
import StatsBar from "~/components/viz/bar-list";
import { Button } from "~/components/ui/button";

export default function Page() {
  const {
    data: trainData,
    isLoading,
    isError,
    error,
  } = api.delayStorage.getJourneyDelays.useQuery();

  const [selectedDep, setSelectedDep] = useState<string>("");
  const [selectedArr, setSelectedArr] = useState<string>("");
  const [selectedTrainType, setSelectedTrainType] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>([]);

  // Data structure for UI
  const departures = useMemo(() => {
    const deps = new Map<string, Map<string, Set<string>>>();
    trainData &&
      trainData.forEach(({ depName, arrName, trainType }) => {
        if (depName && !deps.has(depName)) {
          deps.set(depName, new Map());
        }
        const arrs = depName ? deps.get(depName)! : new Map();
        if (!arrs.has(arrName)) {
          arrs.set(arrName, new Set());
        }
        const types = arrs.get(arrName)!;
        types.add(trainType);
      });
    return deps;
  }, []);

  // Effect to reset arrivals and train types when departure changes
  useEffect(() => {
    setSelectedArr("");
    setSelectedTrainType("");
  }, [selectedDep]);

  useEffect(() => {
    console.log("Train data fetched:", trainData);
    // Potentially update a state here if necessary
  }, [trainData]);

  const filteredArrivals = useMemo(() => {
    if (!selectedDep) return [];
    return [...(departures.get(selectedDep)?.keys() ?? [])];
  }, [departures, selectedDep]);

  const filteredTrainTypes = useMemo(() => {
    if (!selectedDep || !selectedArr) return [];
    return [...(departures.get(selectedDep)?.get(selectedArr) ?? [])];
  }, [departures, selectedDep, selectedArr]);

  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const filteredData = (() => {
    return trainData?.filter((item) => {
      const matchesDep = item.depName === selectedDep || !selectedDep;
      const matchesArr = item.arrName === selectedArr || !selectedArr;
      const matchesTrainType =
        item.trainType === selectedTrainType || !selectedTrainType;
      return matchesDep && matchesArr && matchesTrainType;
    }
    );
  })

  // Handlers for dropdown changes
  const handleDepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDep(e.target.value);
  };

  const handleArrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArr(e.target.value);
  };

  const handleTrainTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrainType(e.target.value);
  };

  return (
    <div className="container flex flex-wrap justify-center gap-4">
      {departures && (
        <div className="space-x-2 mt-4">
          <select value={selectedDep} onChange={handleDepChange}>
            <option value="">Select Departure</option>
            {[...departures.keys()].map((depName) => (
              <option key={depName} value={depName}>
                {depName}
              </option>
            ))}
          </select>
          <select
            value={selectedArr}
            onChange={handleArrChange}
            disabled={!selectedDep}
          >
            <option value="">Select Arrival</option>
            {filteredArrivals.map((arrName) => (
              <option key={arrName} value={arrName}>
                {arrName}
              </option>
            ))}
          </select>

          <select
            value={selectedTrainType}
            onChange={handleTrainTypeChange}
            disabled={!selectedArr}
          >
            <option value="">Select Train Type</option>
            {filteredTrainTypes.map((trainType) => (
              <option key={trainType} value={trainType}>
                {trainType}
              </option>
            ))}
          </select>

          <Button onClick={() => setSelectedData(filteredData)} className="">
            Generate
          </Button>
        </div>
      )}

      {selectedData.length > 0 && (
        <StatsBar
          data={selectedData.map((data) => ({
            value: data.avgDelay ?? 0,
            name: data.arrName,
            href: "",
            icon: "",
          }))}
        />
      )}
      <div className="w-full">
        <div>
          <h2>Filtered Data</h2>

          {!filteredData?.length && (
            <p>No data available for the selected criteria.</p>
          )}
        </div>
      </div>

      {/* <Card className="mt-8 w-full max-w-xl">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Some Stats</CardDescription>
        </CardHeader>
        <CardContent className="h-full space-y-4">
          <BarChart
            className="mt-6"
            data={chartdata2}
            index="name"
            categories={[
              "Group A",
              "Group B",
              "Group C",
              "Group D",
              "Group E",
              "Group F",
            ]}
            colors={["blue", "teal", "amber", "rose", "indigo", "emerald"]}
            valueFormatter={valueFormatter}
            yAxisWidth={48}
          />
        </CardContent>
      </Card> */}
    </div>
  );
}
