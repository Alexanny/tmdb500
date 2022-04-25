import {
  Pagination,
  PaginationItem,
  PaginationRenderItemParams,
} from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { ChangeEvent, FunctionComponent } from "react";

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

  const renderItem = (item: PaginationRenderItemParams) => {
    const className =
      item.page === requestedPage ? classes.requested : classes.pageItem;
    return <PaginationItem className={className} {...item} />;
  };

  return (
    <div className={classes.wrapper}>
      <Pagination
        className={classes.pagination}
        siblingCount={2}
        boundaryCount={2}
        count={count}
        shape="round"
        renderItem={renderItem}
        {...otherProps}
      />
    </div>
  );
};

export default CustomPagination;
