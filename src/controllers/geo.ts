import { States, Districts } from "../shared/constants.ts";
import { Status } from '../../deps.ts';

export default {
	getStates:  (context) => {
		context.response.body = {
			states: States
		};
		context.response.type = "json";
		context.response.status = Status.OK
	},
	getDistricts:  (context) => {
		context.response.body = {
			districts: Districts
		};
		context.response.type = "json";
		context.response.status = Status.OK
	}
}