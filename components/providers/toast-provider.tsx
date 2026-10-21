"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="!rounded-2xl !border !border-zinc-800 !bg-zinc-900 !text-white !shadow-2xl"
      progressClassName="!bg-emerald-400"
    />
  );
}