import { FormEvent, useState } from "react";
import { Layout } from "../Layout/Layout";
import style from "./reserve.module.scss";
import { DBCtrler } from "../../firebase/DBCtrler";
import { FirebaseCredential } from "../../firebase/FirebaseCredential";

export const ReserveContent = () => {
  const [event, setEvent] = useState<string[]>([]);
  const handleInputChange = (e: { target: HTMLInputElement }) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    setEvent({ ...event, [name]: value });
  };

  const date = new Date();
  const firestore = new FirebaseCredential().firestore;
  const db = new DBCtrler(firestore);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    db.createEvent("name", date, "description").catch((e) => console.log(e));
    console.log(date);
  };

  return (
    <Layout>
      <div className={style.wrapper}>
        <form className={style.form}>
          <h3>イベントを作成しましょう！</h3>
          <table>
            <tbody>

              <tr>
                <th>
                  <label htmlFor="name">議題名</label>
                </th>
                <td>
                  <input type="text" id="name" onChange={handleInputChange} />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="description">内容説明</label>
                </th>
                <td>
                  <textarea id="description" />
                </td>
              </tr>
            </tbody>
          </table>
          <div className={style.btnWrapper}>
            <button className={style.button} onClick={handleSubmit}>確定</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
