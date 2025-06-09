import { Cluster as PrismaCluster } from "@prisma/client";

// Cluster Types
export interface HubInput {
  hub_school_id: string;
  spoke_school_ids: string[];
}

export interface ClusterCreateInput {
  name: string;
  hubs: HubInput[];
}

export interface ClusterUpdateInput {
  name?: string;
  hubs?: HubInput[];
}

export interface ClusterWithRelations {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  hubs: {
    id: string;
    hub_school: {
      id: string;
      name: string;
      is_ATL: boolean;
    };
    spokes: {
      id: string;
      name: string;
      is_ATL: boolean;
    }[];
  }[];
}

// Hub Types
export interface HubCreateInput {
  hub_school_id: string;
  spokes: string[];
  clusters: string[];
}

export interface HubUpdateInput {
  hub_school_id?: string;
  spokes?: string[];
  clusters?: string[];
}

export interface HubWithRelations {
  id: string;
  created_at: Date;
  updated_at: Date;
  hub_school_id: string;
  hub_school: {
    id: string;
    name: string;
    is_ATL: boolean;
  };
  spokes: {
    id: string;
    name: string;
    is_ATL: boolean;
  }[];
  clusters: {
    id: string;
    name: string;
  }[];
}

