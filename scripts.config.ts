
import { DenonConfig } from "https://deno.land/x/denon@2.5.0/mod.ts";

const config: DenonConfig = {
  scripts: {
    start: {
      cmd: "deno run --allow-net --allow-read server.ts",
      desc: "starts the application",
    },
  },
};

export default config;