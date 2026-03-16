export type DegreeLevel = 'undergraduate' | 'masters' | 'phd' | 'postdoc';
export type FundingPreference = 'fully_funded' | 'partial' | 'any';

export interface Profile {
  id: string;
  full_name: string | null;
  degree_level: DegreeLevel | null;
  field_of_study: string | null;
  country: string | null;
  funding_preference: FundingPreference | null;
  onboarding_complete: boolean;
  notification_day?: number;
  notification_hour?: number;
  created_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  provider: string;
  deadline: string;
  funding_type: string;
  location: string;
  field: string;
  description: string;
  source_url: string;
  raw_data?: any;
  saved: boolean;
  seen: boolean;
  notify_updates?: boolean;
  created_at?: string;
}

export interface SearchQuota {
  id: string;
  user_id: string;
  week_start: string;
  searches_used: number;
}
