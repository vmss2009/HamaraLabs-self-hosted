"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardContent } from "../ui/Card";
import { StudentFilter as StudentFilterType } from "@/lib/db/student/type";

interface StudentFilterProps {
  onFilter: (filters: StudentFilterType) => void;
}

const StudentFilter: React.FC<StudentFilterProps> = ({ onFilter }) => {
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [filters, setFilters] = useState<StudentFilterType>({
    first_name: "",
    last_name: "",
    gender: "",
    class: "",
    section: "",
    schoolId: undefined,
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/schools");
        const data = await response.json();
        setSchools(
          data.map((school: any) => ({
            id: school.id,
            name: school.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    fetchSchools();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value || undefined });
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters({ ...filters, schoolId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      first_name: "",
      last_name: "",
      gender: "",
      class: "",
      section: "",
      schoolId: undefined,
    });
    onFilter({});
  };

  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const classOptions = [
    { value: "", label: "All Classes" },
    { value: "1", label: "Class 1" },
    { value: "2", label: "Class 2" },
    { value: "3", label: "Class 3" },
    { value: "4", label: "Class 4" },
    { value: "5", label: "Class 5" },
    { value: "6", label: "Class 6" },
    { value: "7", label: "Class 7" },
    { value: "8", label: "Class 8" },
    { value: "9", label: "Class 9" },
    { value: "10", label: "Class 10" },
    { value: "11", label: "Class 11" },
    { value: "12", label: "Class 12" },
  ];

  const sectionOptions = [
    { value: "", label: "All Sections" },
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" },
    { value: "E", label: "Section E" },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={filters.first_name || ""}
              onChange={handleInputChange}
              placeholder="Search by first name"
            />
            <Input
              label="Last Name"
              name="last_name"
              value={filters.last_name || ""}
              onChange={handleInputChange}
              placeholder="Search by last name"
            />
            <Select
              label="Gender"
              name="gender"
              options={genderOptions}
              value={filters.gender || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="School"
              options={[
                { value: "", label: "All Schools" },
                ...schools.map((school) => ({
                  value: school.id,
                  label: school.name,
                })),
              ]}
              onChange={handleSchoolChange}
              value={filters.schoolId?.toString() || ""}
            />
            <Select
              label="Class"
              name="class"
              options={classOptions}
              value={filters.class || ""}
              onChange={handleInputChange}
            />
            <Select
              label="Section"
              name="section"
              options={sectionOptions}
              value={filters.section || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">Apply Filters</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentFilter;
