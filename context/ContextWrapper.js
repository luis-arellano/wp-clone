import React from "react";
import Context from "./Context";
import { theme } from "../utils";

/**
 * Context provides a way to share values like these 
 * between components without having to explicitly pass 
 * a prop through every level of the tree.
 * 
 * @param {*} props 
 * @returns Context
 */
export default function ContextWrapper(props) {
  return (
    <Context.Provider
      value={{ theme }}
    >
      {props.children}
    </Context.Provider>
  );
}
