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

export const i_event_conv: FirestoreDataConverter<i_event> = {
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
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_event_sv | undefined;
    return {
      name: d?.name ?? "",
      begin: d?.begin.toDate() ?? new Date(),
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

export const i_user_conv: FirestoreDataConverter<i_user> = {
  toFirestore: (jsData) => {
    return {
      displayname: jsData.displayname,
      icon: jsData.icon,
      win: jsData.win,
      lose: jsData.lose,
      draw: jsData.draw,
    };
  },
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_user;
    return d;
  },
};

export const i_freetime_conv: FirestoreDataConverter<i_freetime> = {
  toFirestore: (jsData) => {
    return {
      event: isMap(jsData.event)
        ? Object.fromEntries(jsData.event)
        : jsData.event,
    };
  },
  fromFirestore: (ss, opt) => {
    const d = ss.data(opt) as i_freetime_sv;
    return {
      event: new Map<string, event_ref_type>(Object.entries(d.event)),
    };
  },
};
