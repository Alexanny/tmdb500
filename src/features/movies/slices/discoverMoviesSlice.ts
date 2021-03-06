import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityId,
  EntityState,
} from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../../app/store";
import { fetchMoviesRequest } from "../moviesApi";
import { FetchMoviesOptions } from "../types/FetchMoviesOptions";
import { Movie } from "../types/Movie";
import { SortingOrder } from "../types/SortingOrder";
import { SortingValue } from "../types/SortingValue";

export const DISCOVER_MOVIES = "discoverMovies";
export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT_BY = "popularity";
export const DEFAULT_SORT_ORDER = "desc";
const FAVORIES_LOCAL_STORAGE_KEY = "discover_avorites";
const DISCOVER_MOVIES_ENDPOINT = "/discover/movie";

export enum MoviesLoadingStatus {
  IDLE,
  LOADING,
  SUCCEEDED,
  FAILED,
  SORT_CHANGED,
}

type MoviePage = {
  data: EntityState<Movie>;
  status: MoviesLoadingStatus;
  sortBy: SortingValue;
  sortOrder: SortingOrder;
  error: string | null;
};

type MovieState = {
  currentPageIndex: number;
  requestedPage: number | null;
  sortBy: SortingValue;
  sortOrder: SortingOrder;
  pagesCount: number;
  pages: Record<number, MoviePage>;
  favorites: EntityId[];
};

const moviesAdapter = createEntityAdapter<Movie>({
  selectId: (movie) => movie.id,
  // sortComparer: (a, b) => a.rating - b.rating,
});

const createPage = (
  status: MoviesLoadingStatus = MoviesLoadingStatus.IDLE,
  sortBy: SortingValue = DEFAULT_SORT_BY,
  sortOrder: SortingOrder = DEFAULT_SORT_ORDER
): MoviePage => ({
  data: moviesAdapter.getInitialState(),
  sortBy,
  sortOrder,
  status,
  error: null,
});

const readFavorites = () => {
  const stored = String(localStorage.getItem(FAVORIES_LOCAL_STORAGE_KEY));
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (e) {
    throw new Error("Error with reading favorites");
  }

  if (
    Array.isArray(parsed) &&
    parsed.every((item) => typeof item === "number")
  ) {
    return parsed;
  }

  return [];
};

const initialState: MovieState = {
  currentPageIndex: DEFAULT_PAGE,
  requestedPage: null,
  sortBy: DEFAULT_SORT_BY,
  sortOrder: DEFAULT_SORT_ORDER,
  pages: {},
  pagesCount: 0,
  favorites: readFavorites(),
};

const fetchMovies = createAsyncThunk(
  `${DISCOVER_MOVIES}/fetchMovies`,
  fetchMoviesRequest
);

const moviesSlice = createSlice({
  name: DISCOVER_MOVIES,
  initialState: initialState,
  reducers: {
    setFavorite(state, action) {
      const flag = action.payload.flag;
      const id = action.payload.id;
      const presented = state.favorites.includes(id);

      if (flag) {
        if (presented) return state;

        state.favorites.push(id);
      } else {
        if (!presented) return state;

        const index = state.favorites.findIndex((item) => item === id);
        state.favorites.splice(index, 1);
      }

      let serialized;
      try {
        serialized = JSON.stringify(state.favorites);
      } catch (e) {
        serialized = "[]";
        state.favorites = [];
      }

      localStorage.setItem(FAVORIES_LOCAL_STORAGE_KEY, serialized);
    },
    setCurrentPage(state, action) {
      state.currentPageIndex = action.payload;
      state.requestedPage = null;
    },
    setSortValue(state, action) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action) {
      state.sortOrder = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<MovieState>) => {
    builder.addCase(fetchMovies.pending, (state: MovieState, action) => {
      const { page: newPageIndex } = action.meta.arg;

      state.pages[newPageIndex] = createPage(
        MoviesLoadingStatus.LOADING,
        state.sortBy,
        state.sortOrder
      );

      const page = state.pages[newPageIndex];
      page.status = MoviesLoadingStatus.LOADING;
      state.requestedPage = newPageIndex;
    });
    builder.addCase(fetchMovies.fulfilled, (state: MovieState, action) => {
      const { page: loadedPageIndex } = action.meta.arg;
      const page = state.pages[loadedPageIndex];
      state.pagesCount = action.payload.pages;
      moviesAdapter.removeAll(page.data);
      moviesAdapter.addMany(page.data, action.payload.movies);
      page.status = MoviesLoadingStatus.SUCCEEDED;
      if (state.requestedPage === loadedPageIndex) {
        state.currentPageIndex = loadedPageIndex;
      }
    });
    builder.addCase(fetchMovies.rejected, (state: MovieState, action) => {
      const loadedPageIndex = action.meta.arg.page;
      const page = state.pages[loadedPageIndex];
      page.error = action.error.message || "Request failed";
      page.status = MoviesLoadingStatus.FAILED;
    });
  },
});

