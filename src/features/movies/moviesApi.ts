import { Movie } from "./Movie";

const API_KEY =
  process.env.REACT_APP_API_KEY || "6bb3231322d21c13fa04d396c527b91b";

type MoviesResponseItem = {
  id: string;
  poster_path: string;
  title: string;
  vote_average: string;
  release_date: string;
  overview: string;
};

export async function fetchMoviesRequest(page: number): Promise<Movie[]> {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(
      `Failed to load movies, because of [${response.status}] ${data.status_code} ${data.status_message}`
    );
  }

  return data.results.map((item: MoviesResponseItem) => ({
    id: item.id,
    image: `https://image.tmdb.org/t/p/w300/${item.poster_path}`,
    title: item.title,
    overview: item.overview,
    rating: item.vote_average,
    year: item.release_date.substr(0, 4),
  }));
}
