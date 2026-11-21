# Bedside lighting setup

## Where things are in this repo

| File in this repo | Where it goes |
|---|---|
| `home-assistant/scripts.yaml` | merge into Home Assistant's `scripts.yaml` |
| `home-assistant/automations.yaml` | merge into `automations.yaml` (optional) |
| `home-assistant/bedside-dashboard.yaml` | paste into the dashboard's Raw configuration editor |
| `home-assistant/www/bedside-console.js` | Home Assistant `www` folder |
| `ledfx/config.json` | LedFx config folder on the Mac |
| `ledfx/start-ledfx.command` | launcher on the Mac (run `chmod +x` on it first; the guide below calls it "Start LedFx.command") |

Sanitized export of the working Bedside Console 1.6.0 setup.

Replace every YOUR_ placeholder before installation. Keep the internal
bedside_* script names unchanged: the dashboard calls them by name.

The two dashboard YAML copies previously supplied were identical; use only
bedside-dashboard.yaml. No passwords or Home Assistant tokens are needed in
these custom dashboard files: they use your existing Home Assistant login.

## Home Assistant

1. Set up both WLED integrations and the Xiaomi lamp integration first.

2. Find the real light/select entity IDs under Developer Tools -> States.

   YOUR_CORNER_MASTER_ENTITY is the corner's overall power/brightness entity.
   YOUR_CORNER_COLOUR_ENTITY is its RGBW segment entity.
   YOUR_LAMP_CONTROL_ENTITY is the lamp used by its dashboard slider/power button.
   YOUR_LAMP_WHITE_ENTITY is the white-capable Xiaomi entity used by mode scripts.

   These lamp placeholders represent the two bindings in the installed dashboard.

3. Merge scripts.yaml into your existing scripts.yaml, retaining other scripts.

   The default configuration must include:
   script: !include scripts.yaml

   Reload scripts in Developer Tools -> YAML.

4. Optional: merge the supplied Pixel automation into automations.yaml.

   It requires the phone screen and brightness entities from Fully Kiosk.
   Replace YOUR_SCREEN_AUTOMATION_ID with a unique automation ID.
   Reload automations.

   Raw brightness 40/3/0 is the calibration used on this Pixel 7, not a percentage.

5. Copy bedside-console.js into Home Assistant's www folder.

   If creating www for the first time, restart Home Assistant once.

6. Settings -> Dashboards -> Resources: register
   /local/bedside-console.js?v=1.6.0 as JavaScript Module.

   This export does not add a separate resources file in storage mode.

7. Add a dashboard with URL path dashboard-bedside.

   In its Raw configuration editor, paste bedside-dashboard.yaml.
   Reload the browser/phone.

8. Open:
   http://YOUR_HA_HOST:8123/dashboard-bedside/bedside

   To edit without the overlay, append:
   ?bedside_edit=1

## Phone display

Use landscape, full-screen and keep-screen-on settings in the Android app
or Fully Kiosk. These are phone settings, not Lovelace YAML settings.

The moon shows the large dim clock; tap anywhere to return.

Automatic dim clock runs 23:00-07:00 only when Shelf and Corner are both off,
using Home Assistant's time zone. It is implemented inside bedside-console.js.

The separate automation controls actual phone brightness:
- Raw 40 by day.
- Raw 3 in the evening.
- Raw 0 overnight or when both configured WLED lights are off.

It does not turn the lights off.

Clock movement reduces static positioning; it does not guarantee protection
from OLED burn-in.

## Lighting modes

Warm: 40%, RGBW [255,160,55,180], lamp Day/2700 K.
Day: same colours at 100%.
Cinema: 10%, purple.
Ambient: 20%, orange.
Night: 2%, red/orange.

Normal modes send lamp mode, brightness and colour as separate commands.

Music only enables the WLED strips' live input; the bedside lamp is unchanged.
Other modes block live input before applying their colours/power.

Home Assistant scripts also appear as choices for iPhone script controls.
Select Bedside Music when configuring an iPhone Control Centre control.

## Mac music lighting

Keep the supplied outputs directory beside work/ledfx-runtime.

The launcher expects:
- work/ledfx-runtime/venv
- work/ledfx-runtime/config/config.json

The exported config.json belongs in that config directory, not in Home Assistant.

It is the sanitized LedFx-generated configuration, with a discarded trial effect
removed. Its configuration_version field is LedFx's saved schema version.

Use the existing installed LedFx 2.2.1, Python 3.12, PortAudio and BlackHole 2ch.

For a fresh Mac, install those dependencies and create the virtual environment
before using the launcher. Packages and installers are not included in this export.

Replace the IP and device-ID placeholders in config.json consistently.

Replace YOUR_BLACKHOLE_DEVICE_INDEX with the correct numeric index, without
quotes, or select BlackHole 2ch through LedFx's Audio settings instead of
importing the audio settings.

Use LedFx's generated instance ID for YOUR_LEDFX_INSTANCE_ID.

YOUR_LOOPBACK_IP must be the Mac's IPv4 loopback address; keep the UI local.
YOUR_BROADCAST_IP is the network broadcast address used by the unused LIFX setting.

In Audio MIDI Setup:
1. Create Multi-Output Device.
2. Check your Bluetooth output and BlackHole 2ch.
3. Set the physical output as Primary Device.
4. Enable drift correction for BlackHole.
5. Choose Multi-Output Device as Mac sound output.

LedFx input must be BlackHole 2ch. Choose the saved Music scene if needed.

Double-click Start LedFx.command; keep its Terminal window open.
Then press Music on the dashboard.

Stop LedFx with Control+C in its Terminal.

Music does not wake the Mac or launch LedFx.
Keep the Mac awake for music lighting.

To change speaker/headphones, change the physical member of Multi-Output Device.
Volume may need adjusting in the music app or on the speaker/headphones.

Normal modes leave LedFx running and tell WLED to ignore its stream.
A controller restart or interruption to the stream may reset that override;
reselect the normal mode if necessary.

No Mac network API exposure or Home Assistant upgrade is required.
