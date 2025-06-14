import React from "react";
import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button } from "@/components/ui/Button";

type ModifyStatusHandler = (
  item: any,
  type: "tinkering" | "competition" | "courses"
) => void;
type DeleteCompetitionHandler = (competition: any) => void;

export function getCompetitionColumns(
  handleModifyStatus: ModifyStatusHandler,
  handleDeleteCompetition: DeleteCompetitionHandler
): GridColDef[] {
  return [
    {
      field: "id",
      headerName: "S.No",
      width: 100,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },

    {
      field: "competition_actions",
      headerName: "Competition",
      width: 200,
      renderCell: (params) => params.row?.competition?.name ?? "N/A",
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,
      renderCell: (params) => params.row?.competition?.description ?? "N/A",
    },

    {
      field: "organised_by",
      headerName: "Organised By",
      width: 180,
      renderCell: (params) => params.row?.competition?.organised_by ?? "N/A",
    },

    {
      field: "status",
      headerName: "Status",
      width: 300,
      renderCell: (params) => {
        const statusArray = params.row?.status;
        return Array.isArray(statusArray) && statusArray.length > 0
          ? statusArray[statusArray.length - 1]
          : "N/A";
      },
    },

    {
      field: "application_start_date",
      headerName: "Application Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.application_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "application_end_date",
      headerName: "Application End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.application_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "competition_start_date",
      headerName: "Competition Start",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.competition_start_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "competition_end_date",
      headerName: "Competition End",
      width: 200,
      renderCell: (params) => {
        const date = params.row?.competition?.competition_end_date;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },

    {
      field: "payment",
      headerName: "Payment",
      width: 150,
      renderCell: (params) => params.row?.competition?.payment ?? "N/A",
    },

    {
      field: "requirements",
      headerName: "Requirements",
      width: 150,
      renderCell: (params) => params.row?.competition?.requirements ?? "N/A",
    },
    {
      field: "reference_links",
      headerName: "ReferenceLink",
      width: 150,
      renderCell: (params) => params.row?.competition?.reference_links ?? "N/A",
    },

    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 200,
      getActions: (params) => [
        <div className="flex items-center space-x-2" key="action-buttons">
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModifyStatus(params.row, "competition");
            }}
          >
            Modify status
          </Button>

          <GridActionsCellItem
            key="delete"
            icon={
              <DeleteOutlineIcon
                sx={{
                  color: "#ef4444",
                  transition: "color 0.2s ease-in-out",
                  "&:hover": {
                    color: "#dc2626",
                  },
                }}
              />
            }
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCompetition(params.row);
            }}
            showInMenu={false}
          />
        </div>,
      ],
    },
  ];
}
