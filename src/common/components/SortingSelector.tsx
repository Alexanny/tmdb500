import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  discoverMoviesActions,
  discoverMovieSelectors,
  requestMoviesPage,
} from "../../features/movies/slices/discoverMoviesSlice";

type SortParameter = {
  display: string;
  value: string;
};
const sortParams: SortParameter[] = [
  { display: "popularity", value: "popularity" },
  { display: "release date", value: "release_date" },
  { display: "revenue", value: "revenue" },
  { display: "primary release date", value: "primary_release_date" },
  { display: "original title", value: "original_title" },
  { display: "vote average", value: "vote_average" },
  { display: "vote count", value: "vote_count" },
];

const useStyles = makeStyles({
  root: {
    margin: "4vh 0 2vh",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
  },
  formControl: {
    "& .Mui-focused": {
      color: "white",
    },
  },
  label: {
    color: "#ffffff",
    backgroundColor: "#f50157",
    padding: "2px 5px",
    borderRadius: "5px",
  },
  select: {
    backgroundColor: "#333333",
    color: "white",
  },
});

export const SortingSelector = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(
    discoverMovieSelectors.selectCurrentPageIndex
  );

  const sortBy = useAppSelector(discoverMovieSelectors.selectCurrentSortBy);
  const sortOrder = useAppSelector(
    discoverMovieSelectors.selectCurrentSortOrder
  );

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(discoverMoviesActions.setSortValue(event.target.value));
    // dispatch(requestMoviesPage({ page: currentPage, force: true }));
  };

  const handleSortOrder = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(
      discoverMoviesActions.setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    );
    // dispatch(requestMoviesPage({ page: currentPage, force: true }));
  };

  useEffect(() => {
    dispatch(requestMoviesPage({ page: currentPage, force: true }));
  }, [sortBy, sortOrder, currentPage, dispatch]);

  return (
    <div className={classes.root}>
      <FormControl
        size="small"
        variant="outlined"
        className={classes.formControl}
      >
        <InputLabel className={classes.label}>Sort by</InputLabel>
        <Select
          className={classes.select}
          color="secondary"
          value={sortBy}
          onChange={handleChange}
          label="Sort by"
        >
          {sortParams.map((param) => (
            <MenuItem key={param.value} value={param.value}>
              {param.display}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton color="secondary" onClick={handleSortOrder}>
        {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
      </IconButton>
    </div>
  );
};
