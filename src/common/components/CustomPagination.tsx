import { useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import {
  Pagination,
  PaginationItem,
  PaginationRenderItemParams
} from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { ChangeEvent, FunctionComponent } from "react";

const sizeBasedProps = {
  xl: {
    boundaryCount: 1,
    siblingCount: 2,
  },
  lg: {
    boundaryCount: 4,
    siblingCount: 4,
  },
  md: {
    boundaryCount: 2,
    siblingCount: 2,
  },
  sm: {
    boundaryCount: 1,
    siblingCount: 2,
  },
  xs: {
    boundaryCount: 1,
    siblingCount: 0,
  },
};

const useStyles = makeStyles({
  wrapper: {
    padding: "5vh 0",
  },
  pagination: {
    display: "block",
    margin: "0 auto",
    width: "fit-content",
    borderRadius: 4,
    backgroundColor: "rgb(255 255 255 / 20%)",
    padding: "4px 0",
    "& .MuiPaginationItem-ellipsis": {
      color: "white",
    },
  },
  pageItem: {
    color: "white",
  },
  requested: {
    fontWeight: "bold",
    color: "white",
    border: "1px solid white",
  },
});

type CustomPaginationProps = {
  onChange: (event: ChangeEvent<unknown>, page: number) => void;
  count?: number;
  defaultPage: number;
  page: number;
  loading: boolean;
  requestedPage: number | null;
};

const CustomPagination: FunctionComponent<CustomPaginationProps> = ({
  count,
  loading,
  requestedPage,
  ...otherProps
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const xl = useMediaQuery(theme.breakpoints.up("xl"));
  const lg = useMediaQuery(theme.breakpoints.up("lg"));
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  const xs = useMediaQuery(theme.breakpoints.up("xs"));

  const sizeBased = () => {
    if (xl) return sizeBasedProps["xl"];
    if (lg) return sizeBasedProps["lg"];
    if (md) return sizeBasedProps["md"];
    if (sm) return sizeBasedProps["sm"];
    if (xs) return sizeBasedProps["xs"];
  };

  const renderItem = (item: PaginationRenderItemParams) => {
    const className =
      item.page === requestedPage ? classes.requested : classes.pageItem;
    return <PaginationItem className={className} {...item} />;
  };

  return (
    <div className={classes.wrapper}>
      <Pagination
        className={classes.pagination}
        {...sizeBased()}
        count={count}
        shape="round"
        renderItem={renderItem}
        {...otherProps}
      />
    </div>
  );
};

export default CustomPagination;
