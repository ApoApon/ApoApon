import { VFC } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/pages";
import CalendarDate from "../components/pages/calendar";
import { Reserve } from "../components/pages/reserve";
import { Video } from "../components/pages/video";

export const Router: VFC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/calendar" element={<CalendarDate />}></Route>
      <Route path="/video" element={<Video />}></Route>
      <Route path="/reserve" element={<Reserve />}></Route>
    </Routes>
  );
};
