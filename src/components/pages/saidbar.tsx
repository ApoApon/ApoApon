/* eslint-disable react/prop-types */
import {EventApi} from "@fullcalendar/react"; 
// , formatDate
interface Props {
  currentEvents:EventApi[];
  toggleWeekends:() => void;
  weekendsVisible:boolean;
}

// // 予定一覧の関数
// const rendarSidebarEvent = (event: EventApi) => (
//   <li key={event.id}>
//     <b>
//       {formatDate(event.start!, {
//         year:"numeric",
//         month:"short",
//         day:"numeric",
//         locale:"ja",
//       })}
//     </b>
//     <i>{ event.title }</i>
//   </li>
// );

// eslint-disable-next-line react/prop-types
const Sidebar:React.VFC<Props> = ({ toggleWeekends, weekendsVisible}) => (
  // , currentEvents 
  <div className="calendar-app-sidebar">
    <div className="calendar-app-sidebar-section">
      <h2>使い方</h2>
      <ul>
        <li>空いてる時間を選んでイベント作成</li>
        <li>ドラッグ&amp;ドロップで直感操作できる!</li>
        <li>クリックでイベント削除</li>
      </ul>
    </div>
    <div className="calendar-app-sidebar-section">
      <label>
        <input
          type="checkbox"
          checked={weekendsVisible}
          onChange={toggleWeekends}
        />
        週末表示
      </label>
    </div>
    <div className="calendar-app-sidebar-section">
      {/* <h2>予定一覧({currentEvents.length})</h2>
      <ul>{currentEvents.map(rendarSidebarEvent)}</ul> */}
    </div>
  </div>
);


export default Sidebar;
