export type AuthUser = {
  id: number;
  username: string;
};

export type RequestWithUser = Request & { user: AuthUser };
