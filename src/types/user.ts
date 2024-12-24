export interface IUser {
  id?: number;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}
