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
  DocumentSnapshot,
} from "firebase/firestore";
import moment from "moment-timezone";
import { FirebaseFirestore as CompatFirestore } from "@firebase/firestore-types";

const DATE_FORMAT = "YYYY-MM-DD";
const HHMM_FORMAT = "HH:mm";
const JST_TZ = "Asia/Tokyo";

/**
 * JSTでの日付文字列を取得する
 * @param date 日時データ
 * @returns `YYYY-MM-DD`形式での日付文字列
 */
function getJSTDate(date: Date): string {
  return moment(date).tz(JST_TZ).format(DATE_FORMAT);
}

/**
 * JSTでの時刻文字列を取得する
 * @param date 日時データ
 * @returns `HH:mm`形式での時刻文字列
 */
function getJSTHHMM(date: Date): string {
  return moment(date).tz(JST_TZ).format(HHMM_FORMAT);
}

/**
 * 日付データ/文字列と時刻データを使用してJSTの日時データに変換する
 * @param date 日付データ
 * @param hhmm 時刻文字列
 * @returns 日時データ
 */
function getDateAsJST(date: Date | string, hhmm: string): Date {
  if (typeof date !== "string") date = getJSTDate(date);
  return moment(`${date} ${hhmm}`).toDate();
}

/**
 * JSTに変換する
 * @param date 日時データ
 * @returns JSTでの日時データ
 */
function toJST(date: Date): Date {
  return moment(date).tz(JST_TZ).toDate();
}

//#region i_event
/**
 * イベントデータへのパスを取得する
 * @param event_id イベントID (`undefined`でCollectionへのパスを返します)
 * @returns パス文字列
 */
function getEventPath(event_id?: string): string {
  const collection_path = "event";
  return event_id == undefined
    ? collection_path
    : `${collection_path}/${event_id}`;
}

/**
 * イベントDocumentへのReferenceを生成する
 * @param db Firestoreの情報
 * @param event_id イベントID
 * @returns イベントDocumentへのReference
 */
function getEventDocRef(
  db: Firestore,
  event_id: string
): DocumentReference<i_event> {
  return doc(db, getEventPath(event_id)).withConverter(dbtconv.i_event_conv);
}

/**
 * イベントDoc-CollectionへのReferenceを生成する
 * @param db Firestore情報
 * @returns イベントDoc-CollectionへのReference
 */
function getEventCollectionRef(db: Firestore): CollectionReference<i_event> {
  return collection(db, getEventPath()).withConverter(dbtconv.i_event_conv);
}
//#endregion

//#region i_user
/**
 * ユーザデータへのパスを返す
 * @param user_id ユーザID
 * @returns パス文字列
 */
function getUserPath(user_id: string): string {
  return `user/${user_id}`;
}

/**
 * ユーザDocへのReferenceを返す
 * @param db Firestore情報
 * @param user_id ユーザID
 * @returns ユーザDocへのRef
 */
function getUserDocRef(
  db: Firestore,
  user_id: string
): DocumentReference<i_user> {
  return doc(db, getUserPath(user_id)).withConverter(dbtconv.i_user_conv);
}
//#endregion

//#region i_freetime
/**
 * 自由時間データへのパスを返す
 * @param date 日付データ
 * @param user_id 対象のユーザID (undefinedでその日付でのCollectionへのパスを返す)
 * @returns パス文字列
 */
function getFreetimePath(date: Date, user_id?: string): string {
  const collection_path = `freedate/${getJSTDate(date)}/freetime`;
  return user_id == undefined
    ? collection_path
    : `${collection_path}/${user_id}`;
}

/**
 * 指定の日付/ユーザの自由時間データへのRefを返す
 * @param db Firestoreデータ
 * @param date 日付データ
 * @param user_id ユーザID
 * @returns DocへのRef
 */
function getFreetimeDocRef(
  db: Firestore,
  date: Date,
  user_id: string
): DocumentReference<i_freetime> {
  return doc(db, getFreetimePath(date, user_id)).withConverter(
    dbtconv.i_freetime_conv
  );
}

