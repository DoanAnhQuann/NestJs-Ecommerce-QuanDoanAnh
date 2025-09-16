export const REQUEST_USER_KEY = 'user';
export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  ApiKey: 'ApiKey',
} as const;

export type AuthType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  AND: 'AND',
  OR: 'OR',
};

export type ConditionGuard =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];
