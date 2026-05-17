import React from "react";
import DrawerPanel from "@/components/form/DrawerPanel";

const NA_ELEMENT = <span className="text-gray-500">N/A</span>;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

interface TaskDetailViewerProps {
  drawerOpen: boolean;
  closeDrawer: () => void;
  selectedRow: any | null;
}

function TaskDetailViewer({
  drawerOpen,
  closeDrawer,
  selectedRow,
}: TaskDetailViewerProps) {
  const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === "") return NA_ELEMENT;
    return String(value);
  };

  return (
    <DrawerPanel open={drawerOpen} onClose={closeDrawer} title="Task Details">
      {selectedRow ? (
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">S.No:</div>
            <div className="text-gray-900">{formatValue(selectedRow.index)}</div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Title:</div>
            <div className="text-gray-900">{formatValue(selectedRow.title)}</div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Description:</div>
            <div className="text-gray-900">{formatValue(selectedRow.description)}</div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Student:</div>
            <div className="text-gray-900">
              {selectedRow.student
                ? `${selectedRow.student.first_name} ${selectedRow.student.last_name}`
                : NA_ELEMENT}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">School:</div>
            <div className="text-gray-900">{formatValue(selectedRow.school)}</div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Created By:</div>
            <div className="text-gray-900">
              {selectedRow.createdBy
                ? `${selectedRow.createdBy.first_name || ''} ${selectedRow.createdBy.last_name || ''} (${selectedRow.createdBy.email})`
                : NA_ELEMENT}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Assigned To:</div>
            <div className="text-gray-900">
              {selectedRow.assignedTo
                ? `${selectedRow.assignedTo.first_name || ''} ${selectedRow.assignedTo.last_name || ''} (${selectedRow.assignedTo.email})`
                : NA_ELEMENT}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Status:</div>
            <div className="text-gray-900">
              {formatValue(STATUS_LABEL[selectedRow.status] || selectedRow.status)}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Due Date:</div>
            <div className="text-gray-900">
              {formatDate(selectedRow.dueDate) || NA_ELEMENT}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-900">No data available</div>
      )}
    </DrawerPanel>
  );
}

export default TaskDetailViewer;
