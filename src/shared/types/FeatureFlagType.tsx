export type FeatureFlags = {
  [key: string]: boolean;
};

export type FeatureFlag = {
  _id: string;
  name: string;
  enabled: boolean;
  description: string;
};