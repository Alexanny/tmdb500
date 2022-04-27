import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { FunctionComponent } from "react";
import { Route, Routes } from "react-router-dom";
import Navigation from "../common/components/Navigation";
import DiscoverMovies from "../features/movies/DiscoverMovies";
import TopMovies from "../features/movies/TopMovies";
import "../index.css";

const useStyles = makeStyles({
  root: {
    minHeight: "100%",
  },
  title: {
    color: "black",
    textShadow: "1px -2px white",
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
        TMDB movies
      </Typography>
      <Navigation />
      <Routes>
        <Route path="/top500" element={<TopMovies />} />
        <Route path="/" element={<DiscoverMovies />} />
      </Routes>
    </Container>
  );
};

export default App;
