import { BaseSensor } from './baseSensor.js';
import { LOGGER } from './logger.js';
import { DEVICE_CLASS_MAPPING, READABLE_MAPPING } from './mappings.js';

export class Sensor extends BaseSensor {
    sensorType = "sensor";

    unit;

    constructor (name, waterHeater, value, mqtt, isDiagnostic = false, unit = undefined) {
        super(name, waterHeater, value, mqtt, isDiagnostic);

        this.unit = unit;
    }

    async publishConfig () {
        const payload = {
            state_topic: this.createStateTopic(),
            unique_id: `${this.waterHeater.deviceId}-${this.name}`,
            name: READABLE_MAPPING[this.name],
            object_id: `${this.waterHeater.deviceId}_${READABLE_MAPPING[this.name].replaceAll(" ", "_")}`,
            ...this.waterHeater.generateDeviceConfig(),
        };

        if (this.diagnostic) {
            payload.entity_category = 'diagnostic'
        }

        if (this.name in DEVICE_CLASS_MAPPING) {
            payload.device_class = DEVICE_CLASS_MAPPING[this.name];
        }

        if (this.unit) {
            payload.unit_of_measurement = this.unit;
            payload.state_class = 'measurement';
        }

        const topic = this.createConfigTopic();
        
        LOGGER.trace({message: "Publishing config", topic, name: this.name});

        await this.mqtt.publish(topic, JSON.stringify(payload));
    }
}