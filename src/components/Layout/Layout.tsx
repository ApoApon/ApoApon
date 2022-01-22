import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../Common/Button";
import style from "./layout.module.scss";

const menu = {
  items: [
    {
      path: "/",
      title: "ホーム",
    },
    {
      path: "/calender",
      title: "予定を見る",
    },
    {
      path: "/schedule",
      title: "予定を作る",
    },
  ],
};

interface Props {
  children: React.ReactElement;
}

export const Layout: FC<Props> = ({ children }) => {
  const location = useLocation();
  const handleLogout = () => {
    console.log("logout");
  };
  return (
    <div className={style.container}>
      <header>
        <h1 className={style.logo}>あぽあぽん</h1>
        <Button title="ログアウト" onClick={handleLogout} />
      </header>
      <nav>
        <div className={style.wrapper}>
          {menu.items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={style.item}
              style={
                location.pathname === item.path
                  ? { color: "#aa271f" }
                  : { color: "#3E3D3D" }
              }
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};