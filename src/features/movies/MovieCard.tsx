import {
  Divider,
  IconButton,
  Link,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Info } from "@material-ui/icons";
import Rating from "@material-ui/lab/Rating";
import { EntityId } from "@reduxjs/toolkit";
import { ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  discoverMoviesActions,
  discoverMovieSelectors,
} from "./slices/discoverMoviesSlice";
import { topMoviesActions, topMovieSelectors } from "./slices/topMoviesSlice";
import { MovieCategory } from "./types/MovieCategory";

export type MovieCardProps = {
  movieId: EntityId;
  category: MovieCategory;
};

const useStyles = makeStyles({
  root: {
    margin: 0,
    padding: "10px",
    backgroundColor: "rgb(255 255 255 / 20%)",
    borderRadius: "8px",
  },
  favorite: {
    boxShadow: "gold 0 0 0px 4px",
  },
  info: {
    bottom: 5,
    right: 5,
    padding: 4,
    borderRadius: 4,
    position: "absolute",
    width: "7vh",
    backgroundColor: "rgb(255 255 255 / 50%)",
    "&:hover": {
      backgroundColor: "rgb(255 255 255 / 80%)",
    },
  },
  favoriteButton: {
    top: 5,
    right: 5,
    position: "absolute",
    color: "gold",
    backgroundColor: "rgb(255 255 255 / 50%)",
    borderRadius: 4,
    padding: 2,
    width: "7vh",
    "& .MuiRating-label": {
      width: "-webkit-fill-available",
      display: "flex",
      justifyContent: "center",
    },
    "&:hover": {
      backgroundColor: "rgb(255 255 255 / 80%)",
    },
  },
  rating: {
    top: 0,
    left: 0,
    position: "absolute",
    fontSize: "2vh",
    padding: "1vh",
    color: "white",
    backgroundColor: "black",
  },
  poster: {
    position: "relative",
    width: "auto",
    height: "450px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  head: {
    display: "grid",
    gridTemplateColumns: "1fr 30px",
  },
  titleContainer: {
    height: "10vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  title: {
    fontSize: "2.2vh",
    padding: "0 1vh",
    textAlign: "center",
    color: "white",
  },
  overview: {
    fontSize: "1.5vw",
  },
  textSecondary: {
    fontSize: "1vw",
  },
});

const MovieCard: React.FC<MovieCardProps> = ({ movieId, category }) => {
  const classes = useStyles();
  const movieData = useAppSelector((state) => {
    switch (category) {
      case MovieCategory.DISCOVER:
        return discoverMovieSelectors.selectMovieById(state, movieId);
      case MovieCategory.TOP:
        return topMovieSelectors.selectMovieById(state, movieId);
    }
  })!;
  const favorite = useAppSelector((state) => {
    switch (category) {
      case MovieCategory.DISCOVER:
        return discoverMovieSelectors.selectMovieFavoriteFlag(state, movieId);
      case MovieCategory.TOP:
        return topMovieSelectors.selectMovieFavoriteFlag(state, movieId);
    }
  });
  const dispatch = useAppDispatch();

  const handleFavChange = (
    event: ChangeEvent<unknown>,
    newValue: number | null
  ) => {
    switch (category) {
      case MovieCategory.DISCOVER:
        dispatch(
          discoverMoviesActions.setFavorite({ id: movieId, flag: !!newValue })
        );
        break;
      case MovieCategory.TOP:
        dispatch(
          topMoviesActions.setFavorite({ id: movieId, flag: !!newValue })
        );
    }
  };

  const { id, image, title, overview, rating, year } = movieData;

  return (
    <div className={`${classes.root} ${favorite ? classes.favorite : ""}`}>
      <div
        className={classes.poster}
        style={{ backgroundImage: `url('${image}')` }}
      >
        <span className={classes.rating}>{rating}</span>
        <Rating
          className={classes.favoriteButton}
          name={`favorite-${movieId}`}
          value={favorite ? 1 : 0}
          onChange={handleFavChange}
          max={1}
        />
        <Tooltip
          title={
            <>
              <Typography variant="h5">{title}</Typography>
              <Divider />
              <Typography variant="subtitle1" className="year">
                Year: {year}
              </Typography>
              <Divider />
              <Typography variant="subtitle1" className="description">
                {overview}
              </Typography>
            </>
          }
        >
          <IconButton className={classes.info}>
            <Info />
          </IconButton>
        </Tooltip>
      </div>
      <div className={classes.titleContainer}>
        <Link
          href={`https://www.themoviedb.org/movie/${id}`}
          target="_blank"
          rel="noreferrer"
        >
          <Typography className={classes.title} component="p" variant="caption">
            {title}
          </Typography>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
