import { Router } from "../../deps.ts";
import CommonController from "../controllers/geo.ts";

const commonRoutes = new Router();

commonRoutes.get("/getAllStates", CommonController.getStates);
commonRoutes.get("/getAllDistricts", CommonController.getDistricts);

export default commonRoutes;
