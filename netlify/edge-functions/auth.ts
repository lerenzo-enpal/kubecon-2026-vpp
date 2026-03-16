export default async (request: Request, context: any) => {
  const password = Deno.env.get("SITE_PASSWORD") || "";
  if (!password) return context.next();

  const auth = request.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic") {
      const decoded = atob(encoded);
      const [, pass] = decoded.split(":");
      if (pass === password) {
        return context.next();
      }
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KubeCon VPP"',
    },
  });
};

export const config = {
  path: "/*",
};
