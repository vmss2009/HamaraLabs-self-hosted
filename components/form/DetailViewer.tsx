import React from "react";
import DrawerPanel from "@/components/form/DrawerPanel";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const NA_ELEMENT = <span className="text-gray-500">N/A</span>;

function formatAddress(addrUnknown: unknown): React.ReactNode {
  if (!isRecord(addrUnknown)) return NA_ELEMENT;
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
  const formatted = `${parts.join(", ")}${pincode ? " - " + pincode : ""}`;
  return formatted || NA_ELEMENT;
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return NA_ELEMENT;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 text-gray-900">
        {value.map((item, index) => {
          const display = item === null || item === undefined || item === '' ? NA_ELEMENT : String(item);
          return <li key={index} className="leading-snug">{display}</li>;
        })}
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
  if (!dateString) return ""; // Let caller wrap with NA_ELEMENT
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
  | { label: string; type: "compare"; fields: [FieldLabelPair, FieldLabelPair] }
  | { label: string; type: "links"; field: string };

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
              (() => {
                const raw = getNestedValue(selectedRow, col.field);
                const formatted = typeof raw === 'string' ? formatDate(raw) : '';
                return <div className="text-gray-900">{formatted || NA_ELEMENT}</div>;
              })()
            ) : col.type === "compare" && Array.isArray(col.fields) ? (
              (() => {
                const left = getNestedValue(selectedRow, col.fields[0]?.field);
                const right = getNestedValue(selectedRow, col.fields[1]?.field);
                return (
                  <div className="text-gray-900 flex gap-1">
                    <span>{left === null || left === undefined || left === '' ? NA_ELEMENT : String(left)}</span>
                    <span>-</span>
                    <span>{right === null || right === undefined || right === '' ? NA_ELEMENT : String(right)}</span>
                  </div>
                );
              })()
            ) : col.type === "address" && isRecord(selectedRow) && isRecord((selectedRow as Record<string, unknown>).address) ? (
              <div className="text-gray-900">{formatAddress((selectedRow as Record<string, unknown>).address)}</div>
            ) : col.type === "links" && "field" in col ? (
              (() => {
                const v = getNestedValue(selectedRow, col.field);
                const items = Array.isArray(v) ? v : [];
                if (items.length === 0) return <div className="">{NA_ELEMENT}</div>;
                return (
                  <ul className="list-disc pl-5 space-y-1">
                    {items.map((item: any, idx: number) => {
                      const url = String(item?.url ?? item);
                      const filename = String(item?.filename ?? "");
                      const rawName = filename || (() => {
                        try {
                          const u = new URL(url);
                          const last = u.pathname.split("/").filter(Boolean).pop();
                          return last || url;
                        } catch {
                          const s = url.split("?")[0];
                          const last = s.split("/").filter(Boolean).pop();
                          return last || url;
                        }
                      })();
                      let displayName = rawName;
                      try {
                        displayName = decodeURIComponent(rawName);
                      } catch {
                        // ignore decode errors
                      }
                      // Common cleanups: replace + with space (in some encodings) and trim
                      displayName = displayName.replace(/\+/g, ' ').trim();
                      return (
                        <li key={idx} className="text-gray-900">
                          <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline break-all text-blue-600"
                          >
                            {displayName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()
            ) : "field" in col && typeof col.field === "string" ? (
              (() => {
                const val = getNestedValue(selectedRow, col.field as string);
                const rendered = formatValue(val);
                return <div className="text-gray-900">{rendered === 'N/A' ? NA_ELEMENT : rendered}</div>;
              })()
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
