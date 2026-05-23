"use client";
import { useState } from "react";

const BoardsPage = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <button
        className="default-btn px-4 py-2 rounded-sm"
        onClick={() => setCount((prev) => prev + 1)}
      >
        Click me
      </button>
      <span>{count}</span>
      <Child />
    </>
  );
};

function Child() {
  return <div>Oi</div>;
}

export default BoardsPage;
