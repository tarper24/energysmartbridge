import { BaseSensor } from './baseSensor.js';

export class Sensor extends BaseSensor {
    sensorType = "sensor";

    constructor (name, value, waterHeater, mqtt, isDiagnostic = false) {
        super(name, waterHeater, mqtt, isDiagnostic);
        this.value = value
    }
}