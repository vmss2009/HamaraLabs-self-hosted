import React from "react";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";

export type TaskSnapshotRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  createdBy: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
};

type StatusHandler = (
  task: TaskSnapshotRow,
  status: "IN_PROGRESS" | "COMPLETED"
) => void | Promise<void>;

type Formatter = (value: string | null) => string;

export function getTaskColumns(
  handleStatusChange: StatusHandler,
  formatDate: Formatter,
  clampStyle?: React.CSSProperties
): GridColDef[] {
  return [
    {
      field: "id",
      headerName: "S.No",
      width: 80,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 180,
      renderCell: (params) =>
        clampStyle ? <span style={clampStyle}>{params.value ?? ""}</span> : (params.value ?? ""),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => {
        const val = params.row.description ?? "";
        return clampStyle ? <span style={clampStyle}>{val}</span> : val;
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      minWidth: 200,
      renderCell: (params: any) => {
        const val = params.row.createdBy?.email ?? "";
        return clampStyle ? <span style={clampStyle}>{val}</span> : val;
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      minWidth: 140,
      valueGetter: (value, row) => formatDate(row.dueDate),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 160,
      getActions: (params) => {
        const row = params.row as TaskSnapshotRow;
        const status = row.status;
        if (status === "COMPLETED") {
          return [
            <GridActionsCellItem
              key="reopen"
              label="Reopen"
              showInMenu={false}
              onClick={(event) => {
                event.stopPropagation();
                handleStatusChange(row, "IN_PROGRESS");
              }}
              icon={<span className="text-sm font-semibold text-blue-600">Reopen</span>}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="complete"
            label="Mark complete"
            showInMenu={false}
            onClick={(event) => {
              event.stopPropagation();
              handleStatusChange(row, "COMPLETED");
            }}
            icon={<span className="text-sm font-semibold text-green-600">Done</span>}
          />,
        ];
      },
    },
  ];
}
