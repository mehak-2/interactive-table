"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import * as XLSX from "xlsx";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface TableRowData {
  id: string;
  vendor: string;
  status: {
    text: string;
    type: "missing" | "ready" | "declined";
  };
  amount: number;
  poPiNumber: string;
  hasAttachment?: boolean;
  createdDate: string;
  initiatedBy: {
    avatarUrl: string;
    name: string;
    channel: string;
  };
}

interface Column {
  id: keyof TableRowData | "selectActions";
  label: string;
  width: number;
  isSticky?: boolean;
  disableDrag?: boolean;
  isSortable?: boolean;
  customRender?: (row: TableRowData) => React.ReactNode;
  responsiveHidden?: "sm" | "md" | "lg";
}

interface Config {
  columnWidths: Record<string, number>;
  columnOrder: string[];
  selectedRows: string[];
}

const initialTableData: TableRowData[] = [
  {
    id: "row1",
    vendor: "Alpha Corp",
    status: { text: "Ready", type: "ready" },
    amount: 15000,
    poPiNumber: "PO-000031",
    hasAttachment: true,
    createdDate: "10 Jan, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/FFC0CB/000000?text=SK",
      name: "Sarah K.",
      channel: "Via Email",
    },
  },
  {
    id: "row2",
    vendor: "Beta Solutions",
    status: { text: "Missing Items", type: "missing" },
    amount: 8500,
    poPiNumber: "PO-000032",
    hasAttachment: false,
    createdDate: "15 Jan, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/ADD8E6/000000?text=JM",
      name: "John M.",
      channel: "Via Portal",
    },
  },
  {
    id: "row3",
    vendor: "Gamma Inc",
    status: { text: "Declined", type: "declined" },
    amount: 22000,
    poPiNumber: "PO-000033",
    hasAttachment: true,
    createdDate: "01 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/90EE90/000000?text=LP",
      name: "Lisa P.",
      channel: "Via JIRA",
    },
  },
  {
    id: "row4",
    vendor: "Delta Co",
    status: { text: "Ready", type: "ready" },
    amount: 5000,
    poPiNumber: "PO-000034",
    hasAttachment: false,
    createdDate: "05 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/C7D2FE/374151?text=AJ",
      name: "Ankit Jain",
      channel: "Via JIRA",
    },
  },
  {
    id: "row5",
    vendor: "Epsilon Ltd",
    status: { text: "Missing Items", type: "missing" },
    amount: 12000,
    poPiNumber: "PO-000035",
    hasAttachment: true,
    createdDate: "10 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/FFFF00/000000?text=BD",
      name: "Bob D.",
      channel: "Via Email",
    },
  },
  {
    id: "row6",
    vendor: "Zeta LLC",
    status: { text: "Ready", type: "ready" },
    amount: 18000,
    poPiNumber: "PO-000036",
    createdDate: "12 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/FFA500/FFFFFF?text=CH",
      name: "Carol H.",
      channel: "Via Portal",
    },
  },
  {
    id: "row7",
    vendor: "Omega Group",
    status: { text: "Declined", type: "declined" },
    amount: 9500,
    poPiNumber: "PO-000037",
    hasAttachment: true,
    createdDate: "20 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/800080/FFFFFF?text=EM",
      name: "Eva M.",
      channel: "Via JIRA",
    },
  },
  {
    id: "row8",
    vendor: "Theta Industries",
    status: { text: "Missing Items", type: "missing" },
    amount: 11000,
    poPiNumber: "PO-000038",
    hasAttachment: true,
    createdDate: "21 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/A52A2A/FFFFFF?text=TD",
      name: "Tarun Daharwal",
      channel: "Via Email",
    },
  },
  {
    id: "row9",
    vendor: "Sigma Services",
    status: { text: "Ready", type: "ready" },
    amount: 7000,
    poPiNumber: "PO-000039",
    createdDate: "25 Feb, 2024",
    initiatedBy: {
      avatarUrl: "https://via.placeholder.com/32/00FFFF/000000?text=FG",
      name: "Fiona G.",
      channel: "Via Portal",
    },
  },
];

const initialColumnsConfig: Column[] = [
  {
    id: "selectActions",
    label: "",
    width: 50,
    isSticky: true,
    disableDrag: true,
  },
  { id: "vendor", label: "Vendor", width: 150, isSortable: true },
  { id: "status", label: "Status", width: 180, isSortable: true },
  { id: "amount", label: "Amount", width: 120, isSortable: true },
  {
    id: "poPiNumber",
    label: "PO/PI Number",
    width: 160,
    responsiveHidden: "md",
  },
  {
    id: "createdDate",
    label: "Created Date",
    width: 130,
    isSortable: true,
    responsiveHidden: "lg",
  },
  { id: "initiatedBy", label: "Initiated By", width: 200, isSortable: true },
];

