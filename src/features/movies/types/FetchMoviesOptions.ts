export type FetchMoviesOptions = {
  page: number;
  endpoint?: "/movie/top_rated" | "/discover/movie";
  sort_by?: string;
  force?: boolean;
};
