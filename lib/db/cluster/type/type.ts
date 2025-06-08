export interface HubInput {
  hub_school_id: number;
  spoke_school_ids: number[];
}

export interface ClusterCreateInput {
  name: string;
  hubs: HubInput[];
}

export interface ClusterUpdateInput {
  name?: string;
  hubs?: HubInput[];
}

export interface Cluster {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  hubs: {
    id: number;
    hub_school: {
      id: number;
      name: string;
    };
    spokes: {
      id: number;
      name: string;
    }[];
  }[];
} 