import { prisma } from "@/lib/db/prisma";
import { ClusterCreateInput, ClusterUpdateInput } from "../type";

export async function createCluster(data: ClusterCreateInput) {
  try {
    const cluster = await prisma.cluster.create({
      data: {
        name: data.name,
        hubs: {
          create: data.hubs.map(hub => ({
            hub_school: {
              connect: { id: hub.hub_school_id }
            },
            spokes: {
              connect: hub.spoke_school_ids.map(id => ({ id }))
            }
          }))
        }
      },
      include: {
        hubs: {
          include: {
            hub_school: true,
            spokes: true
          }
        }
      }
    });
    
    return cluster;
  } catch (error) {
    console.error("Error creating cluster:", error);
    throw error;
  }
}

export async function getClusters() {
  try {
    const clusters = await prisma.cluster.findMany({
      include: {
        hubs: {
          include: {
            hub_school: true,
            spokes: true
          }
        }
      }
    });
    
    return clusters;
  } catch (error) {
    console.error("Error fetching clusters:", error);
    throw error;
  }
}

export async function getClusterById(id: string) {
  try {
    const cluster = await prisma.cluster.findUnique({
      where: { id },
      include: {
        hubs: {
          include: {
            hub_school: true,
            spokes: true
          }
        }
      }
    });
    
    if (!cluster) {
      throw new Error("Cluster not found");
    }
    
    return cluster;
  } catch (error) {
    console.error("Error fetching cluster:", error);
    throw error;
  }
}

export async function updateCluster(id: string, data: ClusterUpdateInput) {
  try {
    // First, delete all existing hubs and their relations
    await prisma.hub.deleteMany({
      where: { clusters: { some: { id } } }
    });

    const cluster = await prisma.cluster.update({
      where: { id },
      data: {
        name: data.name,
        hubs: {
          create: data.hubs?.map(hub => ({
            hub_school: {
              connect: { id: hub.hub_school_id }
            },
            spokes: {
              connect: hub.spoke_school_ids.map(id => ({ id }))
            }
          }))
        }
      },
      include: {
        hubs: {
          include: {
            hub_school: true,
            spokes: true
          }
        }
      }
    });
    
    return cluster;
  } catch (error) {
    console.error("Error updating cluster:", error);
    throw error;
  }
}

export async function deleteCluster(id: string) {
  try {
    // First, delete all hubs associated with this cluster
    await prisma.hub.deleteMany({
      where: { clusters: { some: { id } } }
    });

    // Then delete the cluster
    await prisma.cluster.delete({
      where: { id }
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting cluster:", error);
    throw error;
  }
} 