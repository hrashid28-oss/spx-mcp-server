import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";

const PIPEDREAM_READER_URL =
  "https://eoqnrw5px27gppm.m.pipedream.net/";

function createServer() {
  const server = new McpServer({
    name: "spx-live-data",
    version: "1.0.0",
  });

  server.registerTool(
    "get_latest_spx",
    {
      description:
        "Fetch the latest SPX 1-minute market data snapshot from the user's TradingView pipeline.",
      inputSchema: {},
    },
    async () => {
      const response = await fetch(PIPEDREAM_READER_URL, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Pipedream returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data),
          },
        ],
      };
    }
  );

  return server;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("SPX MCP Server is running");
    }

    if (url.pathname === "/mcp") {
      return createMcpHandler(createServer)(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  },
};