/**
 * 指定の日付に登録されている全ユーザの自由時間データを取得する
 * @param db Firestoreデータ
 * @param date 日付データ
 * @returns CollectionへのReference
 */
function getFreetimeCollectionRef(
  db: Firestore,
  date: Date
): CollectionReference<i_freetime> {
  return collection(db, getFreetimePath(date)).withConverter(
    dbtconv.i_freetime_conv
  );
}
//#endregion

/**
 * データベースへの操作をWrapするライブラリ群
 * DBへの操作は, 認証が行われていないと行うことができません
 */

export class DBCtrler {
  /** Firestore情報 */
  private readonly db: Firestore;

  /** 使用するユーザID */
  public user_id = "";

  /**
   * インスタンスを初期化する
   * @param db 使用するFirestore情報
   */
  constructor(db: Firestore | CompatFirestore) {
    this.db = db as Firestore;
  }

  /**
   * ユーザ情報への参照を取得する
   * @param user_id ユーザID (`undefined`の場合, インスタンスに記録された`user_id`を使用します)
   * @returns ユーザ情報Docへの参照
   */
  public _getUserDocRef(user_id?: string) {
    return getUserDocRef(this.db, user_id ?? this.user_id);
  }

  //#region user
  /**
   * ユーザを新規追加する
   * @param displayname 表示名
   * @param icon アイコンURL
   * @param user_id ユーザID
   * @returns 非同期実行用データ
   */
  public addUser(
    displayname: string,
    icon: string,
    user_id?: string
  ): Promise<void> {
    return setDoc(this._getUserDocRef(user_id), {
      displayname: displayname,
      icon: icon,
      win: 0,
      lose: 0,
      draw: 0,
    });
  }

  /**
   * ユーザ情報を取得する
   * @param user_id ユーザID (`undefined`でインスタンスに設定されたものを使用)
   * @returns ユーザ情報
   */
  public getUser(user_id?: string): Promise<i_user | undefined> {
    return getDoc(getUserDocRef(this.db, user_id ?? this.user_id))
      .then((d) => d.data())
      .catch((msg) => {
        console.warn("warn:", msg);
        return undefined;
      });
  }

  /**
   * ユーザを削除する
   * @param user_id ユーザID (`undefined`でインスタンスに設定されたものを使用)
   * @returns 非同期実行用データ
   */
  public deleteUser(user_id?: string): Promise<void> {
    return deleteDoc(this._getUserDocRef(user_id));
  }

  /**
   * ユーザデータを更新する
   * 更新対象に`undefined`を設定すると, それに関しては更新が行われません
   * @param displayname 表示名
   * @param icon アイコンURL
   * @param user_id ユーザID (`undefined`でインスタンスに設定されたものを使用)
   * @returns 非同期実行用データ
   */
  public updateUserData(
    displayname: string | undefined,
    icon: string | undefined,
    user_id?: string
  ): Promise<void> {
    return updateDoc(this._getUserDocRef(user_id), {
      displayname: displayname,
      icon: icon,
    });
  }

  /**
   * 勝利を記録する
   * @returns 非同期実行用データ
   */
  public incrementWinRecord(): Promise<void> {
    return updateDoc(this._getUserDocRef(), {
      win: increment(1),
    });
  }

  /**
   * 引き分けを記録する
   * @returns 非同期実行用データ
   */
  public incrementDrawRecord(): Promise<void> {
    return updateDoc(this._getUserDocRef(), {
      draw: increment(1),
    });
  }

  /**
   * 敗北を記録する
   * @returns 非同期実行用データ
   */
  public incrementLoseRecord(): Promise<void> {
    return updateDoc(this._getUserDocRef(), {
      lose: increment(1),
    });
  }
  //#endregion

  //#region event
  /**
   * イベントを新規作成する
   * @param name イベント名
   * @param description イベントの説明
   * @returns イベントID
   */
  public async createEvent(name: string, description: string): Promise<string> {
    return addDoc(getEventCollectionRef(this.db), {
      // 開始時刻は挑戦者が決定する
      begin: null,
      begindate: "",
      challenger: null,

      createddate: serverTimestamp(),
      description: description,
      name: name,
      owner: this._getUserDocRef(),
    }).then((v) => v.id);
  }

