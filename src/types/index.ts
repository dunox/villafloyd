export type IconName =
  | 'arrow'
  | 'bath'
  | 'bed'
  | 'calendar'
  | 'check'
  | 'chevronLeft'
  | 'chevronRight'
  | 'close'
  | 'hotTub'
  | 'info'
  | 'menu'
  | 'mountain'
  | 'pin'
  | 'plane'
  | 'pool'
  | 'snowflake'
  | 'sparkle'
  | 'sunrise'
  | 'sunset'
  | 'train'
  | 'tv'
  | 'users'
  | 'villa'
  | 'walk'
  | 'wifi';

export interface DateRangeValue {
  from: Date | null;
  to: Date | null;
}

export interface AvailabilityBlock {
  from: string;
  to: string;
  status: 'pending' | 'confirmed';
}

export interface AvailabilityResponse {
  booked: AvailabilityBlock[];
  generatedAt: string;
}

export interface Amenity {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
}

export interface Highlight {
  label: string;
  value: string;
}

export interface Review {
  quote: string;
  author: string;
  stay: string;
}
