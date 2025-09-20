import React from "react";
import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { DeleteIcon, EditIcon } from "@/components/form/Icons";
import { Button } from "@/components/ui/Button";

type SnapshotItem = Record<string, unknown>;

type ModifyStatusHandler = (
  item: SnapshotItem,
  type: "tinkering" | "competition" | "courses"
) => void;
type EditTinkeringHandler = (item: SnapshotItem) => void;
type DeleteTinkeringHandler = (item: SnapshotItem) => void;

export function getTinkeringActivityColumns(
  handleModifyStatus: ModifyStatusHandler,
  handleEditTinkeringActivity: EditTinkeringHandler,
  handleDeleteTinkeringActivity: DeleteTinkeringHandler
): GridColDef[] {
  return [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    {
      field: "name",
      headerName: "Activity Name",
      width: 200,
      renderCell: (params) => params.value ?? "N/A",
    },
    {
      field: "introduction",
      headerName: "Introduction",
      width: 200,
      renderCell: (params) => params.value ?? "N/A",
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 200,
      renderCell: (params) => params.row?.comments ?? "",
    },
    {
      field: "subject",
      headerName: "Subject",
      width: 150,
      renderCell: (params) =>
        params.row?.subtopic?.topic?.subject?.subject_name ?? "N/A",
    },
    {
      field: "topic",
      headerName: "Topic",
      width: 150,
      renderCell: (params) => params.row?.subtopic?.topic?.topic_name ?? "N/A",
    },
    {
      field: "subtopic",
      headerName: "Subtopic",
      width: 150,
      renderCell: (params) => params.row?.subtopic?.subtopic_name ?? "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 300,
      renderCell: (params) =>
        Array.isArray(params.row?.status) && params.row.status.length > 0
          ? params.row.status[params.row.status.length - 1]
          : "N/A",
    },

    { field: "goals", headerName: "Goals", width: 200 },

    { field: "materials", headerName: "Materials", width: 200 },
    { field: "instructions", headerName: "Instructions", width: 200 },
    { field: "tips", headerName: "Tips", width: 200 },
    { field: "observations", headerName: "Observations", width: 200 },
    { field: "resources", headerName: "Resourses", width: 200 },
    { field: "extensions", headerName: "Extensions", width: 200 },

    {
      field: "tinkering_actions",
      headerName: "Actions",
      type: "actions",
      width: 200,
      renderCell: (params) => (
        <div
          className="flex items-center justify-center space-x-2 w-full h-full"
          key="tinkering-actions"
        >
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, "tinkering");
            }}
          >
            Modify status
          </Button>

          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTinkeringActivity(params.row);
            }}
            showInMenu={false}
          />

          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTinkeringActivity(params.row);
            }}
            showInMenu={false}
          />
        </div>
      ),
    },
  ];
}