
import express from 'express';
import { CONFIG } from './src/config.js';
import { LOGGER } from './src/logger.js';
import { WaterHeater } from './src/waterheater.js';
import { queryParser } from 'express-query-parser';
import { MQTT } from './src/mqtt.js';

LOGGER.debug({message: 'Loaded Config', CONFIG});

const WATER_HEATERS = {};
const MQTT_BROKER = new MQTT(WATER_HEATERS);

const app = express();
app.disable('x-powered-by');
app.use(
    queryParser({
      parseNull: true,
      parseUndefined: true,
      parseBoolean: true,
      parseNumber: true
    })
);

const getCreateWaterHeater = async (queryParams) => {
    const deviceId = queryParams.DeviceText;

    if (deviceId in WATER_HEATERS) {
        await WATER_HEATERS[deviceId].updateData(queryParams);
        return WATER_HEATERS[deviceId]
    } else {
        const waterHeater = new WaterHeater(MQTT_BROKER, queryParams);
        await waterHeater.updateMQTTData();
        WATER_HEATERS[deviceId] = waterHeater;

       return waterHeater;
    }
}

app.use('/~branecky/postAll.php', async (req, res) => {
    const waterHeater = await getCreateWaterHeater(req.query);
    res.status(200).end(JSON.stringify(waterHeater.toResponse()));
})

app.listen(80);

LOGGER.info({message: "Server listening on 80"});