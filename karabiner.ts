import fs from "fs";
import { KarabinerRules } from "./types";
import { createDisableKeyMapOnPrograms } from "./disableKeyMapsOfProgram";
import { createHyperKeyRules } from "./hyperKeyRules";
import { createFnKeyMaps } from "./fnKeyRules";
import { createMouseKeyRules } from "./mouseKeysRules";
import karabinerRaw from "./karabiner_raw.json";

const rules: KarabinerRules[] = [
  ...createHyperKeyRules(),
  ...createDisableKeyMapOnPrograms(),
  createFnKeyMaps(),
  createMouseKeyRules(),
  ...(karabinerRaw.rawJson as KarabinerRules[]),
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        ask_for_confirmation_before_quitting: true,
        check_for_updates_on_startup: true,
        show_in_menu_bar: true,
        show_profile_name_in_menu_bar: false,
        unsafe_ui: false,
      },
      profiles: [
        {
          name: "Quang Nguyen Karabiner modified",
          complex_modifications: {
            rules,
          },
          parameters: {
            delay_milliseconds_before_open_device: 1000,
            "basic.simultaneous_threshold_milliseconds": 50,
            "basic.to_delayed_action_delay_milliseconds": 500,
            "basic.to_if_alone_timeout_milliseconds": 500,
            "basic.to_if_held_down_threshold_milliseconds": 500,
            "mouse_motion_to_scroll.speed": 100,
          },
          selected: true,
          simple_modifications: [],
          virtual_hid_keyboard: {
            country_code: 0,
            indicate_stiky_modifier_keys_state: true,
            mouse_key_xy_scale: 100,
          },
        },
      ],
    },
    null,
    2,
  ),
);
