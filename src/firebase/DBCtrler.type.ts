import { DocumentReference, Timestamp } from "firebase/firestore";

/** イベントデータの型 (Generics) */
interface i_event_tdate<TDate> {
  /** イベント名 */
  name: string;

  /** イベントの開始時刻 (JST) (開催日決定まではNULL) */
  begin: TDate | null;

  /** イベントの開催日 (JST) (開催日決定までは空文字列) */
  begindate: string;

  /** イベントの説明 */
  description: string;

  /** イベントのオーナー */
  owner: DocumentReference<i_user>;

  /** イベントの挑戦者 (決定まではNULL) */
  challenger: DocumentReference<i_user> | null;

  /** イベント作成日 */
  createddate: TDate;
}

/** イベントデータの型 (Client Side) */
export type i_event = i_event_tdate<Date>;

/** イベントデータの型 (Server Side) */
export type i_event_sv = i_event_tdate<Timestamp>;

/** ユーザデータの型 */
export interface i_user {
  /** 表示名 */
  displayname: string;

  /** アイコンファイルへのURL */
  icon: string;

  /** 勝ち数 */
  win: number;

  /** 負け数 */
  lose: number;

  /** 引き分け数 */
  draw: number;
}

/** 自由時間Documentの型 (Generic) */
interface i_freetime_tevent<TEvent> {
  /** 自由時間ごとのイベント登録状態 (NULLで未登録 / Refで登録済み) */
  event: TEvent;
}

export type event_ref_type = DocumentReference<i_event> | null;
/** 自由時間データの辞書型 */
export type t_freetime_dic = { [hhmm: string]: event_ref_type };
/** 自由時間Docの型 (Client Side) */
export type i_freetime = i_freetime_tevent<Map<string, event_ref_type>>;
/** 自由時間Docの型 (Server Side) */
export type i_freetime_sv = i_freetime_tevent<t_freetime_dic>;
