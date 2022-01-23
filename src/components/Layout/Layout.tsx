import { FC, useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../App";
import SignInUp, {
  SignInText,
  SignUpText,
  SignInUpTextValues,
} from "../auth/auth";
import { signOut } from "firebase/auth";
import { Button } from "../Common/Button";
import style from "./layout.module.scss";
import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";

const menu = {
  items: [
    {
      path: "/",
      title: "ホーム",
    },
    {
      path: "/calendar",
      title: "予定を見る",
    },
    {
      path: "/reserve",
      title: "予定を作る",
    },
  ],
};

interface Props {
  children: React.ReactElement;
}

export const Layout: FC<Props> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [signInUpText, setSignInUpText] =
    useState<SignInUpTextValues>(SignInText);

  function openDialogToSignIn() {
    setIsDialogOpen(false);
    setSignInUpText(SignInText);
    setIsDialogOpen(true);
  }
  function openDialogToSignUp() {
    setIsDialogOpen(false);
    setSignInUpText(SignUpText);
    setIsDialogOpen(true);
  }

  const location = useLocation();
  const ctx = useAuthContext();

  const handleLogout = () => {
    signOut(ctx.credential.auth).catch(console.error);
  };
  return (
    <div className={style.container}>
      <header>
        <h1 className={style.logo}>あぽあぽん</h1>
        {ctx.user == null ? (
          <div>
            <Button title="ログイン" onClick={openDialogToSignIn} />
            <Button title="登録" onClick={openDialogToSignUp} />
          </div>
        ) : (
          <div>
            <Button title="ログアウト" onClick={handleLogout} />
          </div>
        )}
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
      <main>
        {children}
        <Fragment>
          <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            fullWidth
            maxWidth={"sm"}
          >
            <DialogTitle>{signInUpText}</DialogTitle>

            <DialogContent>
              <SignInUp
                signInUpText={signInUpText}
                closeDialog={setIsDialogOpen}
              />
            </DialogContent>
          </Dialog>
        </Fragment>
      </main>
    </div>
  );
};
