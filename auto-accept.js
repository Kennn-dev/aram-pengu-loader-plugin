import { htmlToElement } from "./utils";

// AUTO ACCEPT FEATURE
export const initSettingAutoAccept = () => {
  const checkbox = htmlToElement(`
    <div class="auto-accept-checkbox">
      <lol-uikit-flat-checkbox class="checked">
        <input id="autoAccept" name="autoAccept" type="checkbox" class="ember-checkbox">
        <label slot="label">Auto Accept</label>
      </lol-uikit-flat-checkbox>
    </div>`);
  const listMenu = document.querySelector(
    "div.lol-social-lower-pane-container > lol-social-roster > lol-uikit-scrollable > div.list-content"
  );
  listMenu.insertBefore(checkbox, listMenu.firstChild);

  const checkboxInput = document.querySelector("#autoAccept");
  const checked = DataStore.get("autoAcceptMode");
  checkboxInput.checked = checked;
  checkboxInput.addEventListener("change", () => {
    // Check if the checkbox is checked
    if (checkboxInput.checked) {
      console.log("checked");
      DataStore.set("autoAcceptMode", true);
    } else {
      console.log("un checked");
      DataStore.set("autoAcceptMode", false);
    }
  });
};
