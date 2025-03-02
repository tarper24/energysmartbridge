import { CONFIG } from './config.js';

export class Sensor {
    name;
    value;
    waterHeater;
    diagnostic;

    constructor (name, value, waterHeater, mqtt, isDiagnostic = false) {
        this.name = name;
        this.waterHeater = waterHeater;
        this.mqtt = mqtt;
        this.value = value;
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
        return `${mqtt_homeassistant_prefix}/sensor/${this.waterHeater.deviceId}/${this.name}/config`
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

        await this.mqtt.publish(this.createConfigTopic(), JSON.stringify(payload));
    }

    async publishState () {
        await this.mqtt.publish(this.createStateTopic(), this.value);
    }
}