export interface JwtPayload {
  sub: string; // userId
  email: string;
  orgId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}
