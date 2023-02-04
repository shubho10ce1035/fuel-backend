import { Router, Status } from "../../deps.ts";
import { redisClient } from "../helpers/index.ts";
import { FuelTypesIndianOil, stateCodeMapping } from "../modules/indianoilmodule/constants.ts";

const indianoilRoutes = new Router();

indianoilRoutes.get("/fueltypes", async (context) => {
	context.response.body = FuelTypesIndianOil
	context.response.type = "json";
	context.response.status = Status.OK;
});

indianoilRoutes.post("/getStateFuelDetails", async (context) => {
	const body = await context.request.body({ type: "json" }).value;
	if (!context.request.hasBody) {
		context.response.status = 400;
		context.response.body = {
			success: false,
			message: "No data provided",
		};
		return;
	}
	let stateCode = body.code;
	stateCode = stateCodeMapping[stateCode];
	const cacheKey = `${new Date().toISOString().split("T")[0]}-${stateCode}`;
	const cacheResponse = await redisClient.get(cacheKey);

	if (cacheResponse) {
		console.info("Response from cache", cacheKey);
		context.response.body = {
			headers: [
				"Petrol Pump Name",
				"COVID-19 Food & Relief Contact",
				"Address",
				"Dealer/Partner/Operator/Contact Person Name",
				"Contact No",
				"Petrol Price",
				"Diesel Price",
				"XTRAPREMIUM Price",
				"XTRAMILE Price",
				"XP100 Price",
				"XP95 Price",
				"XG Price",
				"E100 Price",
				"District",
				"State",
				"State Office",
				"Divisional Office",
				"Sales Area",
				"Sales Officer Contact No",
			],
			allValues: JSON.parse(cacheResponse),
		};

		context.response.type = "json";
		context.response.status = Status.OK;
		return;
	}
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	var urlencoded = new URLSearchParams();
	urlencoded.append("state", stateCode);

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
		redirect: "follow",
	} as RequestInit;

	const apiResponse = await fetch(
		"https://associates.indianoil.co.in/PumpLocator/StateWiseLocator",
		requestOptions
	);

	const data = await apiResponse.text();
	const locations = data.split("|");
	const singleRow = locations[0];
	const columnCount = singleRow.split(",").length;
	let allValues: any = [];

	for (let i = 0; i < locations.length - 1; i++) {
		let district = "",
			contact = "",
			state = "",
			stateOffice = "",
			divisionalOffice = "",
			petrolPumpName = "",
			address = "",
			salesOffice = "",
			salesContactNumber = "",
			contactNo = "",
			ms = "",
			hsd = "",
			xp = "",
			xm = "",
			roCode = "";
		let covidReliefContact = "",
			xp100 = "",
			xp95 = "",
			xg = "",
			e100 = "",
			lat = "",
			long = "";
		for (let j = 0; j < columnCount; j++) {
			if (j === 1) {
				lat = locations[i].split(",")[j];
			}
			if (j === 2) {
				long = locations[i].split(",")[j];
			}
			if (j === 39) {
				if (locations[i].split(",")[j - 1] === "Y") {
					covidReliefContact =
						locations[i].split(",")[j] +
						" --" +
						locations[i].split(",")[j + 1];
				} else {
					covidReliefContact = "N/A";
				}
			}
			if (j == 34) {
				district = locations[i].split(",")[j];
			}
			if (j == 36) {
				contactNo = locations[i].split(",")[j];
			}
			if (j == 30) {
				contact = locations[i].split(",")[j];
			}
			if (j == 35) {
				state = locations[i].split(",")[j];
			}
			if (j == 25) {
				ms = locations[i].split(",")[j];
			}
			if (j == 26) {
				hsd = locations[i].split(",")[j];
			}
			if (j == 27) {
				xp = locations[i].split(",")[j];
			}
			if (j == 28) {
				xm = locations[i].split(",")[j];
			}
			if (j == 31) {
				stateOffice = locations[i].split(",")[j];
			}
			if (j == 32) {
				divisionalOffice = locations[i].split(",")[j];
			}
			if (j == 0) {
				petrolPumpName = locations[i].split(",")[j];
			}
			if (j == 3) {
				address = locations[i].split(",")[j];
			}
			if (j == 33) {
				salesOffice = locations[i].split(",")[j];
			}
			if (j == 29) {
				salesContactNumber = locations[i].split(",")[j];
			}
			if (j == 37) {
				roCode = locations[i].split(",")[j];
			}
			if (j == 41) {
				xp100 = locations[i].split(",")[j];
			}
			if (j == 42) {
				xp95 = locations[i].split(",")[j];
			}
			if (j == 43) {
				xg = locations[i].split(",")[j];
			}
			if (j == 44) {
				e100 = locations[i].split(",")[j];
			}
		}
		const tempValue = [
			roCode,
			lat,
			long,
			petrolPumpName,
			covidReliefContact,
			address,
			contact,
			contactNo,
			ms,
			hsd,
			xp,
			xm,
			xp100,
			xp95,
			xg,
			e100,
			district,
			state,
			stateOffice,
			divisionalOffice,
			salesOffice,
			salesContactNumber,
		];
		allValues.push(tempValue);
	}

	const apibackendresponse = {
		headers: [
			"Petrol Pump Name",
			"COVID-19 Food & Relief Contact",
			"Address",
			"Dealer/Partner/Operator/Contact Person Name",
			"Contact No",
			"Petrol Price",
			"Diesel Price",
			"XTRAPREMIUM Price",
			"XTRAMILE Price",
			"XP100 Price",
			"XP95 Price",
			"XG Price",
			"E100 Price",
			"District",
			"State",
			"State Office",
			"Divisional Office",
			"Sales Area",
			"Sales Officer Contact No",
		],
		allValues: allValues,
	};

	console.log("setting first request/response to cache", cacheKey);
	redisClient.set(cacheKey, JSON.stringify(allValues));

	context.response.body = {
		...apibackendresponse,
	};

	context.response.type = "json";
	context.response.status = Status.OK;
});

