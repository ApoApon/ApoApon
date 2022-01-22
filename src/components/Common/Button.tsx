import { FC } from "react";

type ButtonProps = {
  title: string;
  onClick: () => void;
};
export const Button: FC<ButtonProps> = (props) => {
  return <button className="base-button" onClick={props.onClick}>{props.title}</button>;
};
