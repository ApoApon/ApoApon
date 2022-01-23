import { DBCtrler } from "./DBCtrler";
import { i_event, i_user } from "./DBCtrler.type";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import moment from "moment-timezone";

const TEST_USER_OWNER_ID = "OWNER";
const TEST_USER_OWNER_NAME = "Name:Owner";
const TEST_USER_OWNER_ICON = "https://twitter.com";
const TEST_USER_OWNER_DATA_EXCEPTED: i_user = {
  displayname: TEST_USER_OWNER_NAME,
  icon: TEST_USER_OWNER_ICON,
  draw: 0,
  lose: 0,
  win: 0,
};

const TEST_USER_CHALLENGER_ID = "CHALLENGER";
const TEST_USER_CHALLENGER_NAME = "Name:Challenger";
const TEST_USER_CHALLENGER_ICON = "https://twitter.com";
const TEST_USER_CHALLENGER_DATA_EXCEPTED: i_user = {
  displayname: TEST_USER_CHALLENGER_NAME,
  icon: TEST_USER_CHALLENGER_ICON,
  draw: 0,
  lose: 0,
  win: 0,
};

jest.setTimeout(3000);

/**
 * テスト用の実行環境情報を生成する
 * @param projectId 使用するプロジェクトID
 * @returns テスト環境情報
 */
function getTestEnv(projectId?: string): Promise<RulesTestEnvironment> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return initializeTestEnvironment({
    projectId:
      "demo-" +
      (projectId ?? Math.floor(Math.random() * Math.pow(10, 8)).toString()),
    firestore: {
      host: "localhost",
      port: 8080,
      rules: "",
    },
  });
}

/**
 * テスト実行を行う「処理」を返す
 * @param testFunc テストの本体
 * @returns テストを行う「処理」
 */
function testRunner(
  testFunc: (testEnv: RulesTestEnvironment) => Promise<unknown>
) {
  return () =>
    getTestEnv().then((v) =>
      testFunc(v).finally(() => {
        // 最終的にテスト環境は破棄する
        v.cleanup().catch(console.warn);
      })
    );
}

/** ユーザの作成 -> 取得 -> 削除のみをテストする */
test(
  "UserCreate Test",
  testRunner(async (env: RulesTestEnvironment) => {
    const ctx_owner = env.authenticatedContext(TEST_USER_OWNER_ID);
    const ctx_challenger = env.authenticatedContext(TEST_USER_OWNER_ID);
    const db_owner = new DBCtrler(ctx_owner.firestore());
    const db_challenger = new DBCtrler(ctx_challenger.firestore());

    // ユーザを追加する
    await db_challenger.addUser(
      TEST_USER_CHALLENGER_NAME,
      TEST_USER_CHALLENGER_ICON,
      TEST_USER_CHALLENGER_ID
    );
    await db_owner.addUser(
      TEST_USER_OWNER_NAME,
      TEST_USER_OWNER_ICON,
      TEST_USER_OWNER_ID
    );

    // ユーザデータを取得する
    const got_data_owner = await db_owner.getUser(TEST_USER_OWNER_ID);
    const got_data_challenger = await db_challenger.getUser(
      TEST_USER_CHALLENGER_ID
    );

    expect(got_data_owner).toStrictEqual(TEST_USER_OWNER_DATA_EXCEPTED);
    expect(got_data_challenger).toStrictEqual(
      TEST_USER_CHALLENGER_DATA_EXCEPTED
    );

    // ユーザを削除する
    await db_challenger.deleteUser(TEST_USER_CHALLENGER_ID);
    await db_owner.deleteUser(TEST_USER_OWNER_ID);
  })
);

/** イベントの作成 -> 自由時間追加 -> イベント取得 -> 挑戦登録をテストする */
test(
  "EventTest",
  testRunner(async (env: RulesTestEnvironment) => {
    const ctx_owner = env.authenticatedContext(TEST_USER_OWNER_ID);
    const ctx_challenger = env.authenticatedContext(TEST_USER_OWNER_ID);
    const db_owner = new DBCtrler(ctx_owner.firestore());
    const db_challenger = new DBCtrler(ctx_challenger.firestore());

    await db_challenger.addUser(
      TEST_USER_CHALLENGER_NAME,
      TEST_USER_CHALLENGER_ICON,
      TEST_USER_CHALLENGER_ID
    );
    await db_owner.addUser(
      TEST_USER_OWNER_NAME,
      TEST_USER_OWNER_ICON,
      TEST_USER_OWNER_ID
    );

    // 開始時間設定を生成する
    const bg = moment().tz("Asia/Tokyo");
    const begin = bg.minute((1 + Math.floor(bg.minute() / 30)) * 30).toDate();
    const begindate = bg.format("YYYY-MM-DD");

    db_owner.user_id = TEST_USER_OWNER_ID;
    db_challenger.user_id = TEST_USER_CHALLENGER_ID;

    // 自由に使える時間を追加する
    await db_owner.addFreetime([begin]);
    await db_challenger.addFreetime([begin]);

    // イベントを新規作成する
    const description = `gen : ${Date()}`;
    const ev_name = "test event";
    const create_event_result = await db_owner.createEvent(
      ev_name,
      description
    );
    expect(create_event_result).not.toEqual("");

    /** 期待されるイベントデータの中身 */
    const expected_event_data: i_event = {
      begin: null,
      begindate: "",
      challenger: null,
      description: description,
      name: ev_name,
      owner: db_owner._getUserDocRef(TEST_USER_OWNER_ID),
      createddate: new Date(),
    };

    // イベントデータを取得する
    const actual_ev_data = await db_owner.getEventData(create_event_result);
    expected_event_data.createddate =
      actual_ev_data.data()?.createddate ?? new Date();
    expect(actual_ev_data.data()).toStrictEqual(expected_event_data);

    // イベントに挑戦登録する
    expect(
      await db_challenger.challengeToEvent(begin, create_event_result)
    ).toBe(true);

    expected_event_data.owner =
      db_challenger._getUserDocRef(TEST_USER_OWNER_ID);
    expected_event_data.begin = begin;
    expected_event_data.begindate = begindate;

    expected_event_data.challenger = db_challenger._getUserDocRef(
      TEST_USER_CHALLENGER_ID
    );

    // 挑戦登録以降のイベントデータを取得し, 正常に挑戦登録ができているか確認する
    expect(
      (await db_challenger.getEventData(create_event_result)).data()
    ).toStrictEqual(expected_event_data);

    // ユーザの削除を行う
    await db_challenger.deleteUser(TEST_USER_CHALLENGER_ID);
    await db_owner.deleteUser(TEST_USER_OWNER_ID);
  })
);