  /**
   * イベントに挑戦登録する
   * @param begin イベントの開始時刻指定
   * @param event_id イベントID
   * @returns 登録に成功したかどうか
   */
  public async challengeToEvent(
    begin: Date,
    event_id: string
  ): Promise<boolean> {
    // 日時はJSTで扱う
    begin = toJST(begin);

    // Transactionで処理の確実性を向上させる
    return runTransaction(this.db, async (transaction) => {
      // 開始時刻文字列を取得する
      const begin_hhmm = getJSTHHMM(begin);

      // イベントデータを取得する
      const event_data_ss = await transaction.get(
        getEventDocRef(this.db, event_id)
      );
      // イベントデータが存在しないならエラー
      if (!event_data_ss.exists()) return Promise.reject("event not found");

      // TODO: イベントデータに既に挑戦者が登録されていないか確認する

      // イベントオーナーの自由時間を取得する
      const owner_free_time_ss = await transaction.get(
        getFreetimeDocRef(this.db, begin, event_data_ss.data().owner.id)
      );
      // イベントオーナーの自由時間はセットされていないとならないため,
      // Docが存在しなかったならエラーを返す
      if (!owner_free_time_ss.exists())
        return Promise.reject(
          `owner's freetime (${getJSTDate(begin)}) not set`
        );

      // 開催しようとしているのが確かにオーナーの自由時間に含まれているかどうかを確認する
      const owner_freetime = owner_free_time_ss.data();
      if (!owner_freetime.event.has(begin_hhmm))
        return Promise.reject(`owner's freetime (${begin_hhmm}) not available`);
      if (owner_freetime.event.get(begin_hhmm) != null)
        return Promise.reject(`owner's freetime (${begin_hhmm}) not empty`);

      // 挑戦者が当該時間に既にイベントを登録していたのであれば,
      // ダブルブッキング防止のためにエラーを返す
      const challenger_freetime_ss = await transaction.get(
        getFreetimeDocRef(this.db, begin, this.user_id)
      );
      const challenger_freetime = challenger_freetime_ss.data();
      if (
        challenger_freetime != undefined &&
        challenger_freetime.event.has(begin_hhmm) &&
        challenger_freetime.event.get(begin_hhmm) != null
      )
        return Promise.reject(
          `Challenger has already an event (${begin_hhmm})`
        );

      // Owner / Challengerともに自由時間を埋める
      transaction.update(owner_free_time_ss.ref, {
        [`event.${begin_hhmm}`]: event_data_ss.ref,
      });
      transaction.update(challenger_freetime_ss.ref, {
        [`event.${begin_hhmm}`]: event_data_ss.ref,
      });

      // イベントデータに挑戦登録する
      transaction.update(event_data_ss.ref, {
        challenger: this._getUserDocRef(),
        begin: begin,
        begindate: getJSTDate(begin),
      });

      return true;
    });
  }

  /**
   * サーバに登録されているすべてのイベントを取得する
   * @returns イベント情報群
   */
  public getAllEvent(): Promise<QuerySnapshot<i_event>> {
    return getDocs(getEventCollectionRef(this.db));
  }

  /**
   * 指定の日付に登録されているすべてのイベントを取得する
   * @param date 日付指定
   * @returns イベント情報群
   */
  public getAllEventInTargetDay(date: Date): Promise<QuerySnapshot<i_event>> {
    return getDocs(
      query(
        getEventCollectionRef(this.db),
        where("begindate", "==", getJSTDate(date))
      )
    );
  }

  /**
   * 挑戦可能なすべてのイベントを取得する
   * @returns イベント情報群
   */
  public getAllChallengeableEvent(): Promise<QuerySnapshot<i_event>> {
    return getDocs(
      query(
        getEventCollectionRef(this.db),
        where("challenger", "==", null),
        where("begin", ">", new Date())
      )
    );
  }

