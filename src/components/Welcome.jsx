import { useState } from 'react';

function Welcome() {
  const [count, setCount] = useState(1);
  return (
    <div>
      Welcome from React! {count}
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default Welcome;
