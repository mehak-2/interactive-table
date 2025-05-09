"use client";

import dynamic from "next/dynamic";

const TableComponent = dynamic(() => import("./TableComponent"), {
  ssr: false,
});

export default function Page() {
  return <TableComponent />;
}
