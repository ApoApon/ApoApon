import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore";
import { Auth, connectAuthEmulator, getAuth } from "firebase/auth";

const EMU_HOST = "localhost";
const EMU_STORE_PORT = 8080;
const EMU_AUTH_URL = `http://${EMU_HOST}:9099`;

const firebaseConfig = {
  apiKey: "AIzaSyB4VWEPqqEobljfWN4JUdD69ntOEjxPA_A",
  authDomain: "apoapon.firebaseapp.com",
  projectId: "apoapon",
  storageBucket: "apoapon.appspot.com",
  messagingSenderId: "323290776223",
  appId: "1:323290776223:web:b4b38c7aa4bec9df4c98aa",
  measurementId: "G-NN4J2D316S",
};

export class FirebaseCredential {
  public readonly app: FirebaseApp;
  public readonly analytics?: Analytics;
  public readonly auth: Auth;
  public readonly firestore: Firestore;

  constructor(opt?: FirebaseOptions, is_debug = false) {
    this.app = initializeApp(opt ?? firebaseConfig);
    if (!is_debug) this.analytics = getAnalytics(this.app);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    if (is_debug) {
      connectAuthEmulator(this.auth, EMU_AUTH_URL);
      connectFirestoreEmulator(this.firestore, EMU_HOST, EMU_STORE_PORT);
    }
  }
}
