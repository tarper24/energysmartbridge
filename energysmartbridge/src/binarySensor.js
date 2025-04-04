import { BaseSensor } from './baseSensor.js';

export class BinarySensor extends BaseSensor {
    sensorType = "binary_sensor";

    constructor (name, waterHeater, value, mqtt, options = {}) {
        super(name, waterHeater, value, mqtt, options);
        this.value = this.convertValue(this.value);
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
                return (this.inverse ? 'ON' : 'OFF');
            case 'ENABLED':
            case 'TRUE':
            case 'OK':
            case 'DETECTED':
                return (this.inverse ? 'OFF' : 'ON');
            default:
                // log unknown value
                return value;
        }
    }

    async updateValue (value) {
        this.value = this.convertValue(value);
        await this.publishState();
    }
}