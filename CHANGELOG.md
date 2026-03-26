# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Multiple waste bins can now be displayed simultaneously side by side
- Calendar integration now collects **all** matching waste types within the trigger window, not just the first one
- MQTT supports comma-separated payloads (e.g. `"wasteYellow,wasteBlue"`) to trigger multiple bins at once
- MQTT also accepts JSON arrays (e.g. `["wasteYellow","wasteBio"]`) for multi-bin payloads

### Changed
- Internal state changed from `currentWasteType` (string) to `currentWasteTypes` (array)
- `setWasteType()` replaced by `setWasteTypes()` — accepts both arrays and single strings (backwards compatible)
- Auto-hide now clears all active bin reminders at once
- Added `gap: 16px` to `.waste-reminder-wrapper` so multiple icons are spaced correctly
