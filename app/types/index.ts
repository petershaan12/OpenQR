export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  created_at?: string;
}

export interface ThemeData {
  id: number;
  name: string;
  primary_color: string;
  legal_info: string;
  user_id: number | null;
  welcome_screen_time?: number;
  welcome_image?: string | null;
  welcome_video?: string | null;
  enable_welcome?: boolean;
  created_at?: string;
}

export interface QRCodeData {
  id: number;
  user_id: number;
  name: string;
  surname: string;
  title: string;
  email: string;
  profile_image: string | null;
  social_network: string;
  theme_id: number;
  status: string;
  scans: number;
  unique_id: string;
  created_at: string;
  main_phone?: string;
  phones?: PhoneData[];
}

export interface PhoneData {
  id: number;
  qrcode_id: number;
  phone: string;
}

export interface NotificationData {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

// Form related types
export interface PhoneInput {
  id: number;
  value: string;
}

export interface QRCodeFormData {
  name: string;
  surname: string;
  title: string;
  email: string;
  social_network: string;
  theme_id: number | string;
}
