import { Grid, LinearProgress, makeStyles, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import CustomPagination from "../../common/components/CustomPagination";
import { SortingSelector } from "../../common/components/SortingSelector";
import MovieCard from "./MovieCard";
import {
  DEFAULT_PAGE,
  discoverMovieSelectors,
  MoviesLoadingStatus,
  requestMoviesPage,
} from "./slices/discoverMoviesSlice";
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
});

const MoviesList: FunctionComponent = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(
    discoverMovieSelectors.selectCurrentPageIndex
  );
  const movieIds = useAppSelector(discoverMovieSelectors.selectMovieIds);
  const currentPageStatus = useAppSelector(
    discoverMovieSelectors.selectCurrentPageStatus
  );
  const requestedPage = useAppSelector(
    discoverMovieSelectors.selectRequestedPageIndex
  );
  const requestedPageStatus = useAppSelector(
    discoverMovieSelectors.selectRequestedPageStatus
  );
  const requestedPageError = useAppSelector(
    discoverMovieSelectors.selectRequestedPageError
  );

  useEffect(() => {
    if (currentPageStatus === MoviesLoadingStatus.IDLE) {
      dispatch(
        requestMoviesPage({
          page: currentPage,
        })
      );
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
      count={500}
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
          <SortingSelector />
          <Grid container spacing={2}>
            {movieIds.map((id) => (
              <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
                <MovieCard movieId={id} category={MovieCategory.DISCOVER} />
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
