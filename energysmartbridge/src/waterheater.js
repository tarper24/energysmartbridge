const MODE_MAPPING = {
    'Electric': 'electric',
    'Standard': "electric",
    'Efficiency': "heat_pump",
    'EnergySmart': "eco",
    'Hybrid': "eco",
    'Vacation': "off",
};

const MAPPING = {
    DeviceText: 'deviceId',
    Password: 'password',
    ModuleApi: 'moduleAPI',
    ModFwVer: 'moduleFirmwareVersion',
    MasterFwVer: 'masterFirmwareVersion',
    MasterModelId: 'masterModelId',
    DisplayFwVer: 'displayFirmwareVersion',
    WifiFwVer: 'wifiFirmwareVersion',
    UpdateRate: 'updateRate',
    Mode: 'mode',
    SetPoint: 'setPoint',
    Units: 'units',
    LeakDetect: 'leakDetected',
    MaxSetPoint: 'maxSetPoint',
    Grid: 'grid',
    AirFilterStatus: 'airFilterStatus',
    CondensePumpFail: 'condensePumpFail',
    AvailableModes: 'availableModes',
    SystemInHeating: 'heating',
    HotWaterVol: 'hotWaterVolume',
    Leak: 'leak',
    DryFire: 'dryFire',
    ElementFail: 'elementFail',
    TankSensorFail: 'tankSensorFail',
    EcoError: 'ecoError',
    MasterDispFail: 'masterDisplayFail',
    CompSensorFail: 'systemSensorFail',
    SysSensorFail: 'systemSensorFail',
    SystemFail: 'systemFail',
    UpperTemp: 'upperTemperature',
    LowerTemp: 'lowerTemperature',
    FaultCodes: 'faultCodes',
    UnConnectNumber: 'unConnectNumber',
    AddrData: 'addressData',
    SignalStrength: 'signalStrength',
};

export const COMMAND_MAPPING = {
    mode: 'Mode',
    updateRate: 'UpdateRate',
    temperature: 'SetPoint',
}

export class WaterHeater {
    mqtt;
    pendingCommands;

    constructor (mqtt, queryParams) {
        this.mqtt = mqtt;
        this.convertQueryParams(queryParams);

        this.createHomeAssistantConfig();
        this.listenForCommands();
    }

    updatePendingCommands (key, value) {
        if (key in COMMAND_MAPPING) {
            if (!this.pendingCommands) {
                this.pendingCommands = {};
            }

            this.pendingCommands[COMMAND_MAPPING[key]] = value;
        }
    }

    toResponse () {
        const response = {
            ...this.pendingCommands,
            Success: "0",
        }

        delete this.pendingCommands;

        return response;
    }

    convertQueryParams (queryParams) {
        const keys = Object.keys(queryParams);
        for (const key of keys) {
            if (key in MAPPING) {
                switch (key) {
                    case 'AvailableModes':
                        this[MAPPING[key]] = queryParams[key].split(',')
                        break;
                    default:
                        this[MAPPING[key]] = queryParams[key]
                }
            }
        }
    }

    async updateData(queryParams) {
        this.convertQueryParams(queryParams);

        await this.updateMQTTData();
    }

    generateDeviceConfig () {
        return {
            device: {
                "identifiers":[this.deviceId],
                "name":`Hot Water Heater ${this.deviceId}`,
                "model_id": this.masterModelId,
                "serial_number": this.deviceId,
                "sw_version": this.masterFirmwareVersion,
            }
        }
    }

    generateModeMappingTemplate (inverse) {
        const mapping = {};

        for (const mode of this.availableModes) {
            if (mode in MODE_MAPPING) {
                if (inverse) {
                    mapping[MODE_MAPPING[mode]] = mode;
                } else {
                    mapping[mode] = MODE_MAPPING[mode];
                }
            }
        }

        return `{% set lookup = ${JSON.stringify(mapping)} %}{{- lookup[value] -}}`;
    }

    async listenForCommands () {
        await this.mqtt.subscribe(`energysmartbridge/${this.deviceId}/commands/temperature`);
        await this.mqtt.subscribe(`energysmartbridge/${this.deviceId}/commands/mode`);
    }

    async createHomeAssistantConfig () {
        await this.mqtt.publish(`homeassistant/water_heater/${this.deviceId}/config`, JSON.stringify({
            // Mode Config
            mode_state_topic: `energysmartbridge/${this.deviceId}/mode`,
            mode_state_template: this.generateModeMappingTemplate(false),
            modes: ["eco", "electric", "off"], // list of supported modes

            mode_command_topic: `energysmartbridge/${this.deviceId}/commands/mode`,
            mode_command_template: this.generateModeMappingTemplate(true),

            // Temperature
            temperature_state_topic: `energysmartbridge/${this.deviceId}/set_point`,
            temperature_command_topic: `energysmartbridge/${this.deviceId}/commands/temperature`,
            current_temperature_topic: `energysmartbridge/${this.deviceId}/current_temperature`,
            max_temp: this.maxSetPoint,

            unique_id: `${this.deviceId}_water_heater`,
            ...this.generateDeviceConfig(),
        }), {retain: true});
    }

    async updateMQTTData () {
        await this.mqtt.publish(`energysmartbridge/${this.deviceId}/upper_temperature`, this.upperTemperature.toString());
        await this.mqtt.publish(`energysmartbridge/${this.deviceId}/lower_temperature`, this.lowerTemperature.toString());
        await this.mqtt.publish(`energysmartbridge/${this.deviceId}/current_temperature`, ((this.lowerTemperature + this.upperTemperature) / 2).toFixed(0));

        await this.mqtt.publish(`energysmartbridge/${this.deviceId}/mode`, this.mode);
        await this.mqtt.publish(`energysmartbridge/${this.deviceId}/set_point`, this.setPoint.toString());
    }
}