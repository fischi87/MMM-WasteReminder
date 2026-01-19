# MMM-WasteReminder

A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that displays waste collection reminders. Supports MQTT and Calendar integration for maximum flexibility.

## Features

- 🎯 **Multiple Data Sources**: MQTT, Calendar, or both
- 🗑️ **Customizable Waste Types**: Yellow, Blue, Black, Bio bins (fully configurable)
- ⏰ **Auto-Hide Timer**: Automatically hide reminders at a specific time
- 🎨 **Custom Icons**: Replace default icons with your own
- 📱 **MQTT Control**: Trigger via ioBroker, Mosquitto, or any MQTT client
- 📅 **Calendar Integration**: Works with MagicMirror's default calendar module
- 🔧 **Highly Configurable**: Adapt to your needs

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/yourusername/MMM-WasteReminder.git
cd MMM-WasteReminder
npm install
```

## Configuration

### Minimal Configuration (MQTT)

```javascript
{
  module: "MMM-WasteReminder",
  position: "top_right",
  config: {
    dataSource: "mqtt",
    mqttBroker: "mqtt://localhost:1883",
    mqttTopic: "mqtt/0/waste/state"
  }
}
```

### Full Configuration Example

```javascript
{
  module: "MMM-WasteReminder",
  position: "top_right",
  config: {
    // Data Source
    dataSource: "both",              // "mqtt" | "calendar" | "both"

    // MQTT Configuration
    mqttBroker: "mqtt://192.168.1.100:1883",
    mqttUsername: "",                // Optional
    mqttPassword: "",                // Optional
    mqttClientId: "MMM-WasteReminder",
    mqttTopic: "mqtt/0/waste/state",

    // Calendar Configuration
    calendarEnabled: true,
    calendarKeywords: {
      "gelbe tonne": "wasteYellow",
      "yellow": "wasteYellow",
      "papier": "wasteBlue",
      "paper": "wasteBlue",
      "restmüll": "wasteBlack",
      "residual": "wasteBlack",
      "bio": "wasteBio",
      "organic": "wasteBio"
    },
    calendarTriggerBefore: 18,       // Hours before event to trigger (18 = day before at 18:00)

    // Waste Types (customize your bins)
    wasteTypes: {
      wasteYellow: {
        icon: "images/yellow.png",
        label: "Yellow Bin"
      },
      wasteBlue: {
        icon: "images/blue.png",
        label: "Paper"
      },
      wasteBlack: {
        icon: "images/black.png",
        label: "Residual Waste"
      },
      wasteBio: {
        icon: "images/bio.png",
        label: "Organic Waste"
      }
    },

    // Display Options
    showText: true,                  // Show label below icon
    iconSize: "150px",               // Icon size
    animationSpeed: 1000,

    // Auto-hide
    autoHideNextDayAt: "10:00",     // Hide at 10:00 next day

    // Debug
    debug: false
  }
}
```

## Usage

### MQTT Control

#### With ioBroker

Create a datapoint `mqtt.0.waste.state` and set values:

```javascript
// Show yellow bin
setState("mqtt.0.waste.state", "wasteYellow");

// Show blue bin
setState("mqtt.0.waste.state", "wasteBlue");

// Hide all
setState("mqtt.0.waste.state", "off");
```

**Example ioBroker Script** (trigger day before at 18:00):

```javascript
// Schedule for next waste collection
schedule("0 18 * * 6", function () {
  // Every Saturday at 18:00
  setState("mqtt.0.waste.state", "wasteYellow");
  log("Yellow bin reminder activated");
});
```

#### With Mosquitto (Command Line)

```bash
# Show yellow bin
mosquitto_pub -h localhost -t "mqtt/0/waste/state" -m "wasteYellow"

# Show blue bin
mosquitto_pub -h localhost -t "mqtt/0/waste/state" -m "wasteBlue"

