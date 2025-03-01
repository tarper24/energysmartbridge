import { CONFIG } from './config.js';

export class BinarySensor {
    name;
    value;
    waterHeater;

    constructor (name, value, waterHeater, mqtt) {
        this.name = name;
        this.waterHeater = waterHeater;
        this.mqtt = mqtt;
        this.value = this.convertValue(value);
    }

    async bootstrap () {
        await this.publishConfig();
        await this.publishState();
    }

    convertValue (value) {
        switch (value.toUpperCase()) {
            case 'DISABLED':
            case 'FALSE':
            case 'NONE':
            case 'NOTDETECTED':
                return 'OFF';
                break;
            case 'ENABLED':
            case 'TRUE':
            case 'OK':
                return 'ON';
                break;
            default:
                // log unknown value
                return value;
        }
    }

    async updateValue (value) {
        this.value = this.convertValue(value);
        await this.publishState();
    }

  //"HotWaterVol":"High",
  //"FaultCodes":"0",

    createConfigTopic () {
        const { mqtt_homeassistant_prefix } = CONFIG();
        return `${mqtt_homeassistant_prefix}/binary_sensor/${this.waterHeater.deviceId}/${this.name}/config`
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
        await this.mqtt.publish(this.createConfigTopic(), JSON.stringify(payload));
    }

    async publishState () {
        await this.mqtt.publish(this.createStateTopic(), this.value);
    }
}