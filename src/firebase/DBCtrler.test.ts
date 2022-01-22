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

function testRunner(
  testFunc: (testEnv: RulesTestEnvironment) => Promise<unknown>
) {
  return () =>
    getTestEnv().then((v) =>
      testFunc(v).finally(() => {
        v.cleanup().catch(console.warn);
      })
    );
}

test(
  "UserCreate Test",
  testRunner(async (env: RulesTestEnvironment) => {
    const ctx_owner = env.authenticatedContext(TEST_USER_OWNER_ID);
    const ctx_challenger = env.authenticatedContext(TEST_USER_OWNER_ID);
    const db_owner = new DBCtrler(ctx_owner.firestore());
    const db_challenger = new DBCtrler(ctx_challenger.firestore());
    await db_owner.addUser(
      TEST_USER_CHALLENGER_NAME,
      TEST_USER_CHALLENGER_ICON,
      TEST_USER_CHALLENGER_ID
    );
    await db_challenger.addUser(
      TEST_USER_OWNER_NAME,
      TEST_USER_OWNER_ICON,
      TEST_USER_OWNER_ID
    );

    const got_data_owner = await db_owner.getUser(TEST_USER_OWNER_ID);
    const got_data_challenger = await db_challenger.getUser(
      TEST_USER_CHALLENGER_ID
    );

    expect(got_data_owner).toStrictEqual(TEST_USER_OWNER_DATA_EXCEPTED);
    expect(got_data_challenger).toStrictEqual(
      TEST_USER_CHALLENGER_DATA_EXCEPTED
    );

    await db_challenger.deleteUser(TEST_USER_CHALLENGER_ID);
    await db_owner.deleteUser(TEST_USER_OWNER_ID);
  })
);

test(
  "EventTest",
  testRunner(async (env: RulesTestEnvironment) => {
    const ctx_owner = env.authenticatedContext(TEST_USER_OWNER_ID);
    const ctx_challenger = env.authenticatedContext(TEST_USER_OWNER_ID);
    const db_owner = new DBCtrler(ctx_owner.firestore());
    const db_challenger = new DBCtrler(ctx_challenger.firestore());
    await db_owner.addUser(
      TEST_USER_CHALLENGER_NAME,
      TEST_USER_CHALLENGER_ICON,
      TEST_USER_CHALLENGER_ID
    );
    await db_challenger.addUser(
      TEST_USER_OWNER_NAME,
      TEST_USER_OWNER_ICON,
      TEST_USER_OWNER_ID
    );

    const bg = moment().tz("Asia/Tokyo");
    const begin = bg.minute((1 + Math.floor(bg.minute() / 30)) * 30).toDate();
    const begindate = bg.format("YYYY-MM-DD");

    db_owner.user_id = TEST_USER_OWNER_ID;
    db_challenger.user_id = TEST_USER_CHALLENGER_ID;

    await db_owner.addFreetime([begin]);
    await db_challenger.addFreetime([begin]);

    const description = `gen : ${Date()}`;
    const ev_name = "test event";
    const create_event_result = await db_owner.createEvent(
      ev_name,
      begin,
      description
    );
    expect(create_event_result).not.toEqual("");

    const expected_event_data: i_event = {
      begin: begin,
      begindate: begindate,
      challenger: null,
      description: description,
      name: ev_name,
      owner: db_owner._getUserDocRef(TEST_USER_OWNER_ID),
      createddate: new Date(),
    };

    const actual_ev_data = await db_owner.getEventData(create_event_result);
    expected_event_data.createddate =
      actual_ev_data.data()?.createddate ?? new Date();
    expect(actual_ev_data.data()).toStrictEqual(expected_event_data);

    expect(
      await db_challenger.challengeToEvent(begin, create_event_result)
    ).toBe(true);

    expected_event_data.owner =
      db_challenger._getUserDocRef(TEST_USER_OWNER_ID);
    expected_event_data.challenger = db_challenger._getUserDocRef(
      TEST_USER_CHALLENGER_ID
    );
    expect(
      (await db_challenger.getEventData(create_event_result)).data()
    ).toStrictEqual(expected_event_data);

    await db_challenger.deleteUser(TEST_USER_CHALLENGER_ID);
    await db_owner.deleteUser(TEST_USER_OWNER_ID);
  })
);
