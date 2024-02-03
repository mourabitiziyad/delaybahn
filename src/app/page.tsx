import JourneyList from "~/components/journey-list";
import TripSelection from "~/components/trip-selection";

export default async function Home() {

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Plan Your Trip
        </h1>
        <div className="flex flex-1 w-full gap-2">
          <TripSelection />
        </div>
        <JourneyList />
      </div>
    </main>
  );
}
