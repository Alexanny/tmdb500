import { ActionReducerMapBuilder, createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityId, EntityState } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { Movie } from './Movie';
import { fetchMoviesRequest } from './moviesApi';

export const MOVIES_NS = 'movies';
export const DEFAULT_PAGE = 1;
const FAVORIES_LOCAL_STORAGE_KEY = 'top500_favorites';

export enum MoviesLoadingStatus {
    IDLE,
    LOADING,
    SUCCEEDED,
    FAILED
}

type MoviePage = {
    data: EntityState<Movie>,
    status: MoviesLoadingStatus,
    error: string | null
}

type MovieState = {
    currentPageIndex: number,
    requestedPage: number | null,
    pages: Record<number, MoviePage>,
    favorites: EntityId[]
}

const moviesAdapter = createEntityAdapter<Movie>({
    selectId: (movie) => movie.id,
    // sortComparer: (a, b) => a.rating - b.rating,
});

const createPage = (status: MoviesLoadingStatus = MoviesLoadingStatus.IDLE) => ({
    data: moviesAdapter.getInitialState(),
    status,
    error: null
});

const readFavorites = () => {
    const stored = String(localStorage.getItem(FAVORIES_LOCAL_STORAGE_KEY));
    let parsed;
    try {
        parsed = JSON.parse(stored);
    } catch (e) {
        // just ignore any pare errors
    }

    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
        return parsed;
    }

    return [];
}

const initialState: MovieState = {
    currentPageIndex: DEFAULT_PAGE,
    requestedPage: null,
    pages: {},
    favorites: readFavorites()
};

const fetchMovies = createAsyncThunk(`${MOVIES_NS}/fetchMovies`, fetchMoviesRequest);

const moviesSlice = createSlice({
    name: MOVIES_NS,
    initialState: initialState,
    reducers: {
        setFavorite (state, action) {
            const flag = action.payload.flag;
            const id = action.payload.id;
            const presented = state.favorites.includes(id);

            if (flag) {
                if (presented) return state;

                state.favorites.push(id);
            } else {
                if (!presented) return state;

                const index = state.favorites.findIndex(item => item === id);
                state.favorites.splice(index, 1);
            }

            let serialized;
            try {
                serialized = JSON.stringify(state.favorites);
            } catch (e) {
                serialized = '[]';
                state.favorites = [];
            }

            localStorage.setItem(FAVORIES_LOCAL_STORAGE_KEY, serialized);
        },
        setCurrentPage (state, action) {
            state.currentPageIndex = action.payload;
            state.requestedPage = null;
        },
    },
    extraReducers: (builder: ActionReducerMapBuilder<MovieState>) => {
        builder.addCase(fetchMovies.pending, (state: MovieState, action) => {
            const newPageIndex = action.meta.arg;
            if (!state.pages[newPageIndex]) {
                state.pages[newPageIndex] = createPage(MoviesLoadingStatus.LOADING);
            }
            const page = state.pages[newPageIndex];
            page.status = MoviesLoadingStatus.LOADING;
            state.requestedPage = newPageIndex;
        });
        builder.addCase(fetchMovies.fulfilled, (state: MovieState, action) => {
            const loadedPageIndex = action.meta.arg;
            const page = state.pages[loadedPageIndex];

            moviesAdapter.addMany(page.data, action.payload);
            page.status = MoviesLoadingStatus.SUCCEEDED;
            if (state.requestedPage === loadedPageIndex) {
                state.currentPageIndex = loadedPageIndex;
            }
        });
        builder.addCase(fetchMovies.rejected, (state: MovieState, action) => {
            const loadedPageIndex = action.meta.arg;
            const page = state.pages[loadedPageIndex];
            page.error = action.error.message || 'Request failed';
            page.status = MoviesLoadingStatus.FAILED;
        });
    }
});

export const moviesReducer = moviesSlice.reducer;

export const moviesActions = moviesSlice.actions;

export const requestMoviesPage = (page: number): AppThunk => (dispatch, getState) => {
    const state = selectMoviesSubState(getState());
    const nextPage = state.pages[page];

    if (page === state.currentPageIndex && nextPage && nextPage.status === MoviesLoadingStatus.SUCCEEDED) {
        return;
    }

    if (nextPage && nextPage.status === MoviesLoadingStatus.SUCCEEDED) {
        dispatch(moviesActions.setCurrentPage(page));
        return;
    }

    if (!nextPage || [MoviesLoadingStatus.IDLE, MoviesLoadingStatus.FAILED].includes(nextPage.status)) {
        dispatch(fetchMovies(page));
        return;
    }

    // Here we just wait for loading
}

const selectMoviesSubState = (rootState: RootState) => rootState[MOVIES_NS];
const selectFavorites = createSelector([selectMoviesSubState], (state: MovieState) => state.favorites);
const selectCurrentPageIndex = createSelector([selectMoviesSubState], (state: MovieState) => state.currentPageIndex);
const selectRequestedPageIndex = createSelector([selectMoviesSubState], (state: MovieState) => state.requestedPage);
const selectCurrentPage = createSelector([selectMoviesSubState, selectCurrentPageIndex], (state: MovieState, pageIndex) => state.pages[pageIndex] || createPage());
const selectRequestedPage = createSelector([selectMoviesSubState, selectRequestedPageIndex], (state: MovieState, pageIndex) => typeof pageIndex === 'number' && state.pages[pageIndex] || createPage());
const selectCurrentPageStatus = createSelector([selectCurrentPage], (page: MoviePage) => page.status);
const selectRequestedPageStatus = createSelector([selectRequestedPage], (page: MoviePage) => page.status);
const selectRequestedPageError = createSelector([selectRequestedPage], (page: MoviePage) => page.status === MoviesLoadingStatus.FAILED ? page.error : null);
const selectMoviesData = createSelector([selectCurrentPage], (page: MoviePage) => page.status === MoviesLoadingStatus.SUCCEEDED ? page.data : moviesAdapter.getInitialState());

const {
    selectIds: selectMovieIds,
    selectById: selectMovieById,
} = moviesAdapter.getSelectors(selectMoviesData);

const selectMovieFavoriteFlag = createSelector([selectFavorites, (state: RootState, id: EntityId) => id], (favorites: EntityId[], id: EntityId) => favorites.includes(id));

export const movieSelectors = {
    selectCurrentPageIndex,
    selectCurrentPageStatus,
    selectMovieById,
    selectMovieFavoriteFlag,
    selectMovieIds,
    selectRequestedPageError,
    selectRequestedPageIndex,
    selectRequestedPageStatus,
};
