import React from "react";
import { Drawer, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
      obj
    );
}

interface FieldLabelPair {
  label: string;
  field: string;
}

interface ColumnType {
  label: string;
  field?: string;
  fields?: FieldLabelPair[];
  type?: "text" | "address" | "date" | "fields" | "Details" | "compare";
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
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: 3,
          paddingBottom: 5,
          overflowY: "auto",
        }}
      >
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
              {col.type === "Details" && col.fields ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {`${formatValue(
                      getNestedValue(selectedRow, col.fields[0].field)
                    )} ${formatValue(
                      getNestedValue(selectedRow, col.fields[1].field)
                    )}`}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#4b5563" }}>
                    <strong>Email:</strong>{" "}
                    {formatValue(
                      getNestedValue(selectedRow, col.fields[2].field)
                    )}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#4b5563" }}>
                    <strong>Phone:</strong>{" "}
                    {formatValue(
                      getNestedValue(selectedRow, col.fields[3].field)
                    )}
                  </Typography>
                </Box>
              ) : col.type === "date" && col.field ? (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {formatDate(getNestedValue(selectedRow, col.field))}
                </Typography>
              ) : col.type === "compare" && Array.isArray(col.fields) ? (
                <Typography variant="body1" sx={{ color: "#1f2937" }}>
                  {`${
                    getNestedValue(selectedRow, col.fields[0]?.field) || "N/A"
                  } - ${
                    getNestedValue(selectedRow, col.fields[1]?.field) || "N/A"
                  }`}
                </Typography>
              ) : col.type === "address" && selectedRow?.address ? (
                <Box
                  sx={{
                    display: "flex",
                    color: "#1f2937",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {[
                      selectedRow.address.address_line1,
                      selectedRow.address.address_line2,
                      selectedRow.address.city?.city_name,
                      selectedRow.address.city?.state?.state_name,
                      selectedRow.address.city?.state?.country?.country_name,
                    ]
                      .filter((val) => val && val.trim() !== "")
                      .join(", ")}
                    {" - "}
                    <span style={{ fontWeight: 500 }}>
                      {selectedRow.address.pincode || ""}
                    </span>
                  </Typography>
                </Box>
              ) : col.field &&
                Array.isArray(getNestedValue(selectedRow, col.field)) ? (
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
                    (item: any, index: number) => (
                      <li key={index}>
                        <Typography variant="body1" sx={{ color: "#1f2937" }}>
                          {typeof item === "object"
                            ? item?.name || JSON.stringify(item)
                            : String(item)}
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
