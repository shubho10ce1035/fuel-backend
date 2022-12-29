import { Router, Status } from "../../deps.ts";
import { redisClient } from "../helpers/index.ts";
import { stateCodeMapping } from "../services/indianoilmodule/constants.ts";

const indianoilRoutes = new Router()

indianoilRoutes
  .post(('/getStateFuelDetails'), async (context) => {
    const body = await context.request.body({ type: "json" }).value;
    if (!context.request.hasBody) {
			context.response.status = 400;
			context.response.body = {
				success: false,
				message: "No data provided",
			};
			return;
    }
    let stateCode = body.code
    stateCode = stateCodeMapping[stateCode]
		const cacheKey = `${new Date().toISOString().split('T')[0]}-${stateCode}`
		const cacheResponse = await redisClient.get(cacheKey)
		
		if(cacheResponse) {
			console.info('Response from cache', cacheKey);
			context.response.body = {
				data: {
					headers : ["Petrol Pump Name","COVID-19 Food &amp; Relief Contact","Address","Dealer/Partner/Operator/Contact Person Name","Contact No","Petrol Price","Diesel Price","XTRAPREMIUM Price","XTRAMILE Price","XP100 Price","XP95 Price","XG Price","E100 Price","District","State","State Office","Divisional Office","Sales Area","Sales Officer Contact No"],
					data: JSON.parse(cacheResponse)
				}
			};
	
			context.response.type = "json";
			context.response.status = Status.OK
			return
		}
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencoded = new URLSearchParams();
    urlencoded.append("state", stateCode);

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};
  
		const apiResponse = await fetch("https://associates.indianoil.co.in/PumpLocator/StateWiseLocator", requestOptions)
		const data = await apiResponse.text()
		const locations = data.split('|')
		const singleRow = locations[0];
		const columnCount = singleRow.split(",").length;
		let allValues: any = [];
		
		for (let i = 0; i < locations.length - 1; i++) {
				let district = "", contact = "", state = "", stateoffice = "", divisionaloffice = "", petrolpumpname = "", address = "", salesoffice = "", salescontactnumber = "", contactno = "", ms = "", hsd = "", xp = "", xm = "", rocode = "";
				let covideliefContact = "", xp100 = "", xp95 = "", xg = "", e100 = "", lat = "", longi ="";
				for (let j = 0; j < columnCount; j++) {
						if(j === 1) {
								lat = locations[i].split(",")[j]
						}
						if(j === 2) {
								longi = locations[i].split(",")[j]
						}
						if (j === 39) {
								if (locations[i].split(",")[j - 1] === 'Y') {
										covideliefContact = locations[i].split(",")[j] + " --" + locations[i].split(",")[j + 1];
								} else {
										covideliefContact = "N/A";
								}
						}
						if (j == 34) {
								district =  locations[i].split(",")[j] ;
						}
						if (j == 36) {
								contactno =  locations[i].split(",")[j] ;
						}
						if (j == 30) {
								contact =  locations[i].split(",")[j] ;
						}
						if (j == 35) {
								state =  locations[i].split(",")[j] ;
						}
		
						if (j == 25) {
								ms =  locations[i].split(",")[j] ;
						}
						if (j == 26) {
								hsd =  locations[i].split(",")[j] ;
						}
						if (j == 27) {
								xp =  locations[i].split(",")[j] ;
						}
						if (j == 28) {
								xm =  locations[i].split(",")[j] ;
						}
		
						if (j == 31) {
								stateoffice =  locations[i].split(",")[j] ;
						}
						if (j == 32) {
												divisionaloffice =  locations[i].split(",")[j] ;
						}
						if (j == 0) {
												petrolpumpname =  locations[i].split(",")[j] ;
						}
						if (j == 3) {
								address =  locations[i].split(",")[j] ;
						}
						if (j == 33) {
												salesoffice =  locations[i].split(",")[j] ;
						}
						if (j == 29) {
												salescontactnumber =  locations[i].split(",")[j] ;
						}
						if (j == 37) {
								rocode =  locations[i].split(",")[j] ;
						}
						if (j == 41) {
								xp100 =  locations[i].split(",")[j] ;
						}
						if (j == 42) {
								xp95 =  locations[i].split(",")[j] ;
						}
						if (j == 43) {
								xg =  locations[i].split(",")[j] ;
						}
						if (j == 44) {
								e100 =  locations[i].split(",")[j] ;
						}
		
				}
				const tempValue = [rocode,lat,longi,petrolpumpname,covideliefContact,address,contact, contactno ,ms, hsd,xp, xm,xp100,xp95,xg,e100,district,state,stateoffice,divisionaloffice,salesoffice, salescontactnumber, 
				]
				allValues.push(tempValue)
		}

		const apibackendresponse = {
			headers : ["Petrol Pump Name","COVID-19 Food &amp; Relief Contact","Address","Dealer/Partner/Operator/Contact Person Name","Contact No","Petrol Price","Diesel Price","XTRAPREMIUM Price","XTRAMILE Price","XP100 Price","XP95 Price","XG Price","E100 Price","District","State","State Office","Divisional Office","Sales Area","Sales Officer Contact No"],
			data: allValues
		}
		console.log('setting first request/response to cache', cacheKey)
		redisClient.set(cacheKey, JSON.stringify(allValues));

    context.response.body = {
      data: apibackendresponse
    };

    context.response.type = "json";
    context.response.status = Status.OK
  });

export default indianoilRoutes;