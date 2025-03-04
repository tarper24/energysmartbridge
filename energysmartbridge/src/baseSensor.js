import { CONFIG } from './config.js';

export class BaseSensor {
    name;
    value;
    waterHeater;
    diagnostic;

    sensorType;

    constructor (name, waterHeater, mqtt, isDiagnostic = false) {
        this.name = name;
        this.waterHeater = waterHeater;
        this.mqtt = mqtt;
        this.diagnostic = isDiagnostic;
    }

    async bootstrap () {
        await this.publishConfig();
        await this.publishState();
    }

    async updateValue (value) {
        this.value = value;
        await this.publishState();
    }

    createConfigTopic () {
        const { mqtt_homeassistant_prefix } = CONFIG();
        return `${mqtt_homeassistant_prefix}/${this.sensorType}/${this.waterHeater.deviceId}/${this.name}/config`
    }

    createStateTopic () {
        const { mqtt_prefix } = CONFIG();
        return `${mqtt_prefix}/${this.waterHeater.deviceId}/${this.name}`
    }

    async publishConfig () {
        const payload = {
            state_topic: this.createStateTopic(),
            unique_id: `${this.waterHeater.deviceId}-${this.name}`,
            name: this.name,
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
        await this.mqtt.publish(topic, this.value);
    }
}