export type AppRoute = {
  display: string;
  route: string;
};

export const navigationRoutes: AppRoute[] = [
  {
    display: "Discover",
    route: "/",
  },
  {
    display: "Top 500",
    route: "/top500",
  },
];
