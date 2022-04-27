import NO_POSTER_IMAGE from "../../assets/placeholder.png";
import { FetchMoviesOptions } from "./types/FetchMoviesOptions";
import { Movie } from "./types/Movie";
import { MoviesResponseItem } from "./types/MoviesResponseItem";
import { objectToSearchParams } from "./utils/objectToSearchParams";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_LINK = process.env.REACT_APP_API_LINK;

type MoviePage = {
  pages: number;
  movies: Movie[];
};

export async function fetchMoviesRequest({
  page,
  sort_by,
  endpoint,
}: FetchMoviesOptions): Promise<MoviePage> {
  try {
    const urlSearchParams = objectToSearchParams({
      page,
      sort_by,
      api_key: API_KEY,
    });

    const response = await fetch(`${API_LINK}${endpoint}?${urlSearchParams}`);
    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Failed to load movies, because of [${response.status}] ${data.status_code} ${data.status_message}`
      );
    }

    return {
      pages: data.total_pages,
      movies: data.results.map((item: MoviesResponseItem) => ({
        id: item.id,
        image: item.poster_path
          ? `https://image.tmdb.org/t/p/w300/${item.poster_path}`
          : NO_POSTER_IMAGE,
        title: item.title,
        overview: item.overview,
        rating: item.vote_average,
        year: item.release_date.substr(0, 4),
      })),
    };
  } catch (error) {
    throw new Error(`Failed to load movies, unexpected error`);
  }
}