# Hide
mosquitto_pub -h localhost -t "mqtt/0/waste/state" -m "off"
```

### Calendar Integration

1. Add the default calendar module to your MagicMirror config
2. Add waste collection events to your calendar with titles like:
   - "Gelbe Tonne" / "Yellow Bin"
   - "Papier" / "Paper"
   - "Restmüll" / "Residual Waste"
   - "Biotonne" / "Organic Waste"

3. The module will automatically display the reminder 18 hours before the event (configurable)

**Example Calendar Config:**

```javascript
{
  module: "calendar",
  position: "top_left",
  config: {
    calendars: [
      {
        url: "https://calendar.google.com/calendar/ical/...",
        name: "Waste Collection"
      }
    ]
  }
}
```

## MQTT Message Reference

| Value         | Description                  |
| ------------- | ---------------------------- |
| `wasteYellow` | Display yellow bin           |
| `wasteBlue`   | Display blue bin (paper)     |
| `wasteBlack`  | Display black bin (residual) |
| `wasteBio`    | Display bio bin              |
| `off`         | Hide all bins                |

## Customization

### Custom Icons

Replace the default icons in the `images/` directory with your own PNG files:

```
MMM-WasteReminder/
└── images/
    ├── yellow.png
    ├── blue.png
    ├── black.png
    └── bio.png
```

Or specify custom paths in the config:

```javascript
wasteTypes: {
  wasteYellow: {
    icon: "modules/MMM-WasteReminder/my-icons/custom-yellow.png",
    label: "Yellow Bin"
  }
}
```

### Custom CSS Animations

Add custom animations in `~/MagicMirror/css/custom.css`:

```css
/* Pulsing animation */
.waste-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Rotating animation */
.waste-icon {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## Configuration Options

| Option                  | Type    | Default                   | Description                                      |
| ----------------------- | ------- | ------------------------- | ------------------------------------------------ |
| `dataSource`            | String  | `"mqtt"`                  | Data source: `"mqtt"`, `"calendar"`, or `"both"` |
| `mqttBroker`            | String  | `"mqtt://localhost:1883"` | MQTT broker URL                                  |
| `mqttUsername`          | String  | `""`                      | MQTT username (optional)                         |
| `mqttPassword`          | String  | `""`                      | MQTT password (optional)                         |
| `mqttClientId`          | String  | `"MMM-WasteReminder"`     | MQTT client ID                                   |
| `mqttTopic`             | String  | `"mqtt/0/waste/state"`    | MQTT topic to subscribe                          |
| `calendarEnabled`       | Boolean | `true`                    | Enable calendar integration                      |
| `calendarKeywords`      | Object  | See config                | Keywords to match calendar events                |
| `calendarTriggerBefore` | Number  | `18`                      | Hours before event to trigger                    |
| `wasteTypes`            | Object  | See config                | Waste type configurations                        |
| `showText`              | Boolean | `false`                   | Show label below icon                            |
| `iconSize`              | String  | `"100px"`                 | Icon size (CSS value)                            |
| `animationSpeed`        | Number  | `1000`                    | DOM update animation speed (ms)                  |
| `autoHideNextDayAt`     | String  | `"10:00"`                 | Time to auto-hide (HH:MM format)                 |
| `debug`                 | Boolean | `false`                   | Enable debug logging                             |

## Roadmap (v1.1+)

- [ ] Direct iCal URL support
- [ ] CSV file import
- [ ] Multiple waste types simultaneously
- [ ] Notification sounds
- [ ] Custom notification messages

## Troubleshooting

### Module not showing

1. Check MQTT connection: `tail -f ~/.pm2/logs/MagicMirror-out.log`
2. Enable debug mode: `debug: true`
3. Verify MQTT topic is correct
4. Test MQTT manually with `mosquitto_pub`

### Calendar events not triggering

1. Verify calendar module is loaded
2. Check keyword matching in `calendarKeywords`
3. Ensure events are within trigger window (`calendarTriggerBefore`)

## License

MIT

## Credits

Developed for MagicMirror² integration with ioBroker and MQTT systems.
