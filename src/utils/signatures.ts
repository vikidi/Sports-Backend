import { createHmac } from "crypto";

export const calculateHmac = (data: any, key: string) => {
  return createHmac("sha256", key).update(JSON.stringify(data)).digest("hex");
};
