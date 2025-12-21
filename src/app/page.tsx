import { LocationsList } from "@/components/locations-list";
import { WorkoutView } from "@/components/workout-view";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <main className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
            Flexi
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered workout generator customized to your gym.
          </p>
        </header>

        <LocationsList />

        <WorkoutView />
      </main>
    </div>
  );
}
