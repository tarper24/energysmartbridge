using EnergySmartBridge.WebService;
using System.Collections.Generic;
using System.Linq;

namespace EnergySmartBridge.MQTT
{
    public static class MappingExtensions
    {
        public static string ToTopic(this WaterHeaterInput waterHeater, Topic topic)
        {
            return $"{Global.mqtt_prefix}/{waterHeater.DeviceText}/{topic}";
        }
        
        public static string GetDisplayName(this WaterHeaterInput waterHeater)
        {
            return waterHeater.DeviceText.Substring(waterHeater.DeviceText.Length - 4) + " Water Heater";
        }

        public static Climate ToThermostatConfig(this WaterHeaterInput waterHeater)
        {
            Climate ret = new Climate
            {
                name = waterHeater.GetDisplayName(),

                action_template = "{% if value == 'ON' %} heating {%- else -%} off {%- endif %}",
                action_topic = waterHeater.ToTopic(Topic.systeminheating_state),
                current_temperature_topic = waterHeater.ToTopic(Topic.uppertemp_state),

                temperature_state_topic = waterHeater.ToTopic(Topic.setpoint_state),
                temperature_command_topic = waterHeater.ToTopic(Topic.setpoint_command),

                max_temp = waterHeater.MaxSetPoint.ToString(),

                mode_state_topic = waterHeater.ToTopic(Topic.mode_state),
                mode_command_topic = waterHeater.ToTopic(Topic.mode_command),
                modes = new List<string> { "eco", "heat_pump", "electric", "off" },

                unique_id = waterHeater.DeviceText + "_water_heater",
            };

            return ret;
        }

        public static BinarySensor ToInHeatingConfig(this WaterHeaterInput waterHeater)
        {
            BinarySensor ret = new BinarySensor
            {
                name = waterHeater.GetDisplayName() + " Element",
                state_topic = waterHeater.ToTopic(Topic.systeminheating_state)
            };
            return ret;
        }

        public static BinarySensor ToGridConfig(this WaterHeaterInput waterHeater)
        {
            BinarySensor ret = new BinarySensor
            {
                name = waterHeater.GetDisplayName() + " RA Enabled",
                state_topic = waterHeater.ToTopic(Topic.grid_state),
                unique_id = waterHeater.DeviceText + "_ra_enabled",
            };
            return ret;
        }

        public static Sensor ToHotWaterVolConfig(this WaterHeaterInput waterHeater)
        {
            Sensor ret = new Sensor
            {
                name = waterHeater.GetDisplayName() + " Volume",
                state_topic = waterHeater.ToTopic(Topic.hotwatervol_state),
                unique_id = waterHeater.DeviceText + "_volume",
            };
            return ret;
        }

        public static Sensor ToUpperTempConfig(this WaterHeaterInput waterHeater)
        {
            Sensor ret = new Sensor
            {
                name = waterHeater.GetDisplayName() + " Upper",
                device_class = Sensor.DeviceClass.temperature,
                state_topic = waterHeater.ToTopic(Topic.uppertemp_state),
                unit_of_measurement = "°" + waterHeater.Units
            };
            return ret;
        }

        public static Sensor ToLowerTempConfig(this WaterHeaterInput waterHeater)
        {
            Sensor ret = new Sensor
            {
                name = waterHeater.GetDisplayName() + " Lower",
                device_class = Sensor.DeviceClass.temperature,
                state_topic = waterHeater.ToTopic(Topic.lowertemp_state),
                unit_of_measurement = "°" + waterHeater.Units
            };
            return ret;
        }

        public static BinarySensor ToDryFireConfig(this WaterHeaterInput waterHeater)
        {
            BinarySensor ret = new BinarySensor
            {
                name = waterHeater.GetDisplayName() + " Dry Fire",
                state_topic = waterHeater.ToTopic(Topic.dryfire_state),
                unique_id = waterHeater.DeviceText + "_dry_fire",
            };
            return ret;
        }

        public static BinarySensor ToElementFailConfig(this WaterHeaterInput waterHeater)
        {
            BinarySensor ret = new BinarySensor
            {
                name = waterHeater.GetDisplayName() + " Element Fail",
                state_topic = waterHeater.ToTopic(Topic.elementfail_state),
                unique_id = waterHeater.DeviceText + "_element_fail",
            };
            return ret;
        }

        public static BinarySensor ToTankSensorFailConfig(this WaterHeaterInput waterHeater)
        {
            BinarySensor ret = new BinarySensor
            {
                name = waterHeater.GetDisplayName() + " Tank Sensor Fail",
                state_topic = waterHeater.ToTopic(Topic.tanksensorfail_state),
                unique_id = waterHeater.DeviceText + "_tank_sensor_fail",
            };
            return ret;
        }
    }
}
