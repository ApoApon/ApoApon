import { FC } from "react";

interface Props {
  children: React.ReactElement;
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="container">
      <header>
        <h1 className="logo">あぽあぽん</h1>
      </header>
      <nav>
      </nav>
      <main>{children}</main>
    </div>
  );
};
