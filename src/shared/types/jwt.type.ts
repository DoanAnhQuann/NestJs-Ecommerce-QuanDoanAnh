export interface AccessTokenPayloadCreate {
  userId: number;
  roleId: number;
  deviceId: number;
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number;
  iat: number;
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number;
  iat: number;
}
export interface RefreshTokenPayloadCreate {
  userId: number;
}
