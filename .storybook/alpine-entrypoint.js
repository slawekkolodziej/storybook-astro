export default function setup(Alpine) {
  const originalStart = Alpine.start.bind(Alpine);
  let hasStarted = false;

  Alpine.start = function start() {
    if (!hasStarted) {
      hasStarted = true;
      originalStart();
    }
  };

  Object.defineProperty(Alpine, '_isStarted', {
    get() {
      return hasStarted;
    }
  });
}
