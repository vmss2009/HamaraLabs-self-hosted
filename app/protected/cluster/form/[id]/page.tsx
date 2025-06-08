"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import { Input } from "@/components/ui/Input";
import { Autocomplete, Box, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import SelectField from "@/components/forms/SelectField";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type School = {
  id: number;
  name: string;
};

type HubInput = {
  hub_school_id: number;
  spoke_school_ids: number[];
};

// This component will be updated to fetch and display existing cluster data
export default function EditClusterForm({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const unwrappedParams = use(params);
  const clusterId = unwrappedParams.id;
  
  // State for form fields
  const [name, setName] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [hubs, setHubs] = useState<HubInput[]>([{ hub_school_id: 0, spoke_school_ids: [] }]);
  
  // Fetch schools and cluster data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch schools
        const schoolsResponse = await fetch("/api/schools");
        if (!schoolsResponse.ok) {
          throw new Error("Failed to fetch schools");
        }
        const schoolsData = await schoolsResponse.json();
        setSchools(schoolsData);

        // Fetch cluster data
        const clusterResponse = await fetch(`/api/cluster/${clusterId}`);
        if (!clusterResponse.ok) {
            throw new Error("Failed to fetch cluster data");
        }
        const clusterData = await clusterResponse.json();

        // Pre-fill form with cluster data
        setName(clusterData.name);
        setHubs(clusterData.hubs.map((hub: any) => ({
            hub_school_id: hub.hub_school.id,
            spoke_school_ids: hub.spokes.map((spoke: any) => spoke.id)
        })));

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data. Please try again later.");
      }
    };
    
    fetchData();
  }, [clusterId]); // Dependency on clusterId to refetch if ID changes
  
  // Form submission handler
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormSubmitted(true);
    
    try {
      // Validate that no hub school is also a spoke school
      for (const hub of hubs) {
        if (hub.spoke_school_ids.includes(hub.hub_school_id)) {
          throw new Error("A school cannot be both a hub school and a spoke school");
        }
      }

      const clusterData = {
        name,
        hubs
      };
      
      // Use PUT method for update
      const response = await fetch(`/api/cluster/${clusterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clusterData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update the cluster");
      }
      
      router.push("/protected/cluster/report");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addHub = () => {
    setHubs([...hubs, { hub_school_id: 0, spoke_school_ids: [] }]);
  };

  const removeHub = (index: number) => {
    if (hubs.length <= 1) {
      setError("At least one hub must be present");
      return;
    }
    const newHubs = [...hubs];
    newHubs.splice(index, 1);
    setHubs(newHubs);
  };

  const updateHubSchool = (index: number, schoolId: number) => {
    const newHubs = [...hubs];
    newHubs[index].hub_school_id = schoolId;
    setHubs(newHubs);
  };

  const updateSpokeSchools = (index: number, schoolIds: number[]) => {
    const newHubs = [...hubs];
    newHubs[index].spoke_school_ids = schoolIds;
    setHubs(newHubs);
  };
  
  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-slate-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Edit Cluster</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to edit the cluster.</p>
        </div>

        {error && (
          <div className="bg-red-50 flex gap-3 items-center text-red-500 p-4 rounded-md mb-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="w-full md:col-span-2">
                <Input
                  name="name"
                  label="Cluster Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </FormSection>
          
          <FormSection title="Hubs">
            {hubs.map((hub, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Hub {index + 1}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeHub(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Hub
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Autocomplete
                    id={`hub-school-${index}`}
                    options={schools}
                    getOptionLabel={(option) => option.name}
                    value={schools.find(school => school.id === hub.hub_school_id) || null}
                    onChange={(_, newValue) => {
                      updateHubSchool(index, newValue ? newValue.id : 0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hub School"
                        placeholder="Search or select a school..."
                        variant="outlined"
                        error={formSubmitted && hub.hub_school_id === 0}
                        helperText={(formSubmitted && hub.hub_school_id === 0) ? "Please select a hub school" : ""}
                      />
                    )}
                  />
                  
                  <div className="w-full">
                    <Autocomplete
                      multiple
                      id={`spoke-schools-${index}`}
                      options={schools.filter(school => school.id !== hub.hub_school_id)}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.name}
                      value={schools.filter(school => hub.spoke_school_ids.includes(school.id))}
                      onChange={(_, newValue) => {
                        updateSpokeSchools(index, newValue.map(school => school.id));
                      }}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...otherProps } = props;
                        return (
                          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} key={key} {...otherProps}>
                            <Checkbox
                              icon={icon}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.name}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Spoke Schools"
                          placeholder="Search schools..."
                          variant="outlined"
                          error={formSubmitted && hub.spoke_school_ids.length === 0}
                          helperText={hub.spoke_school_ids.length === 0 ? "Please select at least one spoke school" : ""}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={addHub}
              variant="outline"
              className="mt-4"
            >
              Add Hub
            </Button>
          </FormSection>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              disabled={hubs.length === 0}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 