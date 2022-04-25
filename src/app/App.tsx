import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { FunctionComponent } from "react";
import MoviesList from "../features/movies/MoviesList";
import "../index.css";

const useStyles = makeStyles({
  root: {
    minHeight: "100%",
  },
  title: {
    borderRadius: "0 0 4px 4px",
    color: "black",
    textShadow: "-1px 1px white",
  },
});

const App: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Typography
        className={classes.title}
        variant="h3"
        component="h1"
        align="center"
      >
        TMDB top 500 movies
      </Typography>
      <MoviesList />
    </Container>
  );
};

export default App;