export const discoverMoviesReducer = moviesSlice.reducer;

export const discoverMoviesActions = moviesSlice.actions;

export const requestMoviesPage =
  ({ page, force }: FetchMoviesOptions): AppThunk =>
  (dispatch, getState) => {
    const state = selectMoviesSubState(getState());
    const nextPage = state.pages[page];

    if (nextPage && nextPage.status === MoviesLoadingStatus.SUCCEEDED) {
      if (
        state.sortBy !== nextPage.sortBy ||
        state.sortOrder !== nextPage.sortOrder
      ) {
        dispatch(
          fetchMovies({
            page,
            endpoint: DISCOVER_MOVIES_ENDPOINT,
            sort_by: [state.sortBy, state.sortOrder].join("."),
          })
        );
      } else {
        dispatch(discoverMoviesActions.setCurrentPage(page));
      }
    }

    if (
      !nextPage ||
      [MoviesLoadingStatus.IDLE, MoviesLoadingStatus.FAILED].includes(
        nextPage.status
      )
    ) {
      dispatch(
        fetchMovies({
          page,
          endpoint: DISCOVER_MOVIES_ENDPOINT,
          sort_by: [state.sortBy, state.sortOrder].join("."),
        })
      );
      return;
    }

    // Here we just wait for loading
  };

const selectMoviesSubState = (rootState: RootState) =>
  rootState[DISCOVER_MOVIES];
const selectFavorites = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.favorites
);
const selectCurrentPageIndex = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.currentPageIndex
);

const selectPagesCount = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.pagesCount
);
const selectCurrentSortBy = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.sortBy
);

const selectCurrentSortOrder = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.sortOrder
);

const selectRequestedPageIndex = createSelector(
  [selectMoviesSubState],
  (state: MovieState) => state.requestedPage
);
const selectCurrentPage = createSelector(
  [selectMoviesSubState, selectCurrentPageIndex],
  (state: MovieState, pageIndex) => state.pages[pageIndex] || createPage()
);
const selectRequestedPage = createSelector(
  [selectMoviesSubState, selectRequestedPageIndex],
  (state: MovieState, pageIndex) =>
    (typeof pageIndex === "number" && state.pages[pageIndex]) || createPage()
);
const selectCurrentPageStatus = createSelector(
  [selectCurrentPage],
  (page: MoviePage) => page.status
);
const selectRequestedPageStatus = createSelector(
  [selectRequestedPage],
  (page: MoviePage) => page.status
);
const selectRequestedPageError = createSelector(
  [selectRequestedPage],
  (page: MoviePage) =>
    page.status === MoviesLoadingStatus.FAILED ? page.error : null
);
const selectMoviesData = createSelector(
  [selectCurrentPage],
  (page: MoviePage) =>
    page.status === MoviesLoadingStatus.SUCCEEDED
      ? page.data
      : moviesAdapter.getInitialState()
);

const { selectIds: selectMovieIds, selectById: selectMovieById } =
  moviesAdapter.getSelectors(selectMoviesData);

const selectMovieFavoriteFlag = createSelector(
  [selectFavorites, (state: RootState, id: EntityId) => id],
  (favorites: EntityId[], id: EntityId) => favorites.includes(id)
);

export const discoverMovieSelectors = {
  selectCurrentPageIndex,
  selectCurrentPageStatus,
  selectCurrentSortBy,
  selectCurrentSortOrder,
  selectPagesCount,
  selectMovieById,
  selectMovieFavoriteFlag,
  selectMovieIds,
  selectRequestedPageError,
  selectRequestedPageIndex,
  selectRequestedPageStatus,
};