const fetchConfig = async (): Promise<Config> => {
  return Promise.resolve({
    columnWidths: {},
    columnOrder: [],
    selectedRows: [],
  });
};
const saveConfigAPI = async (
  columnWidths: { [key: string]: number },
  columnOrder: string[],
  selectedRows: string[]
) => {
  console.log("Saving config:", { columnWidths, columnOrder, selectedRows });
};

const StatusIcon = ({ type }: { type: "missing" | "ready" | "declined" }) => {
  if (type === "missing")
    return (
      <span title="Missing" className="mr-1 text-xl">
        📄
      </span>
    );
  if (type === "ready")
    return (
      <span title="Ready" className="mr-1 text-green-600 text-xl">
        ✔️
      </span>
    );
  if (type === "declined")
    return (
      <span title="Declined" className="mr-1 text-red-600 text-xl">
        ✖️
      </span>
    );
  return null;
};

const PaperClipIcon = () => (
  <span className="ml-1 text-gray-500 text-lg">📎</span>
);

export default function TableComponent() {
  const [data, setData] = useState<TableRowData[]>(initialTableData);
  const [columns, setColumns] = useState<Column[]>(initialColumnsConfig);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableRowData | null;
    direction: "asc" | "desc";
  }>({ key: "amount", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);

  useEffect(() => {
    const sortedData = [...initialTableData];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (sortConfig.key === "createdDate") {
          const dateA = new Date(String(valA).replace(",", ""));
          const dateB = new Date(String(valB).replace(",", ""));
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return sortConfig.direction === "asc"
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          }
        }

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (
          sortConfig.key === "status" &&
          typeof valA === "object" &&
          typeof valB === "object" &&
          valA &&
          valB
        ) {
          const statusA = (valA as TableRowData["status"]).text;
          const statusB = (valB as TableRowData["status"]).text;
          return sortConfig.direction === "asc"
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        }
        if (
          sortConfig.key === "initiatedBy" &&
          typeof valA === "object" &&
          typeof valB === "object" &&
          valA &&
          valB
        ) {
          const nameA = (valA as TableRowData["initiatedBy"]).name;
          const nameB = (valB as TableRowData["initiatedBy"]).name;
          return sortConfig.direction === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        return 0;
      });
    }
    setData(sortedData);
  }, [sortConfig]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumnId) {
        setColumns((prevCols) =>
          prevCols.map((col) =>
            col.id === resizingColumnId
              ? { ...col, width: Math.max(50, col.width + e.movementX) }
              : col
          )
        );
      }
    };
    const handleMouseUp = () => {
      if (resizingColumnId) {
        const columnWidths = columns.reduce<Record<string, number>>(
          (acc, col) => {
            acc[col.id] = col.width;
            return acc;
          },
          {}
        );
        saveConfigAPI(
          columnWidths,
          columns.map((col) => col.id),
          Array.from(selectedRows)
        );
        setResizingColumnId(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumnId, columns, selectedRows]);

  useEffect(() => {
    const loadInitialConfig = async () => {
      const config = await fetchConfig();
      if (config) {
        if (
          config.columnWidths &&
          Object.keys(config.columnWidths).length > 0
        ) {
          setColumns((prevCols) =>
            prevCols.map((col) => ({
              ...col,
              width: config.columnWidths[col.id] || col.width,
            }))
          );
        }
        if (config.columnOrder && config.columnOrder.length > 0) {
          const serverOrder = config.columnOrder as string[];
          setColumns((prevCols) => {
            const colMap = new Map(prevCols.map((c) => [c.id, c]));
            const ordered = serverOrder
              .map((id) =>
                colMap.get(id as keyof TableRowData | "selectActions")
              )
              .filter(Boolean) as Column[];
            const existingIds = new Set(ordered.map((c) => c.id));
            const remaining = prevCols.filter((c) => !existingIds.has(c.id));
            return ordered.length > 0 ? [...ordered, ...remaining] : prevCols;
          });
        }
        if (config.selectedRows)
          setSelectedRows(new Set(config.selectedRows as string[]));
      }
    };
    loadInitialConfig();
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIdxInDraggable = result.source.index;
    const destIdxInDraggable = result.destination.index;
    const actualSourceIdx = sourceIdxInDraggable + 1;
    const actualDestIdx = destIdxInDraggable + 1;

    if (
      columns[actualSourceIdx]?.disableDrag ||
      columns[actualDestIdx]?.disableDrag ||
      actualDestIdx === 0
    ) {
      return;
    }
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(actualSourceIdx, 1);
    items.splice(actualDestIdx, 0, reorderedItem);
    setColumns(items);
    saveConfigAPI(
      items.reduce<Record<string, number>>((acc, col) => {
        acc[col.id] = col.width;
        return acc;
      }, {}),
      items.map((col) => col.id),
      Array.from(selectedRows)
    );
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    return data.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [data, currentPage, rowsPerPage]);

  const renderCellContent = (row: TableRowData, column: Column) => {
    const columnId = column.id;
    switch (columnId) {
      case "status":
        return (
          <div className="flex items-center">
            <StatusIcon type={row.status.type} /> {row.status.text}
          </div>
        );
      case "amount":
        return `₹${row.amount.toLocaleString("en-IN")}`;
      case "poPiNumber":
        return (
          <div className="flex items-center">
            {row.poPiNumber} {row.hasAttachment && <PaperClipIcon />}
          </div>
        );
      case "initiatedBy":
        return (
          <div className="flex items-center">
            <img
              src={
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              }
              alt={row.initiatedBy.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 object-cover"
            />
            <div>
              <div className="text-xs sm:text-sm font-medium">
                {row.initiatedBy.name}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                {row.initiatedBy.channel}
              </div>
            </div>
          </div>
        );
      default:
        if (columnId in row)
          return row[columnId as keyof TableRowData] as React.ReactNode;
        return null;
    }
  };

  const exportCurrentPageToExcel = () => {
    const dataToExport = paginatedData.map((row) => ({
      Vendor: row.vendor,
      Status: row.status.text,
      Amount: `₹${row.amount.toLocaleString("en-IN")}`,
      "PO/PI Number": row.poPiNumber,
      "Created Date": row.createdDate,
      "Initiated By": `${row.initiatedBy.name} (${row.initiatedBy.channel})`,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data_current_page.xlsx");
  };

  const exportSelectedToExcel = () => {
    if (selectedRows.size === 0) {
      alert("No rows selected to export.");
      return;
    }
    const selectedData = initialTableData.filter((row) =>
      selectedRows.has(row.id)
    );
    const dataToExport = selectedData.map((row) => ({
      Vendor: row.vendor,
      Status: row.status.text,
      Amount: `₹${row.amount.toLocaleString("en-IN")}`,
      "PO/PI Number": row.poPiNumber,
      "Created Date": row.createdDate,
      "Initiated By": `${row.initiatedBy.name} (${row.initiatedBy.channel})`,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data_selected.xlsx");
  };

  const isAllOnPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.has(row.id));

  const toggleSelectAllOnPage = () => {
    const newSelectedRows = new Set(selectedRows);
    const pageRowIds = paginatedData.map((row) => row.id);
    if (isAllOnPageSelected) {
      pageRowIds.forEach((id) => newSelectedRows.delete(id));
    } else {
      pageRowIds.forEach((id) => newSelectedRows.add(id));
    }
    setSelectedRows(newSelectedRows);
    saveConfigAPI(
      columns.reduce<Record<string, number>>((acc, col) => {
        acc[col.id] = col.width;
        return acc;
      }, {}),
      columns.map((col) => col.id),
      Array.from(newSelectedRows)
    );
  };

  const handleSort = (columnId: keyof TableRowData) => {
    setSortConfig((prevConfig) => ({
      key: columnId,
      direction:
        prevConfig.key === columnId && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const toggleSelectRow = (rowId: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowId)) newSelectedRows.delete(rowId);
    else newSelectedRows.add(rowId);
    setSelectedRows(newSelectedRows);
    saveConfigAPI(
      columns.reduce<Record<string, number>>((acc, col) => {
        acc[col.id] = col.width;
        return acc;
      }, {}),
      columns.map((col) => col.id),
      Array.from(newSelectedRows)
    );
  };

  const clearAllSelections = () => {
    setSelectedRows(new Set());
    saveConfigAPI(
      columns.reduce<Record<string, number>>((acc, col) => {
        acc[col.id] = col.width;
        return acc;
      }, {}),
      columns.map((col) => col.id),
      []
    );
  };

  const isDraggingDisabled = columns.length <= 1;

  const getResponsiveColumnClasses = (col: Column) => {
    let classes = "";
    if (col.responsiveHidden === "lg") classes += " hidden lg:table-cell";
    else if (col.responsiveHidden === "md") classes += " hidden md:table-cell";
    else if (col.responsiveHidden === "sm") classes += " hidden sm:table-cell";
    return classes;
  };

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <Card className="shadow-md rounded-lg border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="min-w-full w-full table-fixed border-collapse">
                <Droppable
                  droppableId="table-columns"
                  direction="horizontal"
                  type="COLUMN"
                  isDropDisabled={isDraggingDisabled}
                >
                  {(provided) => (
                    <thead ref={provided.innerRef} {...provided.droppableProps}>
                      <tr className="border-b bg-gray-50 dark:bg-gray-700">
                        <th
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-20 border-r dark:border-gray-600"
                          style={{
                            width: columns.length > 0 ? columns[0].width : 50,
                          }}
                        >
                          <Checkbox
                            checked={isAllOnPageSelected}
                            onCheckedChange={toggleSelectAllOnPage}
                            aria-label="Select all rows on current page"
                            className={
                              isAllOnPageSelected
                                ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-700"
                                : ""
                            }
                          />
                        </th>
                        {columns.slice(1).map((col, index) => (
                          <Draggable
                            key={col.id}
                            draggableId={col.id}
                            index={index}
                            isDragDisabled={col.disableDrag || col.isSticky}
                          >
                            {(providedDrag) => (
                              <th
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                className={`group px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider relative 
                                  ${
                                    col.isSticky
                                      ? "sticky bg-gray-50 dark:bg-gray-700 z-10 border-r dark:border-gray-600"
                                      : "bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600"
                                  } 
                                  ${col.isSortable ? "cursor-pointer" : ""}
                                  ${getResponsiveColumnClasses(col)}
                                `}
                                style={{
                                  ...providedDrag.draggableProps.style,
                                  width: col.width,
                                  left:
                                    col.isSticky &&
                                    columns.length > 0 &&
                                    columns[0]
                                      ? `${columns[0].width}px`
                                      : undefined,
                                }}
                                onClick={
                                  col.isSortable
                                    ? () =>
                                        handleSort(col.id as keyof TableRowData)
                                    : undefined
                                }
                              >
                                <div
                                  {...providedDrag.dragHandleProps}
                                  className="flex items-center justify-between"
                                >
                                  <span>{col.label}</span>
                                  {col.isSortable &&
                                    sortConfig.key === col.id && (
                                      <span className="ml-1 text-base">
                                        {sortConfig.direction === "asc"
                                          ? "︿"
                                          : "﹀"}
                                      </span>
                                    )}
                                </div>
                                {!col.isSticky && !col.disableDrag && (
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 group-hover:bg-blue-300 transition-opacity"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setResizingColumnId(col.id);
                                    }}
                                  />
                                )}
                              </th>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tr>
                    </thead>
                  )}
                </Droppable>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center p-4 text-gray-500 dark:text-gray-400"
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                  {paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      className={`group ${
                        selectedRows.has(row.id)
                          ? "bg-green-50 dark:bg-green-700/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <td
                        className={`px-3 py-2 whitespace-nowrap text-sm sticky left-0 z-10 border-r dark:border-gray-600
                          ${
                            selectedRows.has(row.id)
                              ? "bg-green-50 dark:bg-green-700/20"
                              : "bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700"
                          }`}
                      >
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={() => toggleSelectRow(row.id)}
                          className={
                            selectedRows.has(row.id)
                              ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-700"
                              : ""
                          }
                        />
                      </td>
                      {columns.slice(1).map((col) => (
                        <td
                          key={`${row.id}-${col.id}`}
                          className={`px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 
                            ${
                              col.isSticky
                                ? `sticky z-0 border-r dark:border-gray-600 ${
                                    selectedRows.has(row.id)
                                      ? "bg-green-50 dark:bg-green-700/20"
                                      : "bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700"
                                  }`
                                : ""
                            }
                            ${getResponsiveColumnClasses(col)}
                          `}
                          style={{
                            width: col.width,
                            left:
                              col.isSticky && columns.length > 0 && columns[0]
                                ? `${columns[0].width}px`
                                : undefined,
                          }}
                        >
                          {col.customRender
                            ? col.customRender(row)
                            : renderCellContent(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </DragDropContext>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 border-t bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
              variant="ghost"
              size="sm"
              className="p-1 hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            {selectedRows.size > 0 ? (
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {selectedRows.size} Item{selectedRows.size === 1 ? "" : "s"}{" "}
                Selected
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 h-5"></span> /* Placeholder for height consistency */
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportSelectedToExcel}
              disabled={selectedRows.size === 0}
              className="text-xs sm:text-sm dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600"
            >
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSelections}
              disabled={selectedRows.size === 0}
              className="text-xs sm:text-sm dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600"
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCurrentPageToExcel}
              className="text-xs sm:text-sm dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600"
            >
              Export Page
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                Show:
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 border rounded text-xs sm:text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {[7, 10, 15, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <Button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || totalPages === 0}
                variant="ghost"
                size="sm"
                className="p-1 sm:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                variant="ghost"
                size="sm"
                className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                variant="ghost"
                size="sm"
                className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="ghost"
                size="sm"
                className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
