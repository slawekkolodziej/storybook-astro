import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(1);

  return (
    <div>
      React counter: {count}
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default Counter;
