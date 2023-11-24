interface Journey {
    _id: string;
    depId: string;
    depName: string;
    depLatitude: number;
    depLongitude: number;
    arrId: string;
    arrName: string;
    arrLatitude: number;
    arrLongitude: number;
    avgDelay: number;
  }
  
  export default Journey;
  