import { i_event, i_freetime, i_user } from "./DBCtrler.type";
import * as dbtconv from "./DBCtrler.conv";
import {
  Firestore,
  DocumentReference,
  doc,
  CollectionReference,
  collection,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  getDocs,
  QuerySnapshot,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";

const DATE_FORMAT = "YYYY-MM-DD";
const HHMM_FORMAT = "HH:mm";
const JST_TZ = "Asia/Tokyo";

function getJSTDate(date: Date): string {
  return moment(date).tz(JST_TZ).format(DATE_FORMAT);
}
function getJSTHHMM(date: Date): string {
  return moment(date).tz(JST_TZ).format(HHMM_FORMAT);
}

function getDateAsJST(date: Date | string, hhmm: string): Date {
  if (typeof date !== "string") date = getJSTDate(date);
  return moment(`${date} ${hhmm}`).toDate();
}

//#region i_event
function getEventPath(date: Date, event_id?: string): string {
  const collection_path = `event/${getJSTDate(date)}/event`;
  return event_id == undefined
    ? collection_path
    : `${collection_path}/${event_id}`;
}

function getEventDocRef(
  db: Firestore,
  date: Date,
  event_id: string
): DocumentReference<i_event> {
  return doc(db, getEventPath(date, event_id)).withConverter(
    dbtconv.i_event_conv
  );
}

function getEventCollectionRef(
  db: Firestore,
  date: Date
): CollectionReference<i_event> {
  return collection(db, getEventPath(date)).withConverter(dbtconv.i_event_conv);
}
//#endregion

//#region i_user
function getUserPath(user_id: string): string {
  return `user/${user_id}`;
}

function getUserDocRef(
  db: Firestore,
  user_id: string
): DocumentReference<i_user> {
  return doc(db, getUserPath(user_id)).withConverter(dbtconv.i_user_conv);
}
//#endregion

//#region i_freetime
function getFreetimePath(date: Date, user_id?: string): string {
  const collection_path = `freedate/${getJSTDate(date)}/freetime`;
  return user_id == undefined
    ? collection_path
    : `${collection_path}/${user_id}`;
}

function getFreetimeDocRef(
  db: Firestore,
  date: Date,
  user_id: string
): DocumentReference<i_freetime> {
  return doc(db, getFreetimePath(date, user_id)).withConverter(
    dbtconv.i_freetime_conv
  );
}

function getFreetimeCollectionRef(
  db: Firestore,
  date: Date
): CollectionReference<i_freetime> {
  return collection(db, getFreetimePath(date)).withConverter(
    dbtconv.i_freetime_conv
  );
}
//#endregion

export class DBCtrler {
  private readonly db: Firestore;

  public user_id = "";

  constructor(db: Firestore) {
    this.db = db;
  }

  private getUserDocRef(user_id?: string) {
    return getUserDocRef(this.db, user_id ?? this.user_id);
  }

  //#region user
  public addUser(
    displayname: string,
    icon: string,
    user_id?: string
  ): Promise<void> {
    return setDoc(this.getUserDocRef(user_id), {
      displayname: displayname,
      icon: icon,
      win: 0,
      lose: 0,
      draw: 0,
    });
  }

  public deleteUser(user_id?: string): Promise<void> {
    return deleteDoc(this.getUserDocRef(user_id));
  }

  public updateUserData(
    displayname: string | undefined,
    icon: string | undefined,
    user_id?: string
  ): Promise<void> {
    return updateDoc(this.getUserDocRef(user_id), {
      displayname: displayname,
      icon: icon,
    });
  }

  public incrementWinRecord(): Promise<void> {
    return updateDoc(this.getUserDocRef(), {
      win: increment(1),
    });
  }
  public incrementDrawRecord(): Promise<void> {
    return updateDoc(this.getUserDocRef(), {
      draw: increment(1),
    });
  }
  public incrementLoseRecord(): Promise<void> {
    return updateDoc(this.getUserDocRef(), {
      lose: increment(1),
    });
  }
  //#endregion

  //#region event
  public async createEvent(
    name: string,
    begin: Date,
    description: string
  ): Promise<string> {
    const addEventResult = await addDoc(getEventCollectionRef(this.db, begin), {
      begin: begin,
      challenger: null,
      createddate: serverTimestamp(),
      description: description,
      name: name,
      owner: this.getUserDocRef(),
    });

    return runTransaction(this.db, async (transaction) => {
      const current_free_time_ss = await transaction.get(
        getFreetimeDocRef(this.db, begin, this.user_id)
      );

      if (!current_free_time_ss.exists())
        return Promise.reject("freetime not set");

      const data = current_free_time_ss.data();
      const begin_hhmm = getJSTHHMM(begin);
      if (!data.event.has(begin_hhmm) || !data.event.get(begin_hhmm) != null)
        return Promise.reject("freetime not empty");

      transaction.update(current_free_time_ss.ref, {
        [`event.${begin_hhmm}`]: addEventResult,
      });
    })
      .then(() => addEventResult.id)
      .catch((reason) =>
        deleteDoc(addEventResult).then(() => Promise.reject(reason))
      );
  }

  public async challengeToEvent(
    begin: Date,
    event_id: string
  ): Promise<boolean> {
    return runTransaction(this.db, async (transaction) => {
      const event_data_ss = await transaction.get(
        getEventDocRef(this.db, begin, event_id)
      );
      if (!event_data_ss.exists()) return Promise.reject("event not found");

      const current_free_time_ss = await transaction.get(
        getFreetimeDocRef(this.db, event_data_ss.data().begin, this.user_id)
      );
      if (!current_free_time_ss.exists())
        return Promise.reject("freetime not set");

      const data = current_free_time_ss.data();
      const begin_hhmm = getJSTHHMM(begin);
      if (!data.event.has(begin_hhmm) || !data.event.get(begin_hhmm) != null)
        return Promise.reject("freetime not empty");

      transaction.update(current_free_time_ss.ref, {
        [`event.${begin_hhmm}`]: event_data_ss.ref,
      });
      transaction.update(event_data_ss.ref, {
        challenger: this.getUserDocRef(),
      });
      return true;
    });
  }

  public getAllEvent(date: Date): Promise<QuerySnapshot<i_event>> {
    return getDocs(getEventCollectionRef(this.db, date));
  }
  public getAllChallengeableEvent(date: Date): Promise<QuerySnapshot<i_event>> {
    return getDocs(
      query(
        getEventCollectionRef(this.db, date),
        where("challenger", "==", null)
      )
    );
  }
  //#endregion

  //#region freetime
  private toDateKeyMap(
    date: Date | string,
    d: Map<string, DocumentReference<i_event> | null>
  ): Map<Date, DocumentReference<i_event> | null> {
    const ret = new Map<Date, DocumentReference<i_event> | null>();
    const JSTDateStr = typeof date === "string" ? date : getJSTDate(date);
    d.forEach((v, k) => ret.set(getDateAsJST(JSTDateStr, k), v));
    return ret;
  }

  public getCurrentUserFreetime(
    date: Date
  ): Promise<Map<Date, DocumentReference<i_event> | null>> {
    return getDoc(getFreetimeDocRef(this.db, date, this.user_id)).then((v) => {
      const d: i_freetime | undefined = v.data();
      if (!v.exists() || d == undefined)
        return Promise.reject("data does not exist");

      return this.toDateKeyMap(date, d.event);
    });
  }

  public getAllUserFreetime(
    date: Date
  ): Promise<Map<string, Map<Date, DocumentReference<i_event> | null>>> {
    return getDocs(getFreetimeCollectionRef(this.db, date)).then((v) => {
      const ret = new Map<
        string,
        Map<Date, DocumentReference<i_event> | null>
      >();
      const JSTDateStr = getJSTDate(date);
      v.forEach((doc) => {
        ret.set(doc.id, this.toDateKeyMap(JSTDateStr, doc.data().event));
      });
      return ret;
    });
  }
  //#endregion
}
