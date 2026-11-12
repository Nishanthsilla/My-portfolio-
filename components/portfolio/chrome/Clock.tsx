"use client";

import { useEffect, useState } from "react";

const fmt = () => {
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
  } catch {
    return "--:--";
  }
};

/** Live Hyderabad clock, refreshed every 15s as in the original. */
export default function Clock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => setTime(fmt());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return (
    <div className="clock">
      <span className="dot" aria-hidden="true"></span>
      <span>HYD <span id="time">{time}</span></span>
    </div>
  );
}
