export interface Contract {
  id: string;
  name: string;
  contract: string;
  code: string;
  protocol: string;
  default_app: string;
  pid: string;
  address: string;

  group: string[];
  threshold: number;
  profile: string;

  constructor: any;
}

export interface Method {
  name: string;
  arguments: string[];
  values: any;
}

export interface Profile {
  first_name: string;
  last_name: string;
  image_url: string;
}

export interface Partner {
  address: string;
  agent: string;
  profile: string;
}