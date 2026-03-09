import React, { useMemo, useState } from 'react';

const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const week = ['D','S','T','Q','Q','S','S'];

export const CalendarYear = ({ events = [] }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = new Date(ev.starts_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = map[key] || [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const months = useMemo(() => {
    const arr = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1);
      const firstDay = first.getDay();
      const lastDate = new Date(year, m + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < firstDay; i++) cells.push(null);
      for (let d = 1; d <= lastDate; d++) cells.push(new Date(year, m, d));
      arr.push({ m, cells });
    }
    return arr;
  }, [year]);

  return (
    <div>
      <div className="flex align-items-center justify-content-between mb-2">
        <button className="p-button p-button-text" onClick={() => setYear(y => y - 1)}>&laquo; {year - 1}</button>
        <h4 className="m-0">{year}</h4>
        <button className="p-button p-button-text" onClick={() => setYear(y => y + 1)}>{year + 1} &raquo;</button>
      </div>

      <div className="grid">
        {months.map(({ m, cells }) => (
          <div key={m} className="col-12 md:col-6 lg:col-4">
            <div className="p-2 border-1 surface-border border-round">
              <div className="text-center font-bold mb-2">{monthNames[m]}</div>
              <div className="grid">
                {week.map((w, i) => (
                  <div key={i} className="col text-center text-600">{w}</div>
                ))}
              </div>
              <div className="flex flex-wrap">
                {cells.map((d, i) => {
                  const key = d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : `x-${i}`;
                  const todays = d ? (eventsByDay[key] || []) : [];
                  return (
                    <div key={key} style={{ width: '14.28%', padding: 2 }}>
                      <div className="border-1 surface-border p-1 text-center" style={{ minHeight: 32, borderRadius: 6 }}>
                        {d && (
                          <>
                            <div className="text-700" style={{ fontSize: 11 }}>{d.getDate()}</div>
                            {todays.length > 0 && (
                              <div style={{ marginTop: 2 }}>
                                {todays.slice(0, 2).map(ev => (
                                  <div key={ev.id} style={{ height: 5, borderRadius: 3, background: '#16a34a', margin: '1px 2px' }} />
                                ))}
                                {todays.length > 2 && <div className="text-600" style={{ fontSize: 9 }}>+{todays.length - 2}</div>}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarYear;
``