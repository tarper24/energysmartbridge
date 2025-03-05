import { BaseSensor } from './baseSensor.js';
import { LOGGER } from './logger.js';
import { READABLE_MAPPING } from './mappings.js';

export class NumberSensor extends BaseSensor {
    sensorType = "number";
    minimum;
    maximum;
    measurementUnit;

    constructor (name, waterHeater, value, mqtt, measurementUnit, isDiagnostic = false,  minimum = 1, maximum = 200) {
        super(name, waterHeater, value, mqtt, isDiagnostic);
        this.maximum = maximum;
        this.minimum = minimum;
    }

    async bootstrap () {
        await this.publishConfig();
        await this.publishState();
    }

    async publishConfig () {
        const payload = {
            state_topic: this.createStateTopic(),
            unique_id: `${this.waterHeater.deviceId}-${this.name}`,
            name: READABLE_MAPPING[this.name],
            min: this.minimum,
            max: this.maximum,
            unit_of_measurement: "°F",
            ...this.waterHeater.generateDeviceConfig(),
        };

        if (this.diagnostic) {
            payload.entity_category = 'diagnostic'
        }

        const topic = this.createConfigTopic();
        
        LOGGER.trace({message: "Publishing config", topic, name: this.name});

        await this.mqtt.publish(topic, JSON.stringify(payload));
    }

    async publishState () {
        const topic = this.createStateTopic();
        LOGGER.trace({message: "Publishing state", topic, name: this.name, value: this.value});
        await this.mqtt.publish(topic, this.value.toFixed(0));
    }
}