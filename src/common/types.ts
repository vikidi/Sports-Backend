export interface PolarWebhookConnection {
  _id: string;
  externalId: string;
  events: string[];
  url: string;
  signatureSecretKey: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  remoteId: string;
  remoteEvents: string[];
  remoteUrl: string;
}
