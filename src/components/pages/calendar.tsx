import {useState, useCallback} from "react";
import FullCalendar, {DateSelectArg, EventApi, EventClickArg, EventContentArg, DayCellContentArg} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { INITIAL_EVENTS, createEventId } from "./event_utils";
import timeGridPlugin from "@fullcalendar/timegrid";
import Sidebar from "./saidbar";
import listPlugin from "@fullcalendar/list";
// import { Calendar } from '@fullcalendar/core';
// import googleCalendarPlugin from '@fullcalendar/google-calendar';




const CalendarDate = () => {
  // イベントオブジェクトを取得している。
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const handleEvents = useCallback(
    (events: EventApi[]) => setCurrentEvents(events),
    []
  );

  // 予定を入力できるようにしている。
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const title = prompt("イベントのタイトルを入力してください")?.trim();
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  }, []);

  // 予定を削除する
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (
      window.confirm(`この「${clickInfo.event.title}」を削除しますか`)
    ) {
      clickInfo.event.remove();
    }
  }, []);

  // イベントの要素を変える
  const rendarEventContent = (eventContent: EventContentArg) => (
    <>
      <b>{eventContent.timeText}</b>
      <i>{eventContent.event.title}</i>
    </>
  );

  // 週末を表示するかどうか真偽値
  const [weekendsVisible, setWeekendsVisible] = useState(true);

  const handleWeekendsToggle = useCallback(
    () => setWeekendsVisible(!weekendsVisible),
    [weekendsVisible]
  );

  return (
    <div className="calendar-app">
      <div className="calendar-app-main">
        <Sidebar
          toggleWeekends={handleWeekendsToggle}
          weekendsVisible={weekendsVisible}
          currentEvents={currentEvents}
        />
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          // , googleCalendarPlugin
          // googleCalendarApiKey:"<AIzaSyB4VWEPqqEobljfWN4JUdD69ntOEjxPA_A>"
          // events: {
          //   googleCalendarId: 'philosophia268@gmail.com'
          // }
          initialView="dayGridMonth"
          selectable={true}
          editable={true}
          initialEvents={INITIAL_EVENTS}
          locales={allLocales}
          locale="ja"
          eventsSet={handleEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={rendarEventContent}
          headerToolbar={{
            start:"prev, next today",
            center:"title",
            end:"dayGridMonth, timeGridWeek, timeGridDay, listMonth",
          }}
          navLinks={true}
          weekends={weekendsVisible}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
          slotLabelFormat={[{ hour: "2-digit", minute: "2-digit" }]}
          nowIndicator={true}
          dayCellContent={(event: DayCellContentArg) => (
            event.dayNumberText = event.dayNumberText.replace("日", "")
          )}
        />
      </div>
    </div>
  );
};
export default CalendarDate;