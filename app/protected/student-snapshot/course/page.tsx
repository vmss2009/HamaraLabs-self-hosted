import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Button } from "@/components/ui/Button";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export const getCourseColumns = (
  handleModifyStatus: (row: any, type: string) => void,
  handleDeleteCourse: (row: any) => void
): GridColDef[] => [
  { field: "id", headerName: "ID", width: 80 },

  {
    field: "course_actions",
    headerName: "Course",
    width: 200,
    renderCell: (params) => params.row?.course?.name ?? "N/A",
  },

  {
    field: "organized_by",
    headerName: "Organized By",
    width: 180,
    renderCell: (params) => params.row?.course?.organized_by ?? "N/A",
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
      const date = params.row?.course?.application_start_date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },

  {
    field: "application_end_date",
    headerName: "Application End",
    width: 200,
    renderCell: (params) => {
      const date = params.row?.course?.application_end_date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },

  {
    field: "course_start_date",
    headerName: "Course Start",
    width: 200,
    renderCell: (params) => {
      const date = params.row?.course?.course_start_date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },

  {
    field: "course_end_date",
    headerName: "Course End",
    width: 200,
    renderCell: (params) => {
      const date = params.row?.course?.course_end_date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },

  {
    field: "eligibility",
    headerName: "Eligibility",
    width: 250,
    renderCell: (params) => {
      const from = params.row?.course?.eligibility_from ?? "";
      const to = params.row?.course?.eligibility_to ?? "";
      return from && to ? `${from} - ${to}` : "N/A";
    },
  },

  {
    field: "reference_link",
    headerName: "Reference",
    width: 220,
    renderCell: (params) => {
      const link = params.row?.course?.reference_link;
      return link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {link}
        </a>
      ) : (
        "N/A"
      );
    },
  },

  {
    field: "requirements",
    headerName: "Requirements",
    width: 250,
    renderCell: (params) => {
      const reqs = params.row?.course?.requirements ?? [];
      return reqs.length > 0 ? reqs.join(", ") : "N/A";
    },
  },

  {
    field: "course_tags",
    headerName: "Tags",
    width: 250,
    renderCell: (params) => {
      const tags = params.row?.course?.course_tags ?? [];
      return tags.length > 0 ? tags.join(", ") : "N/A";
    },
  },

  {
    field: "actions",
    headerName: "Actions",
    type: "actions",
    width: 200,
    getActions: (params) => [
      <div className="flex items-center space-x-2" key="actions">
        <Button
          variant="default"
          color="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleModifyStatus(params.row, "courses");
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
            handleDeleteCourse(params.row);
          }}
          showInMenu={false}
        />
      </div>,
    ],
  },
];
