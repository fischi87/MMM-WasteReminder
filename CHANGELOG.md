# Changelog

All notable changes to MMM-WasteReminder are documented here.

## [Unreleased]

### Added
- Support for displaying multiple waste bins on the same day simultaneously
  - Calendar events: all matching events within the trigger window are now collected and shown at once (previously only the first match was shown)
  - Icons are displayed side by side in the wrapper
- MQTT `off` command now clears all active waste types

### Changed
- Internal state changed from single `currentWasteType` to `currentWasteTypes` array
- `setWasteType()` replaced by `setWasteTypes(array)` for consistent multi-type handling
- CSS wrapper now uses `flex-direction: row` with `flex-wrap: wrap` and `gap` to support multiple icons

## [1.0.0] - Initial Release

### Added
- MQTT data source support (ioBroker, Mosquitto, any MQTT broker)
- Calendar integration via MagicMirror `CALENDAR_EVENTS` notification
- Configurable waste types (Yellow, Blue, Black, Bio) with custom icons and labels
- Keyword-based calendar event matching (case-insensitive)
- Auto-hide timer (`autoHideNextDayAt`)
- Configurable trigger window (`calendarTriggerBefore`)
- `dataSource` option: `"mqtt"`, `"calendar"`, or `"both"`
- Optional text labels below icons (`showText`)
- Debug logging mode
