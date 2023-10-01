import { delay, htmlToElement } from "./utils";
const initStateCheckboxPrePick = () => {
  // Add event and init value
  const prePickCheckbox = document.getElementById("autoPickChamp");
  const prePickModeCheck = DataStore.get("prePickMode");
  prePickCheckbox.checked = prePickModeCheck;
  prePickCheckbox.addEventListener("change", () => {
    // Check if the checkbox is checked
    if (prePickCheckbox.checked) {
      DataStore.set("prePickMode", true);
    } else {
      DataStore.set("prePickMode", false);
    }
  });
};
const handleSelect = (id) => {
  const champs = DataStore.get("champions");
  const pool = DataStore.get("champPool");
  const selected = champs.findIndex((c) => c.id === id);
  if (selected !== -1) {
    champs[selected].checked = !champs[selected].checked;
    DataStore.set("championss", champs);

    const champion = document.getElementById(id + "-prepick-champ");
    if (champs[selected].checked) {
      champion.classList.add("active-item");

      const newPool = [...pool];

      newPool.push(champs[selected]);
      DataStore.set("champPool", newPool);
      renderListOrder();
    } else {
      champion.classList.remove("active-item");

      const newPool = pool.filter((z) => z.id !== champs[selected].id);
      DataStore.set("champPool", newPool);
      renderListOrder();
    }

    DataStore.set("champions", champs);
  }
};

const renderListOrder = () => {
  const orderList = document.getElementById("ken-order-list");
  // const champs = DataStore.get("champions");
  const pool = DataStore.get("champPool");
  console.log({ pool });
  const text = pool.map((v) => v.name).join(" , ");
  orderList.textContent = "[" + text + "]";
};

const renderListChampions = () => {
  const listChamp = document.getElementById("ken-champion-list");

  const listChampData = DataStore.get("champions");
  const wrapper = document.createElement("div");
  wrapper.className = "ken-champion-list";

  listChampData
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    })
    .map((c) => {
      const champion = document.createElement("div");
      const avatar = document.createElement("img");
      avatar.src = c.squarePortraitPath;

      let className = "ken-champion-item";
      if (c.checked) {
        className = className + " active-item";
      }
      champion.className = className;
      champion.id = `${c.id}-prepick-champ`;
      champion.textContent = c.name;
      champion.appendChild(avatar);

      champion.addEventListener("click", () => {
        console.log("Click ", c);
        //   champion.textContent = c.name;
        handleSelect(c.id);
      });

      wrapper.appendChild(champion);
    });

  listChamp.replaceChildren(wrapper);
};

const initClearButton = () => {
  const btn = document.getElementById("clear-pool");
  btn.addEventListener("click", () => {
    DataStore.set("champPool", []);

    const champs = DataStore.get("champions");
    DataStore.set(
      "champions",
      champs.map((v) => ({ ...v, checked: false }))
    );
    renderListOrder();
    renderListChampions();
  });
};

