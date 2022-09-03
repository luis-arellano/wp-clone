import React from "react";
import { theme } from "../utils";

// Context provides a way to pass data through the component
// tree without having to pass props down manually at every level.
const GlobalContext = React.createContext({
  theme,
  rooms: [],
  setRooms: () => {},
  unfilteredRooms: [],
  setUnfilteredRooms: () => {},
});

export default GlobalContext;
