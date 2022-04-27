import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import {
  discoverMoviesReducer,
  DISCOVER_MOVIES,
} from "../features/movies/slices/discoverMoviesSlice";
import {
  topMoviesReducer,
  TOP_MOVIES,
} from "../features/movies/slices/topMoviesSlice";
export const store = configureStore({
  reducer: {
    [TOP_MOVIES]: topMoviesReducer,
    [DISCOVER_MOVIES]: discoverMoviesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
