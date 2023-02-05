import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts";
import { connect } from "https://deno.land/x/redis/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const PORT = 4400
export { Application, Router, Status, oakCors, connect as redisConnect, config, PORT };
