import { VFC } from "react";
import { Calendar } from "../calender/Calendar";
import { Layout } from "../Layout/Layout";

export const Home: VFC = () => {
  return (
    <Layout>
      <Calendar/>
    </Layout>
  );
};
