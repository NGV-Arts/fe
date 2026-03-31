import { AuthUser } from "./user";

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
