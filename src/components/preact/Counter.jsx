import { useState } from 'preact/hooks';

function Counter() {
  const [count, setCount] = useState(1);
  return (
    <div>
      Preact counter: {count}
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default Counter;