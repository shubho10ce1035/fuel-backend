import { Router } from "../../deps.ts";
import CommonController from './../controllers/common.ts'

const commonRoutes = new Router()

commonRoutes
  .get('/getAllStates', CommonController.getStates);

export default commonRoutes;