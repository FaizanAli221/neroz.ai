import app from "../server/src/app.js";

export default function handler(req, res) {
  try {
    if (req.url) {
      const url = new URL(req.url, "http://localhost");
      const path = url.searchParams.get("path");

      if (path !== null && path !== undefined) {
        url.searchParams.delete("path");
        const query = url.searchParams.toString();
        req.url = `/api/${path}${query ? `?${query}` : ""}`;
      } else if (!req.url.startsWith("/api")) {
        req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
      }
    }

    return app(req, res);
  } catch (error) {
    console.error("Vercel API handler error:", error);
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
}
