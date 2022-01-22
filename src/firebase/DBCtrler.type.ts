import { DocumentReference, Timestamp } from "firebase/firestore";

interface i_event_tdate<TDate> {
  name: string;
  begin: TDate;
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

export interface i_freetime {
  event: Map<string, DocumentReference<i_event> | null>;
}
