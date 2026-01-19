/* global Module */

/**
 * MMM-WasteReminder
 * MagicMirror module to display waste collection reminders
 * Supports MQTT and Calendar integration
 *
 * By axel
 * MIT Licensed
 */

Module.register("MMM-WasteReminder", {
  defaults: {
    // Data Source
    dataSource: "mqtt", // "mqtt" | "calendar" | "both"

    // MQTT Configuration
    mqttBroker: "mqtt://localhost:1883",
    mqttUsername: "",
    mqttPassword: "",
    mqttClientId: "MMM-WasteReminder",
    mqttTopic: "mqtt/0/waste/state",

    // Calendar Configuration
    calendarEnabled: true,
    calendarKeywords: {
      "gelbe tonne": "wasteYellow",
      gelbe: "wasteYellow",
      yellow: "wasteYellow",
      papier: "wasteBlue",
      "blaue tonne": "wasteBlue",
      blue: "wasteBlue",
      restmüll: "wasteBlack",
      "schwarze tonne": "wasteBlack",
      black: "wasteBlack",
      bio: "wasteBio",
      biotonne: "wasteBio",
      "grüne tonne": "wasteBio",
    },
    calendarTriggerBefore: 18, // Hours before event to trigger (18 = day before at 18:00)

    // Waste Types
    wasteTypes: {
      wasteYellow: {
        icon: "images/yellow.png",
        label: "Gelbe Tonne",
      },
      wasteBlue: {
        icon: "images/blue.png",
        label: "Papier",
      },
      wasteBlack: {
        icon: "images/black.png",
        label: "Restmüll",
      },
      wasteBio: {
        icon: "images/bio.png",
        label: "Biotonne",
      },
    },

    // Display Options
    showText: false,
    iconSize: "100px",
    animationSpeed: 1000,

    // Auto-hide Logic
    autoHideNextDayAt: "10:00", // Time to auto-hide (HH:MM format)

    // Debug
    debug: false,
  },

  // Current state
  currentWasteType: null,
  hideTimer: null,
  calendarCheckInterval: null,

  start: function () {
    Log.info("Starting module: " + this.name);
    this.currentWasteType = null;

    // Start node_helper if MQTT is enabled
    if (
      this.config.dataSource === "mqtt" ||
      this.config.dataSource === "both"
    ) {
      this.sendSocketNotification("MQTT_CONNECT", {
        broker: this.config.mqttBroker,
        username: this.config.mqttUsername,
        password: this.config.mqttPassword,
        clientId: this.config.mqttClientId,
        topic: this.config.mqttTopic,
      });
    }

    // Start calendar monitoring if enabled
    if (
      this.config.dataSource === "calendar" ||
      this.config.dataSource === "both"
    ) {
      this.startCalendarMonitoring();
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "waste-reminder-wrapper";

    // Show current waste type if set
    if (this.currentWasteType && this.currentWasteType !== "off") {
      const wasteConfig = this.config.wasteTypes[this.currentWasteType];

      if (wasteConfig) {
        const container = document.createElement("div");
        container.className = "waste-reminder-container";

        // Icon
        const icon = document.createElement("img");
        icon.src = this.file(wasteConfig.icon);
        icon.className = "waste-icon";
        icon.style.width = this.config.iconSize;
        icon.style.height = this.config.iconSize;
        container.appendChild(icon);

        // Label (optional)
        if (this.config.showText) {
          const label = document.createElement("div");
          label.className = "waste-label";
          label.innerHTML = wasteConfig.label;
          container.appendChild(label);
        }

        wrapper.appendChild(container);
      }
    }

    return wrapper;
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ["MMM-WasteReminder.css"];
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MQTT_STATE_CHANGED") {
      this.log("MQTT state changed: " + payload);
      this.setWasteType(payload);
    } else if (notification === "MQTT_ERROR") {
      Log.error("MQTT Error: " + payload);
    } else if (notification === "MQTT_CONNECTED") {
      this.log("MQTT Connected");
    }
  },

  notificationReceived: function (notification, payload, sender) {
    // Listen for calendar events from default calendar module
    if (notification === "CALENDAR_EVENTS") {
      this.processCalendarEvents(payload);
    }
  },

  /**
   * Process calendar events and trigger waste reminders
   */
  processCalendarEvents: function (events) {
    if (!this.config.calendarEnabled) return;

    const now = new Date();
    const triggerTime = new Date(
      now.getTime() + this.config.calendarTriggerBefore * 60 * 60 * 1000,
    );

    this.log("Processing " + events.length + " calendar events");

    for (let event of events) {
      const eventStart = new Date(event.startDate);

      // Check if event is within trigger window
      if (eventStart >= now && eventStart <= triggerTime) {
        const wasteType = this.matchEventToWasteType(event.title);

        if (wasteType) {
          this.log(
            "Calendar event matched: " + event.title + " -> " + wasteType,
          );
          this.setWasteType(wasteType);
          break; // Only show one at a time
        }
      }
    }
  },

  /**
   * Match calendar event title to waste type using keywords
   */
  matchEventToWasteType: function (title) {
    if (!title) return null;

    const titleLower = title.toLowerCase();

    for (let keyword in this.config.calendarKeywords) {
      if (titleLower.includes(keyword)) {
        return this.config.calendarKeywords[keyword];
      }
    }

    return null;
  },

  /**
   * Start monitoring calendar events
   */
  startCalendarMonitoring: function () {
    // Request calendar events immediately
    this.sendNotification("CALENDAR_EVENTS");

    // Check every 30 minutes
    this.calendarCheckInterval = setInterval(
      () => {
        this.sendNotification("CALENDAR_EVENTS");
      },
      30 * 60 * 1000,
    );
  },

  /**
   * Set the current waste type to display
   */
  setWasteType: function (wasteType) {
    this.log("Setting waste type to: " + wasteType);

    // Clear existing timer
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // Update state
    this.currentWasteType = wasteType;

    // Update display
    this.updateDom(this.config.animationSpeed);

    // Set auto-hide timer if not "off"
    if (wasteType !== "off" && this.config.autoHideNextDayAt) {
      this.scheduleAutoHide();
    }
  },

  /**
   * Schedule auto-hide based on config.autoHideNextDayAt
   */
  scheduleAutoHide: function () {
    const now = new Date();
    const hideTime = this.parseHideTime(this.config.autoHideNextDayAt);

    if (!hideTime) return;

    // If hide time is in the past today, schedule for tomorrow
    if (hideTime <= now) {
      hideTime.setDate(hideTime.getDate() + 1);
    }

    const msUntilHide = hideTime.getTime() - now.getTime();

    this.log(
      "Auto-hide scheduled in " +
        (msUntilHide / 1000 / 60 / 60).toFixed(1) +
        " hours",
    );

    this.hideTimer = setTimeout(() => {
      this.log("Auto-hide triggered");
      this.setWasteType("off");
    }, msUntilHide);
  },

  /**
   * Parse hide time string (HH:MM) into Date object for today
   */
  parseHideTime: function (timeString) {
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);

    if (!match) {
      Log.error("Invalid autoHideNextDayAt format: " + timeString);
      return null;
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date;
  },

  /**
   * Debug logging
   */
  log: function (message) {
    if (this.config.debug) {
      Log.info("[WasteReminder] " + message);
    }
  },

  stop: function () {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    if (this.calendarCheckInterval) {
      clearInterval(this.calendarCheckInterval);
    }
  },
});
