"use client";
import { redirect } from "next/navigation";

const BoardsPage = () => {
  console.log("Redirecionando para a página home")
  redirect("/home");
  return (
    <></>
  )
};

export default BoardsPage;
