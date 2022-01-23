import {
  i_event,
  i_event_sv,
  i_freetime,
  i_freetime_sv,
  i_user,
  event_ref_type,
} from "./DBCtrler.type";

import { doc, FirestoreDataConverter } from "firebase/firestore";
import { isMap } from "util/types";

/** イベントデータについて, Firebaseとの型変換を行う */
export const i_event_conv: FirestoreDataConverter<i_event> = {
  /** Firebaseに送るデータに変換する */
  toFirestore: (jsData) => {
    return {
      name: jsData.name,
      begin: jsData.begin,
      begindate: jsData.begindate,
      description: jsData.description,
      owner: jsData.owner,
      challenger: jsData.challenger,
      createddate: jsData.createddate,
    };
  },

  /** Firebaseから受信したデータをi_event型に変換する */
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_event_sv | undefined;
    return {
      name: d?.name ?? "",
      begin: d?.begin?.toDate() ?? null,
      begindate: d?.begindate ?? "",
      description: d?.description ?? "",
      owner: doc(
        d?.owner.firestore ?? ss.ref.firestore,
        d?.owner.path ?? ""
      ).withConverter(i_user_conv),
      challenger:
        d?.challenger == null
          ? null
          : doc(d.challenger.firestore, d.challenger.path).withConverter(
            i_user_conv
          ),
      createddate: d?.createddate.toDate() ?? new Date(),
    };
  },
};

/** ユーザデータについて, Firebaseとの型変換を行う */
export const i_user_conv: FirestoreDataConverter<i_user> = {
  /** Firebaseに送るデータに変換する */
  toFirestore: (jsData) => {
    return {
      displayname: jsData.displayname,
      icon: jsData.icon,
      win: jsData.win,
      lose: jsData.lose,
      draw: jsData.draw,
    };
  },

  /** Firebaseから送られてきたデータをi_user型に変換する */
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_user;
    return d;
  },
};

/** 自由時間データについて, Firebaseとの型変換を行う */
export const i_freetime_conv: FirestoreDataConverter<i_freetime> = {
  /** Firebaseに送るデータに変換する */
  toFirestore: (jsData) => {
    return {
      // eventには`undefined`等が入る可能性もあるため, その場合にはその値をそのまま渡すようにする
      event: isMap(jsData.event)
        ? Object.fromEntries(jsData.event)
        : jsData.event,
    };
  },

  /** Firebaseから受信したデータをi_freetime型に変換する */
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_freetime_sv;
    return {
      event: new Map<string, event_ref_type>(Object.entries(d.event)),
    };
  },
};