  /**
   * 指定日で挑戦可能なすべてのイベントを取得する
   * @param date 日付指定
   * @returns イベント情報群
   */
  public getAllChallengeableEventInTargetDay(
    date: Date
  ): Promise<QuerySnapshot<i_event>> {
    return getDocs(
      query(
        getEventCollectionRef(this.db),
        where("begindate", "==", getJSTDate(date)),
        where("challenger", "==", null),
        where("begin", ">", new Date())
      )
    );
  }

  /**
   * 指定のイベントデータを取得する
   * @param event_id イベントID
   * @returns イベント情報
   */
  public getEventData(event_id: string): Promise<DocumentSnapshot<i_event>> {
    return getDoc(getEventDocRef(this.db, event_id));
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

  /**
   * 現在/指定のユーザの自由時間を取得する
   * @param date 日付指定
   * @param user_id ユーザID
   * @returns 自由時間情報
   */
  public getCurrentUserFreetime(
    date: Date,
    user_id?: string
  ): Promise<Map<Date, DocumentReference<i_event> | null>> {
    return getDoc(
      getFreetimeDocRef(this.db, date, user_id ?? this.user_id)
    ).then((v) => {
      const d: i_freetime | undefined = v.data();
      if (!v.exists() || d == undefined)
        return Promise.reject("data does not exist");

      return this.toDateKeyMap(date, d.event);
    });
  }

  /**
   * すべてのユーザの自由時間情報を取得する
   * @param date 日付指定
   * @returns 自由時間情報群
   */
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

  /**
   * 自由時間情報を追加する
   * @param times 自由時間の配列
   * @returns 非同期実行用データ
   */
  public addFreetime(times: Array<Date>) {
    if (times.length <= 0) return Promise.reject("invalid time-count");

    return runTransaction(this.db, async (transaction) => {
      const doc_ref = getFreetimeDocRef(this.db, times[0], this.user_id);
      const remote_freetime = await transaction.get(doc_ref);

      const val = new Map<string, DocumentReference<i_event> | null>();
      times.forEach((v) => val.set(getJSTHHMM(v), null));

      const d = remote_freetime.data();
      if (remote_freetime.exists() && d != undefined)
        d.event.forEach((v, k) => val.set(k, v));

      return transaction.set(doc_ref, { event: val });
    });
  }

  /**
   * 自由時間情報を削除する
   * @param times 削除する自由時間の配列
   * @returns 非同期実行用データ
   */
  public removeFreetime(times: Array<Date>) {
    if (times.length <= 0) return Promise.reject("invalid time-count");

    return runTransaction(this.db, async (transaction) => {
      const doc_ref = getFreetimeDocRef(this.db, times[0], this.user_id);
      const remote_freetime = await transaction.get(doc_ref);
      const d = remote_freetime.data()?.event;

      if (!remote_freetime.exists() || d == undefined)
        return Promise.reject("nodata is in the remote");

      const elem_not_in_remote = new Array<string>();
      const elem_not_empty = new Array<string>();
      const elem_to_delete = new Array<string>();

      times.forEach((v) => {
        const time_str = getJSTHHMM(v);
        if (d.has(time_str)) {
          if (d.get(time_str) != null) elem_not_empty.push(time_str);
          else if (!elem_to_delete.includes(time_str))
            elem_to_delete.push(time_str);
        } else elem_not_in_remote.push(time_str);
      });

      let err_msg = "";
      if (elem_not_empty.length > 0) {
        err_msg += "ERR: Schedule is not empty...\n";
        elem_not_empty.forEach((v) => (err_msg += v + "\n"));
      }
      if (elem_not_in_remote.length > 0) {
        err_msg += "ERR: Schedule is not in remote...\n";
        elem_not_in_remote.forEach((v) => (err_msg += v + "\n"));
      }
      if (err_msg != "") return Promise.reject(err_msg);

      elem_to_delete.forEach((v) => d.delete(v));

      return transaction.set(doc_ref, { event: d });
    });
  }
  //#endregion
}
