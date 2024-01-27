namespace EnergySmartBridge.MQTT
{
    public enum Topic
    {
        updaterate_state,
        updaterate_command,
        mode_state,
        mode_command,
        maxsetpoint_state,
        setpoint_state,
        setpoint_command,
        systeminheating_state,
        hotwatervol_state,
        uppertemp_state,
        lowertemp_state,
        dryfire_state,
        elementfail_state,
        tanksensorfail_state,
        faultcodes_state,
        signalstrength_state,
        grid_state,
        air_filter_status_state,
        condense_pump_fail_state,
        leak_detect_state,
    }
}
