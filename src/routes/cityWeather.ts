import { Router } from "express";
import { createCity, listCity, removeCity, updateCity } from "../controller/cityWeather";

const router = Router();

router.post('/city', createCity);
router.get('/cities', listCity);
router.put('/city/:id', updateCity);
router.delete('/city/:id', removeCity);

export default router;