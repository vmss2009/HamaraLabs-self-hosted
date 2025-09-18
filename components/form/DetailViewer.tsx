import React from "react";
import DrawerPanel from "@/components/form/DrawerPanel";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatAddress(addrUnknown: unknown): string {
  if (!isRecord(addrUnknown)) return "N/A";
  const addr = addrUnknown as Record<string, unknown>;
  const city = isRecord(addr.city) ? (addr.city as Record<string, unknown>) : undefined;
  const state = isRecord(city?.state) ? (city!.state as Record<string, unknown>) : undefined;
  const country = isRecord(state?.country) ? (state!.country as Record<string, unknown>) : undefined;

  const parts = [
    String((addr.address_line1 as string) ?? ""),
    String((addr.address_line2 as string) ?? ""),
    String((city?.city_name as string) ?? ""),
    String((state?.state_name as string) ?? ""),
    String((country?.country_name as string) ?? ""),
  ].filter((s) => s && s.trim() !== "");

  const pincode = String((addr.pincode as string) ?? "");
  return `${parts.join(", ")}${pincode ? " - " + pincode : ""}`;
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return String(value);
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

function getNestedValue<T extends Record<string, unknown>>(obj: T, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (isRecord(acc) && key in acc ? acc[key] : null), obj);
}

interface FieldLabelPair {
  label: string;
  field: string;
}

type ColumnType =
  | { label: string; type?: "text"; field: string }
  | { label: string; type: "date"; field: string }
  | { label: string; type: "address"; field?: undefined }
  | { label: string; type: "Details"; fields: [FieldLabelPair, FieldLabelPair, FieldLabelPair, FieldLabelPair] }
  | { label: string; type: "compare"; fields: [FieldLabelPair, FieldLabelPair] };

interface DetailsDrawerProps<T extends Record<string, unknown>> {
  drawerOpen: boolean;
  closeDrawer: () => void;
  selectedRow: (T & Record<string, unknown>) | null;
  formtype: string;
  columns: ColumnType[];
}

function DetailsDrawer<T extends Record<string, unknown>>({
  drawerOpen,
  closeDrawer,
  selectedRow,
  formtype,
  columns,
}: DetailsDrawerProps<T>) {
  return (
    <DrawerPanel open={drawerOpen} onClose={closeDrawer} title={`${formtype} Details`}>
      {selectedRow ? (
        <div className="space-y-6">
          {columns.map((col) => (
            <div key={("field" in col && col.field) || col.label} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="text-sm font-semibold text-gray-700 mb-2">{col.label}:</div>
            {col.type === "Details" && col.fields ? (
              <div className="mb-2 text-gray-900">
                {`${formatValue(getNestedValue(selectedRow, col.fields[0].field))} ${formatValue(
                  getNestedValue(selectedRow, col.fields[1].field)
                )}`}
                <div className="text-gray-700">
                  <strong>Email:</strong> {formatValue(getNestedValue(selectedRow, col.fields[2].field))}
                </div>
                <div className="text-gray-700">
                  <strong>Phone:</strong> {formatValue(getNestedValue(selectedRow, col.fields[3].field))}
                </div>
              </div>
            ) : col.type === "date" && "field" in col ? (
              <div className="text-gray-900">{formatDate(String(getNestedValue(selectedRow, col.field)))}</div>
            ) : col.type === "compare" && Array.isArray(col.fields) ? (
              <div className="text-gray-900">
                {`${getNestedValue(selectedRow, col.fields[0]?.field) || "N/A"} - ${
                  getNestedValue(selectedRow, col.fields[1]?.field) || "N/A"
                }`}
              </div>
            ) : col.type === "address" && isRecord(selectedRow) && isRecord((selectedRow as Record<string, unknown>).address) ? (
              <div className="text-gray-900">{formatAddress((selectedRow as Record<string, unknown>).address)}</div>
            ) : "field" in col && typeof col.field === "string" ? (
              <div className="text-gray-900">{formatValue(getNestedValue(selectedRow, col.field as string))}</div>
            ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-900">No data available</div>
      )}
    </DrawerPanel>
  );
}

export default DetailsDrawer;
