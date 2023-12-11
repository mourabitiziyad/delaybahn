import { Prisma, Trip } from "@prisma/client";

export async function GET() {
  try {
    const res = await fetch("http://localhost:3000/api/trpc/station.getAllStation");
    const data = await res.json();
    const jsonArray = data.result.data.json;
    const currentTime = new Date();
    const fifteenMinLater = new Date(currentTime.getTime() + 15 * 60 * 1000);
    const timeFrame = fifteenMinLater.toISOString();

    for (const station of jsonArray) {
      try {
        const url = `https://v6.db.transport.rest/stops/${station.id}/arrivals?when=${timeFrame}`;
        console.log(url);

        const response = await fetch(url);
        const resdata = await response.json();
        console.log(resdata);

        if (!response.ok) {
          console.log(response.headers)
          console.log(response.status)
          console.error(`Failed to fetch data from ${url}. Status: ${response.status}`);
          continue; // Skip to the next iteration in case of fetch failure
        }

        const arrivalsData = await response.json();
        const arrivals = arrivalsData.arrivals;

  //      for (const arrival of arrivals) {
  //        const trip = mapArrivalToTrip(arrival);
  //        console.log("Trip: " + trip);
        }
      catch (error) {
        console.error(`Error during fetch: ${error}`);
        // Handle the error as needed
      }
    }

    return Response.json(jsonArray);
  } catch (error) {
    console.error(`Error fetching station data: ${error}`);
    // Handle the error as needed
    return Response.error;
  }
}


function mapArrivalToTrip(response: Arrival): Trip {
  return { 
    id: response.tripId,
    depId: response.stop.id,
    depName: response.stop.name,
    depLatitude: response.stop.location.latitude,
    depLongitude: response.stop.location.longitude,
    depDelay: response.delay,
    arrId: response.stop.id, 
    trainId: response.line.id,
    trainName: response.line.name,
    arrName: response.provenance,
    arrLatitude: 0, 
    arrLongitude: 0, 
    arrDelay: response.delay, 
    tripDate: new Date(response.when),
    createdAt: new Date(),
    updatedAt: new Date(),

  };
}



interface Arrival {
  tripId: string;
  stop: {
    id: string;
    name: string;
    location: {
      id: string;
      latitude: number;
      longitude: number;
    };
    products: {
      nationalExpress: boolean;
      national: boolean;
      regionalExpress: boolean;
      regional: boolean;
      suburban: boolean;
      bus: boolean;
      ferry: boolean;
      subway: boolean;
      tram: boolean;
      taxi: boolean;
    };
  };
  when: string;
  plannedWhen: string;
  delay: number;
  platform: string;
  plannedPlatform: string;
  prognosisType: string;
  direction: null | string;
  provenance: string;
  line: {
    id: string;
    fahrtNr: string;
    name: string;
    public: boolean;
    adminCode: string;
    productName: string;
    mode: string;
    product: string;
    operator: {
      id: string;
      name: string;
    };
    additionalName: string;
  };
  remarks: any[]; // Adjust the type based on your actual data
  origin: null | string;
  destination: null | string;
}