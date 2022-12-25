import { Router, Status } from "../../deps.ts";
import { States } from "../shared/constants.ts";

const commonRoutes = new Router()

commonRoutes
  .get(('/getAllStates'), (context) => {
    context.response.body = {
      states: States
    };
    context.response.type = "json";
    context.response.status = Status.OK
  });

export default commonRoutes;