export function prePickChampionsUI() {
  const listMenu = document.querySelector(
    "div.lol-social-lower-pane-container > lol-social-roster > lol-uikit-scrollable > div.list-content"
  );

  const selectChampUI = document.createElement("div");
  const listChamp = document.createElement("div");
  // listChamp.className = "ken-champion-list";
  listChamp.id = "ken-champion-list";
  selectChampUI.className = "ken-modal-champions";
  selectChampUI.id = "ken-modal-champions";

  //   Item
  selectChampUI.appendChild(listChamp);

  const checkbox = htmlToElement(`
  <div class="auto-pick-champ">
    <lol-uikit-flat-checkbox class="checked">
      <input id="autoPickChamp" name="autoPickChamp" type="checkbox" class="ember-checkbox">
      <label slot="label">Auto Pick Champion</label>
    </lol-uikit-flat-checkbox>
  </div>`);

  selectChampUI.appendChild(checkbox);

  // Order list

  const orderList = document.createElement("div");
  orderList.id = "ken-order-list";
  orderList.style.marginLeft = "10px";
  listMenu.appendChild(orderList);
  renderListOrder();

  // Clear button
  const clearBtn =
    htmlToElement(`<div style="position : relative;width: 100%;height: 38px;">
    <lol-uikit-flat-button-secondary id="clear-pool" style="padding : 10px;position : absolute;right: 0;left: 0;top:0;" class="lol-settings-reset-button">
    Clear
  </lol-uikit-flat-button-secondary>
  </div>`);

  listMenu.appendChild(clearBtn);

  selectChampUI.appendChild(listChamp);

  listMenu.appendChild(selectChampUI);

  initClearButton();
  renderListChampions();

  //  12
  initStateCheckboxPrePick();
}
// id 2 index 1
export async function prePickChampionEvent(match) {
  try {
    // BUG : Force pick a champ not in pool
    // save global
    // const myPickInfo = DataStore.get("myPickInfo");
    // let finalChampId = myPickInfo.id;
    // let finalChampIndex = myPickInfo.index;

    let finalChampId = null;
    let finalChampIndex = null;
    console.log("pre pick sTART ======     ", {});
    // TODOS : Debug
    const res = await fetch("/lol-gameflow/v1/gameflow-phase");
    const status = await res.json();
    // const status = "ChampSelect";
    console.log("==------==== GET PHASE", status);
    if (status !== "ChampSelect") return;
    const pool = DataStore.get("champPool");

    // Read action
    // only in ARAM mode
    if (!match.benchEnabled) return;
    console.log("BENCH", match.benchChampions);
    const currentChampId = match.myTeam.find(
      (z) => z.cellId === match.localPlayerCellId
    ).championId;
    const currentChampIndex = pool.findIndex((z) => z.id === currentChampId);

    if (currentChampIndex === -1) {
      console.log("===== YOUR CURRENT CHAMP NOT IN POOL", currentChampId);
    } else {
      console.log(
        "===== ✅✅✅ YOUR CURRENT CHAMP IN POOL",
        pool[currentChampIndex]?.name
      );
      finalChampId = currentChampId;
      finalChampIndex = currentChampIndex;
      console.log("INFO ==========", {
        myChampPick: pool[currentChampIndex]?.name,
        champWanted: pool[finalChampIndex]?.name,
      });
    }

    // CHECK BENCH

    match.benchChampions.map((champ) => {
      const poolIndex = pool.findIndex((v) => v.id === champ.championId);

      //
      // if index of new champ smaller current index, mean new champ got higher priority
      if (poolIndex !== -1) {
        // This champ in pool
        console.log(
          "=== compare ",
          `${pool[poolIndex]?.name} (${pool[poolIndex]?.id})`,
          `${pool[finalChampIndex]?.name} (${pool[finalChampIndex]?.id})`
        );
        if (finalChampIndex === null || poolIndex < finalChampIndex) {
          finalChampIndex = poolIndex;
          finalChampId = pool[finalChampIndex]?.id;
        }

        // else {
        //   if (poolIndex < finalChampIndex) {

        //     finalChampIndex = poolIndex;
        //     finalChampId = championId;
        //     console.log(
        //       " ========== !!! in-pool -CHAMP",
        //       pool[poolIndex].name,
        //       {
        //         finalChampId,
        //         finalChampIndex,
        //       }
        //     );
        //     DataStore.set("myPickInfo", {
        //       index: poolIndex,
        //       id: pool[poolIndex].id,
        //     });
        //   }
        // }
      }
    });

    // my best pick
    // if current pick in pool and high priority , skip
    // console.log({ finalChampIndex, currentChampIndex });
    // if (currentChampIndex !== -1 && currentChampIndex <= finalChampIndex)
    //   return;

    if (finalChampId === null || finalChampIndex === null) return;

    console.log(
      "STAR FETCH AND SELECT ",
      pool[finalChampIndex]?.name,
      "with ID",
      finalChampId
    );
    const update = await fetch(
      `/lol-champ-select/v1/session/bench/swap/${finalChampId}`,
      {
        method: "POST",
      }
    );
    console.log("DONE ======== 🎉🎉🎉", update.json());

    // debugger;
    // DataStore.cl
  } catch (error) {
    console.log("ERROR ======================");
    console.log(error);
    console.log(JSON.stringify(match));
  }
}

export function updateListOrderPrePick() {}

export async function initUIPrePickInChampSelect() {
  const timeContainer = () =>
    document.getElementsByClassName("timer-status")?.[0];
  while (!timeContainer()) {
    // console.log("NO BOOST AREA", timeContainer());
    await delay(500);
  }

  const checkbox = htmlToElement(`
  <div class="auto-pick-champ" style="justify-content:center; margin-bottom:10px; margin-left :0px;">
    <lol-uikit-flat-checkbox class="checked">
      <input id="autoPickChamp" name="autoPickChamp" type="checkbox" class="ember-checkbox">
      <label slot="label">Auto Pick Champion</label>
    </lol-uikit-flat-checkbox>
  </div>`);

  const container = document.getElementsByClassName(
    "loadouts-edit-wrapper"
  )?.[0];

  container.prepend(checkbox);
  initStateCheckboxPrePick();
}
