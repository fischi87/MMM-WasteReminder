/**
 * Node Helper for MMM-WasteReminder
 * Handles MQTT connection and message routing
 */

const NodeHelper = require("node_helper");
const mqtt = require("mqtt");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for: " + this.name);
    this.mqttClient = null;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "MQTT_CONNECT") {
      this.connectToMQTT(payload);
    }
  },

  /**
   * Connect to MQTT broker
   */
  connectToMQTT: function(config) {
    // Disconnect existing client if any
    if (this.mqttClient) {
      this.mqttClient.end();
    }

    const options = {
      clientId: config.clientId || "MMM-WasteReminder",
      clean: true
    };

    // Add credentials if provided
    if (config.username) {
      options.username = config.username;
    }
    if (config.password) {
      options.password = config.password;
    }

    console.log("[WasteReminder] Connecting to MQTT broker: " + config.broker);

    try {
      this.mqttClient = mqtt.connect(config.broker, options);

      // Connection success
      this.mqttClient.on("connect", () => {
        console.log("[WasteReminder] MQTT Connected");
        this.sendSocketNotification("MQTT_CONNECTED", true);

        // Subscribe to topic
        this.mqttClient.subscribe(config.topic, (err) => {
          if (err) {
            console.error("[WasteReminder] MQTT Subscribe error:", err);
            this.sendSocketNotification("MQTT_ERROR", err.message);
          } else {
            console.log("[WasteReminder] Subscribed to: " + config.topic);
          }
        });
      });

      // Message received
      this.mqttClient.on("message", (topic, message) => {
        const payload = message.toString();
        console.log("[WasteReminder] MQTT message received:", topic, "=", payload);
        this.sendSocketNotification("MQTT_STATE_CHANGED", payload);
      });

      // Error handling
      this.mqttClient.on("error", (err) => {
        console.error("[WasteReminder] MQTT Error:", err);
        this.sendSocketNotification("MQTT_ERROR", err.message);
      });

      // Reconnect handling
      this.mqttClient.on("reconnect", () => {
        console.log("[WasteReminder] MQTT Reconnecting...");
      });

      // Disconnect handling
      this.mqttClient.on("close", () => {
        console.log("[WasteReminder] MQTT Connection closed");
      });

    } catch (err) {
      console.error("[WasteReminder] MQTT Connection failed:", err);
      this.sendSocketNotification("MQTT_ERROR", err.message);
    }
  },

  stop: function() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }
});
