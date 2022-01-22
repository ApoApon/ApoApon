import { VFC } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/pages";
<<<<<<< HEAD
import CalendarDate from "../components/pages/calendar";
=======
import { Video } from "../components/pages/video";
>>>>>>> main

export const Router: VFC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
<<<<<<< HEAD
      <Route path="/calendar" element={<CalendarDate />}></Route>
=======
      <Route path="/video" element={<Video />}></Route>
>>>>>>> main
    </Routes>
  );
};
