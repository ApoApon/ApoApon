import { FC } from "react";
import style from "./button.module.scss";

type ButtonProps = {
  title: string;
  onClick: () => void;
};
export const Button: FC<ButtonProps> = (props) => {
  return <button className={style.button} onClick={props.onClick}>{props.title}</button>;
};
