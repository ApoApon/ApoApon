import { DocumentReference, Timestamp } from "firebase/firestore";

interface i_event_tdate<TDate> {
  name: string;
  begin: TDate | null;
  begindate: string;
  description: string;
  owner: DocumentReference<i_user>;
  challenger: DocumentReference<i_user> | null;
  createddate: TDate;
}
export type i_event = i_event_tdate<Date>;
export type i_event_sv = i_event_tdate<Timestamp>;

export interface i_user {
  displayname: string;
  icon: string;
  win: number;
  lose: number;
  draw: number;
}

interface i_freetime_tevent<TEvent> {
  event: TEvent;
}

export type event_ref_type = DocumentReference<i_event> | null;
export type t_freetime_dic = { [hhmm: string]: event_ref_type };
export type i_freetime = i_freetime_tevent<Map<string, event_ref_type>>;
export type i_freetime_sv = i_freetime_tevent<t_freetime_dic>;
