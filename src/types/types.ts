export interface Stop {
    type: string;
    id: string;
    name: string;
    location: {
        type: string;
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
}

interface Location {
    type: string;
    id: string;
    latitude: number;
    longitude: number;
}

interface Products {
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
}

interface Operator {
    type: string;
    id: string;
    name: string;
}

interface Line {
    type: string;
    id: string;
    fahrtNr: string;
    name: string;
    public: boolean;
    adminCode: string;
    productName: string;
    mode: string;
    product: string;
    operator: Operator;
}

interface Remark {
    text: string;
    type: string;
    code: string;
    summary: string;
}

interface Journey {
    origin: {
        type: string;
        id: string;
        name: string;
        location: Location;
        products: Products;
    };
    destination: {
        type: string;
        id: string;
        name: string;
        location: Location;
        products: Products;
    };
    departure: string;
    plannedDeparture: string;
    departureDelay: number | null;
    arrival: string;
    plannedArrival: string;
    arrivalDelay: number | null;
    reachable: boolean;
    tripId: string;
    line: Line;
    direction: string;
    currentLocation: Location;
    arrivalPlatform: string;
    plannedArrivalPlatform: string;
    arrivalPrognosisType: string | null;
    departurePlatform: string;
    plannedDeparturePlatform: string;
    departurePrognosisType: string | null;
    remarks: Remark[];
    loadFactor: string;
}

export interface JourneyResponse {
    journeys: Journey[];
    refreshToken: string;
    price: {
        amount: number;
        currency: string;
        hint: string | null;
    };
}
