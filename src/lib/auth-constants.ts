// Split out from auth.ts so this can be imported by middleware.ts (Edge
// runtime) without pulling bcryptjs into the edge bundle.
export const AUTH_COOKIE_NAME = "at_session";
