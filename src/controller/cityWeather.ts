import { RequestHandler, Request, Response, NextFunction } from "express";
import CityWeather from "../models/cityWeather";
import NodeCache from "node-cache";
import axios from "axios";

const cityCache = new NodeCache({stdTTL: 60});

interface CityData {
  name: string
  state: string
  country: string
}

const getCityLatLong = async(cityData: CityData) => {
  const cityApi = `http://api.openweathermap.org/geo/1.0/direct?q=${cityData.name},${cityData.state},${cityData.country}&appid=${process.env.WEATHER_API_KEY}`;
  const {data: cityResponse} =  await axios.get(cityApi);
  if (cityResponse.length) {
    return {
      lat: cityResponse[0].lat,
      long: cityResponse[0].lon,
    }
  }
  return {};
}

const getWeatherFromLatLon = async(latLonData: any) => {
  const cityApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latLonData.lat}&lon=${latLonData.long}&appid=${process.env.WEATHER_API_KEY}`;
  const {data: cityResponse} =  await axios.get(cityApi);
  if (cityResponse?.main) {
    return cityResponse.main.temp
  }
  return null;
}

export const createCity: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const cityData: CityData = req.body; // name, state, country
  const city = await CityWeather.findOne({where: {
    name: cityData.name,
    state: cityData.state, 
    country: cityData.country,
  }})
  if (city) {
    return res.status(500).json({message: 'City already exists'});
  }
  const latLongData = await getCityLatLong(cityData);

  const temp = await getWeatherFromLatLon(latLongData);
  const dbData =  {...cityData, ...latLongData, temp };

  cityCache.set(`${cityData.name},${cityData.state},${cityData.country}`, dbData);

  const dbCity = await CityWeather.create(dbData);

  return res.status(200).json({message: 'City created', data: dbCity});
}

export const updateCity: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id } =  req.params;
  const cityData: CityData = req.body;
  const city = await CityWeather.findOne({where: {
    id
  }})
  if (!city) {
    return res.status(500).json({message: 'City not found'});
  }

  let dbData = {};
  if(cityCache.has(`${cityData.name},${cityData.state},${cityData.country}`)) {
    const cityExist = await CityWeather.findOne({where: {
      name: cityData.name,
      state: cityData.state, 
      country: cityData.country,
    }})
    if (cityExist) {
      return res.status(500).json({message: 'City already exists'});
    }
    dbData = cityCache.get(`${cityData.name},${cityData.state},${cityData.country}`) || {};
  } else {
    const latLongData = await getCityLatLong(cityData);

    const temp = await getWeatherFromLatLon(latLongData);
    dbData =  {...cityData, ...latLongData, temp };
    cityCache.set(`${cityData.name},${cityData.state},${cityData.country}`, dbData);
  }

  const dbCity = await CityWeather.update(dbData, {where: {id}});

  return res.status(200).json({message: 'City updated', data: dbCity});
}

export const removeCity: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id } =  req.params;
  const city = await CityWeather.findOne({where: {
    id
  }})
  if (!city) {
    return res.status(500).json({message: 'City not found'});
  }
  await CityWeather.destroy({where: { id }});
  return res.status(200).json({message: 'City removed', data: city});
}

export const listCity: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const cities = await CityWeather.findAll({});
  const updateIndexes = [];
  const tmpPromise = [];
  for (let cityCount = 0; cityCount < cities.length; cityCount++) {
    let cityData = cities[cityCount];
    if (!cityCache.has(`${cityData.name},${cityData.state},${cityData.country}`)) {
      updateIndexes.push(cityCount);
      tmpPromise.push(getWeatherFromLatLon(cityData));
    }
  }
  const tmps = await Promise.allSettled(tmpPromise)
  for (let tmpsCount = 0; tmpsCount < tmps.length; tmpsCount++) {
    const tmp = tmps[tmpsCount]
    if (tmp.status === 'fulfilled') {
      const cityData = cities[updateIndexes[tmpsCount]];
      cityData.temp = tmp.value
      cityCache.set(`${cityData.name},${cityData.state},${cityData.country}`, cityData);
    }
  }
  return res.status(200).json({message: 'Cities fetched', data: cities});
}
