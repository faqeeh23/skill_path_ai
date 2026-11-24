import { useEffect, useRef } from "react";
export function useDelay() {
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn, ms = 650) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
}
