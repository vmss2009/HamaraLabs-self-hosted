import { z } from "zod";

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

export const clusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  hubs: z
    .array(
      z.object({
        hub_school_id: z.string().uuid("Invalid hub school ID"),
        spoke_school_ids: z
          .array(z.string().uuid("Invalid spoke school ID"))
          .min(1, "At least one spoke school ID is required"),
      })
    )
    .min(1, "At least one hub is required"),
});