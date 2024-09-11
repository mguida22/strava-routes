const NAME_BY_SPORT: Record<string, string> = {
  AlpineSki: "Alpine Ski",
  BackcountrySki: "Backcountry Ski",
  Canoeing: "Canoeing",
  Crossfit: "Crossfit",
  EBikeRide: "E-Bike Ride",
  Elliptical: "Elliptical",
  GravelRide: "Gravel Ride",
  Hike: "Hiking",
  IceSkate: "Ice Skate",
  InlineSkate: "Inline Skate",
  Kayaking: "Kayaking",
  Kitesurf: "Kitesurf",
  MountainBikeRide: "Mountain Bike Ride",
  NordicSki: "Nordic Ski",
  Pickleball: "Pickleball",
  Ride: "Cycling",
  RockClimbing: "Rock Climbing",
  RollerSki: "Roller Ski",
  Rowing: "Rowing",
  Run: "Running",
  Sail: "Sailing",
  Snowboard: "Snowboard",
  Snowshoe: "Snowshoe",
  StairStepper: "Stair Stepper",
  StandUpPaddling: "Stand Up Paddling",
  Surfing: "Surfing",
  Swim: "Swimming",
  TrailRun: "Trail Run",
  Velomobile: "Velomobile",
  VirtualRide: "Virtual Ride",
  VirtualRun: "Virtual Run",
  Walk: "Walking",
  WeightTraining: "Weight Training",
  Wheelchair: "Wheelchair",
  Windsurf: "Windsurf",
  Workout: "Workout",
  Yoga: "Yoga",
};

export default function getNameForSport(sport: string) {
  const name = NAME_BY_SPORT[sport];

  if (name == null) {
    console.warn(sport);
    return sport;
  }

  return name;
}
