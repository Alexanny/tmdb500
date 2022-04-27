import { Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationRoutes } from "../../app/routes";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    "& .MuiTab-wrapper": {
      color: "white",
    },
  },
});

export default function Navigation() {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [located, setLocated] = React.useState<number | boolean>(false);

  // check route from location
  useEffect(() => {
    setLocated(false);
    const currentPathName = location.pathname;
    setLocated(
      navigationRoutes.findIndex(
        (navRoute) => navRoute.route === currentPathName
      )
    );
  }, [location]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    navigate(navigationRoutes[newValue].route);
  };

  return (
    <div className={classes.root}>
      <Tabs value={located} onChange={handleChange}>
        {navigationRoutes.map((navRoute) => (
          <Tab key={navRoute.route} label={navRoute.display} />
        ))}
      </Tabs>
    </div>
  );
}
