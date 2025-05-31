import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Utility Functions
const formatValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return String(value);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

interface FieldLabelPair {
  label: string;
  field: string;
}

interface ColumnType {
  label: string;
  field?: string;
  fields?: FieldLabelPair[];
  type?: "text" | "address" | "date" | "fields";
}

interface DetailsDrawerProps {
  drawerOpen: boolean;
  closeDrawer: () => void;
  selectedRow: any;
  formtype: string;
  columns: ColumnType[];
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  drawerOpen,
  closeDrawer,
  selectedRow,
  formtype,
  columns,
}) => {
  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: "40%",
          padding: 3,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <IconButton
          onClick={closeDrawer}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          sx={{
            marginBottom: 3,
            fontWeight: "bold",
            textAlign: "center",
            color: "#1f2937",
          }}
        >
          {formtype} Details
        </Typography>

        {selectedRow ? (
          columns.map((col) => (
            <Box key={col.field || col.label} sx={{ marginBottom: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#4b5563" }}
              >
                {col.label}:
              </Typography>

              {col.type === "date" && col.field ? (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatDate(getNestedValue(selectedRow, col.field))}
                </Typography>
              ) : col.type === "address" && Array.isArray(col.fields) ? (
                <Box sx={{ color: "#1f2937", pl: 2 }}>
                  {col.fields.map(({ label, field }) => {
                    const value = getNestedValue(selectedRow, field);
                    return (
                      <Typography key={field} variant="body2" sx={{ mb: 0.5 }}>
                        - <strong>{label}</strong>: {value ?? "N/A"}
                      </Typography>
                    );
                  })}
                </Box>
              ) : col.field && Array.isArray(getNestedValue(selectedRow, col.field)) ? (
                <Box
                  component="ul"
                  sx={{
                    color: "#1f2937",
                    pl: 3,
                    mb: 0,
                    listStyleType: "disc",
                  }}
                >
                  {getNestedValue(selectedRow, col.field).map(
                    (item: string, index: number) => (
                      <li key={index}>
                        <Typography variant="body2" component="span">
                          {item}
                        </Typography>
                      </li>
                    )
                  )}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {col.field
                    ? formatValue(getNestedValue(selectedRow, col.field))
                    : "N/A"}
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: "#1f2937" }}>
            No data available
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default DetailsDrawer;
