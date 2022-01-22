import { VFC } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/pages";

export const Router:VFC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
    </Routes>
  );
};
