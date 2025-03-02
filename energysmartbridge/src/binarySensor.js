import { BaseSensor } from './baseSensor.js';

export class BinarySensor extends BaseSensor {
    sensorType = "binary_sensor";

    constructor (name, value, waterHeater, mqtt, isDiagnostic = false) {
        super(name, waterHeater, mqtt, isDiagnostic);
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
}