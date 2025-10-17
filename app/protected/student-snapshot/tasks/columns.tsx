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
  formatDate: Formatter
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
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
  valueGetter: (params: any) => (params.row.description ?? ""),
    },
    {
      field: "createdBy",
      headerName: "Created By",
      minWidth: 200,
  valueGetter: (params: any) => params.row.createdBy?.email ?? "",
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
  valueGetter: (params: any) => formatDate(params.row.dueDate),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 160,
      getActions: (params) => {
        const row = (params as any).row as TaskSnapshotRow;
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
