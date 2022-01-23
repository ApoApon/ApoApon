import { FormEvent } from "react";
import { Layout } from "../Layout/Layout";
import style from "./reserve.module.scss";
import { DBCtrler } from "../../firebase/DBCtrler";
import { FirebaseCredential } from "../../firebase/FirebaseCredential";

export const ReserveContent = () => {
  const firestore = new FirebaseCredential().firestore;
  const db = new DBCtrler(firestore);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    db.createEvent("name", "description").catch((e) => console.log(e));
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
                  <input type="text" id="name" />
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
            <button className={style.button} onClick={handleSubmit}>
              確定
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
