import { VFC } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/pages";
import CalendarDate from "../components/pages/calendar";

export const Router:VFC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/calendar" element={<CalendarDate />}></Route>
    </Routes>
  );
};
