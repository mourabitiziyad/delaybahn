import cron from 'node-cron';
import {postRouter} from './journeys';
import Journey from "../../models/Journey";
import axios from 'axios';

export async function getTodayTrips(){
    try{

        //journeys endpoint
        const url = 'https://v5.db.transport.rest/journeys?';

        //get all journeys recorded in mongodb
        const result = await postRouter.getAllJourneys({
            ctx: undefined,
            rawInput: undefined,
            path: "",
            type: "query"
          })as { journeys: Journey[] };
    
        //match them to the model Journey
        const listOfJourneys: Journey[] = result.journeys;

        let i = 0;
    
        //for each journey record the list of trips of today
        for(const journey of listOfJourneys){

            //add params to url
            const urlWithParams = url + 'from=' + journey.depId + '&to=' + journey.arrId;

            //call hafas api endpoint
            const response = await axios.get(urlWithParams);
            
            
            console.log(response.data);

            i=i+1;

            if(i>10){
                break;
            }

        }

    }
    catch(error){
        console.error("Error launching scheduled task... ");
    }
}



