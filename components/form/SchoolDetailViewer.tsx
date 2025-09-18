import React from "react";
import DrawerPanel from "@/components/form/DrawerPanel";

interface UserRole {
  name: string;
  email: string;
  phone: string;
}

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

function formatUserRoles(roles: UserRole[], roleColor: string): React.ReactNode {
  if (!roles || roles.length === 0) {
    return <span className="text-gray-400 italic">None</span>;
  }

  return (
    <div className="space-y-3">
      {roles.map((role, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
          <div className={`font-semibold ${roleColor} mb-1`}>
            {role.name}
          </div>
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Email:</span> {role.email}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {role.phone !== 'N/A' ? role.phone : 'Not provided'}
          </div>
        </div>
      ))}
    </div>
  );
}

function getNestedValue<T extends Record<string, unknown>>(obj: T, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (isRecord(acc) && key in acc ? acc[key] : null), obj);
}

interface SchoolDetailViewerProps {
  drawerOpen: boolean;
  closeDrawer: () => void;
  selectedRow: Record<string, unknown> | null;
}

interface Column {
  label: string;
  field?: string;
  type?: string;
  roleColor?: string;
}

export default function SchoolDetailViewer({
  drawerOpen,
  closeDrawer,
  selectedRow,
}: SchoolDetailViewerProps) {
  const columns: Column[] = [
    { label: "S.No", field: "index" },
    { label: "Name", field: "name" },
    { label: "UDISE Code", field: "udise_code" },
    { label: "Is ATL", field: "is_ATL" },
    { label: "ATL Establishment Year", field: "ATL_establishment_year" },
    { label: "Paid Subscription", field: "paid_subscription" },
    { label: "Website URL", field: "website_url" },
    { label: "Syllabus", field: "syllabus" },
    { label: "Address", type: "address" },
    { 
      label: "Principals", 
      type: "userRoles", 
      field: "principalsList",
      roleColor: "text-blue-600"
    },
    { 
      label: "Correspondents", 
      type: "userRoles", 
      field: "correspondentsList",
      roleColor: "text-green-600"
    },
    { 
      label: "In-Charges", 
      type: "userRoles", 
      field: "inChargesList",
      roleColor: "text-purple-600"
    },
    { label: "Social Links", field: "social_links" },
  ];

  return (
    <DrawerPanel open={drawerOpen} onClose={closeDrawer} title="School Details">
      {selectedRow ? (
        <div className="space-y-6">
          {columns.map((col) => (
            <div key={col.field || col.label} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="text-sm font-semibold text-gray-700 mb-2">{col.label}:</div>
              {col.type === "userRoles" ? (
                <div className="text-gray-900">
                  {formatUserRoles(
                    getNestedValue(selectedRow, col.field!) as UserRole[], 
                    col.roleColor!
                  )}
                </div>
              ) : col.type === "address" && isRecord(selectedRow) && isRecord(selectedRow.address) ? (
                <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {formatAddress(selectedRow.address)}
                </div>
              ) : col.field ? (
                <div className="text-gray-900">
                  {formatValue(getNestedValue(selectedRow, col.field))}
                </div>
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