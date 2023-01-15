import { Application, oakCors, Router } from "./deps.ts";
import commonRoutes from "./src/routes/common-routes.ts";
import indianOilRoutes from "./src/routes/indian-oil-routes.ts";
import { PORT } from "./src/shared/constants.ts";

const app = new Application();
const router = new Router();
app.use(oakCors());
app.use(indianOilRoutes.prefix("/api/indianoilroutes").routes());
app.use(commonRoutes.prefix("/api/common").routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => {
	console.log(`server started at localhost:${PORT}`);
});
app.addEventListener("error", (e) => console.log(`Caught error: ${e.message}`));

await app.listen({
	port: PORT,
});
