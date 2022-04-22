import { Grid, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import CustomPagination from "../../common/components/CustomPagination";
import MovieCard from "./MovieCard";
import {
  DEFAULT_PAGE,
  movieSelectors,
  MoviesLoadingStatus,
  requestMoviesPage,
} from "./moviesSlice";

const MoviesList: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(movieSelectors.selectCurrentPageIndex);
  const movieIds = useAppSelector(movieSelectors.selectMovieIds);
  const currentPageStatus = useAppSelector(
    movieSelectors.selectCurrentPageStatus
  );
  const requestedPage = useAppSelector(movieSelectors.selectRequestedPageIndex);
  const requestedPageStatus = useAppSelector(
    movieSelectors.selectRequestedPageStatus
  );
  const requestedPageError = useAppSelector(
    movieSelectors.selectRequestedPageError
  );

  useEffect(() => {
    if (currentPageStatus === MoviesLoadingStatus.IDLE) {
      dispatch(requestMoviesPage(currentPage));
    }
  }, [currentPageStatus, currentPage, dispatch]);

  const handlePaginationChange = (
    event: ChangeEvent<unknown>,
    page: number
  ) => {
    dispatch(requestMoviesPage(page));
  };

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorAlertText, setErrorAlertText] = useState(
    "Something went wrong..."
  );

  const handleCloseErrorAlert = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setShowErrorAlert(false);
  };

  useEffect(() => {
    if (requestedPageStatus === MoviesLoadingStatus.FAILED) {
      // Store error from that page
      setErrorAlertText(requestedPageError || "Something went wrong...");
      setShowErrorAlert(true);
    }
  }, [requestedPage, requestedPageStatus, requestedPageError]);

  const isLoading = requestedPageStatus === MoviesLoadingStatus.LOADING;

  const Pagination = (
    <CustomPagination
      onChange={handlePaginationChange}
      page={currentPage}
      requestedPage={requestedPage}
      loading={isLoading}
      defaultPage={DEFAULT_PAGE}
    />
  );

  return (
    <>
      {Pagination}
      {
        <Snackbar
          open={showErrorAlert}
          autoHideDuration={6000}
          onClose={handleCloseErrorAlert}
        >
          <Alert onClose={handleCloseErrorAlert} severity="error">
            {errorAlertText}
          </Alert>
        </Snackbar>
      }
      {currentPageStatus === MoviesLoadingStatus.SUCCEEDED && (
        <Grid container spacing={2}>
          {movieIds.map((id) => (
            <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
              <MovieCard movieId={id} />
            </Grid>
          ))}
        </Grid>
      )}
      {Pagination}
    </>
  );
};

export default MoviesList;
