import { BrowserRouter } from "react-router-dom";
import { Router } from "./router/Router";
import { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import "./styles/App.scss";
import { DBCtrler } from "./firebase/DBCtrler";
import { FirebaseCredential } from "./firebase/FirebaseCredential";

interface IAuthContext {
  credential: FirebaseCredential;
  dbCtrler: DBCtrler;
  user: User | null;
}

const credential = new FirebaseCredential();
const dbCtrler = new DBCtrler(credential.firestore);

const AuthContext = createContext<IAuthContext>({
  credential: credential,
  dbCtrler: dbCtrler,
  user: null,
});

export function useAuthContext(): IAuthContext {
  return useContext(AuthContext);
}

function App() {
  const [user_id, setUserID] = useState<User | null>(null);

  const value: IAuthContext = {
    credential: credential,
    dbCtrler: dbCtrler,
    user: user_id,
  };

  useEffect(
    () =>
      onAuthStateChanged(credential.auth, (user) => {
        dbCtrler.user_id = user?.uid ?? "";
        setUserID(user);
      }),
    []
  );

  return (
    <AuthContext.Provider value={value}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
