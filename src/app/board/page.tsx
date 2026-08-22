"use client";
import { updateImageUser } from "@/actions/actions";
import { cloudinary } from "@/libs/cloudinary";
import { MouseEvent, SubmitEvent, useState } from "react";

const BoardsPage = () => {
  const [count, setCount] = useState(0);
  const onSubmitImage = (e: SubmitEvent<HTMLFormElement>) => {


  }
  return (
    <form onSubmit={onSubmitImage}>
      <button
        type="submit"
        className="default-btn px-4 py-2 rounded-sm"

      >
        Click me
      </button>
      <span>{count}</span>
      <Child />
    </form>
  );
};

function Child() {
  return <div>Oi</div>;
}

export default BoardsPage;
