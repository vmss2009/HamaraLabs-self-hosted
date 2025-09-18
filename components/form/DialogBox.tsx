import React, { useEffect, useState } from "react";
import Modal from "@/components/form/Modal";
import { Button } from "@/components/form/Button";
import { Checkbox } from "@/components/form/Checkbox";
import SearchableSelect from "@/components/form/SearchableSelect";

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </div>
  );
}

interface Student {
  id: string | number;
  first_name: string;
  last_name: string;
}

interface School {
  id: string | number;
  name: string;
}

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  formtype: string;
  selectedActivity: {
    id: string | number;
    name: string;
  } | null;
  setSuccess?: (message: string | null) => void;
}

export default function AssignDialog({
  open,
  onClose,
  formtype,
  selectedActivity,
  setSuccess,
}: AssignDialogProps) {
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedSchool, setSelectedSchool] = useState<string | number>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      if (!response.ok) throw new Error("Failed to fetch schools");
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchStudents = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/students?school_id=${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (open) fetchSchools();
  }, [open]);

  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(String(selectedSchool));
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedSchool]);

  const getApiEndpoint = (formType: string): string => {
    switch (formType) {
      case "Course":
        return "/api/customised-courses";
      case "Competition":
        return "/api/customised-competitions";
      case "Tinkering-activity":
        return "/api/customised-tinkering-activities";
      default:
        return "";
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedStudents.length || !selectedActivity) return;

    const apiEndpoint = getApiEndpoint(formtype);
    if (!apiEndpoint) {
      setAssignError("Invalid form type");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError(null);

      const formattedDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      const promises = selectedStudents.map((studentId) =>
        fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedActivity.id,
            student_id: studentId,
            status: [`Assigned - ${formattedDate}`],
          }),
        })
      );

      await Promise.all(promises);
      onClose();
      setSelectedStudents([]);
      setSelectedSchool("");
      setSuccess?.("Assigned successfully");
      setTimeout(() => setSuccess?.(null), 3000);
    } catch (error) {
      console.error("Error assigning:", error);
      setAssignError("Failed to assign");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSchool("");
    setSelectedStudents([]);
    setAssignError(null);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Assign ${formtype}`}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={assignLoading}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAssignSubmit}
            disabled={assignLoading || selectedStudents.length === 0}
          >
            {assignLoading ? "Assigning..." : "Assign"}
          </Button>
        </>
      }
    >
      {assignError && <Alert>{assignError}</Alert>}

      <div className="mt-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formtype}: {selectedActivity?.name}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select School
          </label>
          <div className="w-full">
            <SearchableSelect<string | number>
              label="School"
              options={schools.map((s) => ({ value: s.id, label: s.name }))}
              value={selectedSchool || null}
              onChange={(val) => setSelectedSchool((val as string | number) || "")}
              placeholder="Search schools..."
              multiple={false}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Students
          </label>
          <div className="w-full">
            <SearchableSelect<string>
              label="Students"
              options={students.map((st) => ({
                value: String(st.id),
                label: `${st.first_name} ${st.last_name}`.trim(),
              }))}
              value={selectedStudents}
              onChange={(vals) => setSelectedStudents((vals as string[]) || [])}
              multiple
              placeholder="Search and select students..."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
