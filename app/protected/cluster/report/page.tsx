"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter } from "next/navigation";

export default function ClusterReport() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchClusters = async () => {
    try {
      const response = await fetch("/api/cluster");
      if (!response.ok) throw new Error("Failed to fetch clusters");
      const data = await response.json();
      setClusters(data);
    } catch {
      setError("Failed to load clusters. Please try again later.");
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete cluster ?`)) {
      try {
        const response = await fetch(`/api/cluster/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete cluster");
        }

        fetchClusters();
      } catch (error) {
        console.error("Error deleting competition:", error);
      }
    }
  };

  return (
    <div className="flex justify-center items-start h-screen w-screen bg-gray-500">
      <div className="pt-20 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <Card className="p-4 max-h-[80vh] overflow-auto">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Clusters</h2>
              <div className="space-y-2 h-64 overflow-y-auto">
                {clusters.map((cluster) => (
                  <div key={cluster.id} className="flex items-center space-x-2">
                    <Button
                      variant={selectedCluster?.id === cluster.id ? "default" : "outline"}
                      className="flex-grow justify-start"
                      onClick={() => setSelectedCluster(cluster)}
                    >
                      {cluster.name}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/protected/cluster/form/${cluster.id}`)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(cluster.id)}
                    >
                      <DeleteOutlineIcon color="error" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 overflow-auto">
            {selectedCluster ? (
              <div className="flex flex-col items-center py-8">
                <div className="cluster-node border border-gray-300 rounded-lg p-4 mb-8 bg-blue-100 text-blue-800 font-semibold">
                  {selectedCluster.name}
                </div>

                <div className="flex justify-center space-x-12 relative">
                  {selectedCluster.hubs.map((hub: any) => (
                    <div key={hub.id} className="flex flex-col items-center">
                      <div className="hub-node border border-gray-300 rounded-lg p-4 mb-8 bg-green-100 text-green-800 font-semibold">
                        {hub.hub_school.name}
                      </div>

                      <div className="flex flex-col items-center space-y-4 pt-8">
                        {hub.spokes.map((spoke: any) => (
                          <div
                            key={spoke.id}
                            className="spoke-node border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
                          >
                            {spoke.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : clusters.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No clusters found
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a cluster to view its structure
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}