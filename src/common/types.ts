export interface PolarWebhookConnection {
  local: {
    _id: string;
    externalId: string;
    events: string[];
    url: string;
    signatureSecretKey: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  remote: {
    active: boolean;
    id: string;
    events: string[];
    url: string;
  } | null;
}

export interface AxiosPolarWebhookConnection {
  data: [
    {
      id: string;
      events: string[];
      url: string;
      active: boolean;
    }
  ];
}
