import { createSignal } from 'solid-js';

const Counter = () => {
  const [count, setCount] = createSignal(1);

  return (
    <div>
      Solid counter: {count()}
      <button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        +1
      </button>
    </div>
  );
};

export default Counter;
