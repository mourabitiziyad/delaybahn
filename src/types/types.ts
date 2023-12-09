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