indianoilRoutes.post("/getNearByPumpDetails", async (context) => {

	const body = await context.request.body({ type: "json" }).value;
	if (!context.request.hasBody) {
		context.response.status = 400;
		context.response.body = {
			success: false,
			message: "No data provided",
		};
		return;
	}
	let { latitude, longitude, fuelType, range } = body;

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	var urlencoded = new URLSearchParams();
	urlencoded.append("latitude", latitude);
	urlencoded.append("longitude", longitude);
	urlencoded.append("fuel", fuelType);
	urlencoded.append("range", range);

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
		redirect: "follow",
	} as RequestInit;

	const apiResponse = await fetch(
		'https://associates.indianoil.co.in/PumpLocator/NearLocations',
		requestOptions
	)
	const data = await apiResponse.text();
	const locations = data.split("|");
	const singleRow = locations[0];
	const columnCount = singleRow.split(",").length;
	let allValues: any = [];

	for (let i = 0; i < locations.length - 1; i++) {
		let District = "", Dealer = "", State = "", StateOffice = "", DivisionalOffice = "", petrolPumpName = "", Address = "", SalesArea = "", SalesOfficerContactNo = "", m = "",
			PetrolPrice = "", Diesel = "", xp = "", xm = "", DistancefromSource = "", roCode = "", xp100 = "", xp95 = "", xg = "", e100 = "", ev = "", EVChargingStation = "", Battery = "", cng = "", cngPrice = "", cbgPrice = "";
		let covidReliefContact = "";
		for (let j = 0; j < columnCount; j++) {
			switch (j) {
				case 40:
					if (locations[i].split(",")[j - 1] === 'Y') {
						covidReliefContact = locations[i].split(",")[j] + " [" + locations[i].split(",")[j + 1] + "]";
					} else {
						covidReliefContact = "N/A";
					}
					break;

				case 34:
					District = locations[i].split(",")[j];
					break;

				case 36:
					m = locations[i].split(",")[j];
					break;

				case 30:
					Dealer = locations[i].split(",")[j] + " (" + locations[i].split(",")[36] + " )";
					break;

				case 35:
					State = locations[i].split(",")[j];
					break;

				case 25:
					PetrolPrice = locations[i].split(",")[j];
					break;

				case 26:
					Diesel = locations[i].split(",")[j];
					break;

				case 46:
					ev = locations[i].split(",")[j];
					break;

				case 47:
					cng = locations[i].split(",")[j];
					break;

				case 48:
					EVChargingStation = locations[i].split(",")[j];
					break;
				case 49:
					Battery = locations[i].split(",")[j];

				case 50:
					cngPrice = locations[i].split(",")[j];
					break;

				case 51:
					cbgPrice = locations[i].split(",")[j];
					break;

				case 37:
					let val: any = locations[i].split(",")[j];
					if (val < 1) {
						val = val * 1000 + "M";
					} else {
						val = val + "Km";
					}
					DistancefromSource = val;
					break;

				case 31:
					StateOffice = locations[i].split(",")[j];
					break

				case 32:
					DivisionalOffice = locations[i].split(",")[j];
					break

				case 0:
					petrolPumpName = locations[i].split(",")[j];
					break

				case 3:
					Address = locations[i].split(",")[j];
					break

				case 33:
					SalesArea = locations[i].split(",")[j];
					break

				case 29:
					SalesOfficerContactNo = locations[i].split(",")[j];
					break

				case 1:
					SalesOfficerContactNo = locations[i].split(",")[j];
					break

				case 38:
					roCode = locations[i].split(",")[j];
					break

				case 42:
					xp100 = locations[i].split(",")[j];
					break

				case 43:
					xp95 = locations[i].split(",")[j];
					break

				case 44:
					xg = locations[i].split(",")[j];
					break

				case 45:
					e100 = locations[i].split(",")[j];
					break

			}

		}
		const tempValue = [
			roCode,
			petrolPumpName,
			covidReliefContact,
			Dealer,
			PetrolPrice,
			Diesel,
			xp,
			xm,
			xp100,
			xp95,
			xg,
			e100,
			District,
			State,
			StateOffice,
			DivisionalOffice,
			SalesOfficerContactNo,
			DistancefromSource,
			Battery,
			cngPrice,
			cbgPrice,
			cng,
			Address,
			SalesArea,
			EVChargingStation
		];
		allValues.push(tempValue);
	}
	context.response.type = "json";
	const apibackendresponse = {
		headers: [
			"RoCode",
			"petrol Pump Name",
			"covid Relief Contact",
			"Dealer",
			"PetrolPrice",
			"Diesel",
			"Xp",
			"Xm",
			"Xp100",
			"Xp95",
			"Xg",
			"E100",
			"District",
			"State",
			"State Office",
			"Divisional Office",
			"SalesOfficer Contact No",
			"Distance from Source",
			"Battery",
			"CngPrice",
			"CBGPrice",
			"Cng",
			"Address",
			"Sales Area",
			"EV Charging Station"
		],
		allValues: allValues,
	};

	context.response.body = {
		...apibackendresponse
	};

	context.response.status = Status.OK;
})

export default indianoilRoutes;
