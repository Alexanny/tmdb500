import { Grid, LinearProgress, makeStyles, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import CustomPagination from "../../common/components/CustomPagination";
import MovieCard from "./MovieCard";
import {
  DEFAULT_PAGE,
  MoviesLoadingStatus,
  requestMoviesPage,
  topMovieSelectors,
} from "./slices/topMoviesSlice";
import { MovieCategory } from "./types/MovieCategory";

const useStyles = makeStyles({
  progress: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    "& .MuiLinearProgress-colorPrimary": {
      backgroundColor: "white",
    },
    "& .MuiLinearProgress-barColorPrimary": {
      backgroundColor: "#717171",
    },
  },
  root: {
    minHeight: "100%",
  },
  gridContainer: {
    marginTop: "4vh",
  },
});

const MoviesList: FunctionComponent = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(topMovieSelectors.selectCurrentPageIndex);
  const movieIds = useAppSelector(topMovieSelectors.selectMovieIds);
  const currentPageStatus = useAppSelector(
    topMovieSelectors.selectCurrentPageStatus
  );
  const requestedPage = useAppSelector(
    topMovieSelectors.selectRequestedPageIndex
  );
  const requestedPageStatus = useAppSelector(
    topMovieSelectors.selectRequestedPageStatus
  );
  const requestedPageError = useAppSelector(
    topMovieSelectors.selectRequestedPageError
  );

  useEffect(() => {
    if (currentPageStatus === MoviesLoadingStatus.IDLE) {
      dispatch(requestMoviesPage({ page: currentPage }));
    }
  }, [currentPageStatus, currentPage, dispatch]);

  const handlePaginationChange = (
    event: ChangeEvent<unknown>,
    page: number
  ) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(requestMoviesPage({ page }));
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

  const Pagination = () => (
    <CustomPagination
      count={25}
      onChange={handlePaginationChange}
      page={currentPage}
      requestedPage={currentPage}
      loading={isLoading}
      defaultPage={DEFAULT_PAGE}
    />
  );

  return (
    <>
      {requestedPageStatus === MoviesLoadingStatus.LOADING && (
        <LinearProgress className={classes.progress} />
      )}
      {currentPageStatus === MoviesLoadingStatus.SUCCEEDED && (
        <>
          <Grid className={classes.gridContainer} container spacing={2}>
            {movieIds &&
              movieIds.map((id) => (
                <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
                  <MovieCard movieId={id} category={MovieCategory.TOP} />
                </Grid>
              ))}
          </Grid>
          <Pagination />
        </>
      )}
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
    </>
  );
};

export default MoviesList;
