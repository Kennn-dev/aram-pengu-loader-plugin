import { initSettingAutoAccept } from "./auto-accept";
import "./index.css";
import {
  initUIPrePickInChampSelect,
  prePickChampionEvent,
  prePickChampionsUI,
} from "./pre-pick";
import { delay, htmlToElement, waitForElm } from "./utils";
console.log("Hello, League Client!, Ken Plugin is running");

/* load theme from URL */
function injectCSS(url) {
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", url);
  document.body.appendChild(link);
}

function subscribe() {
  const uri = document.querySelector('link[rel="riot:plugins:websocket"]').href;
  console.log("url socket", uri, DataStore);

  if (uri) {
    console.log({ uri });
    handleGetSummonerData();
  }

  // ======== socket
  const socket = new WebSocket(uri, "wamp");

  socket.onopen = () => socket.send(JSON.stringify([5, "OnJsonApiEvent"]));
  socket.onmessage = async (message) => {
    const [_id, _event, info] = JSON.parse(message.data);
    console.log("URL : ", info.uri);
    // console.log(DataStore.get("summoner"));
    // @todo process data
    listenAutoAccept(info);

    listenAfterMatch(info);
  };
}

const handleGetSummonerData = async () => {
  const res = await fetch("/lol-summoner/v1/current-summoner");
  const summoner = await res.json();
  console.log(summoner);
  DataStore.set("summoner", summoner);
  const championList = DataStore.get("champions");
  const pool = DataStore.get("champPool");
  // DataStore.set("champPool", []);
  console.log("init pool", pool);
  if (!championList) {
    const resC = await fetch(
      `/lol-champions/v1/inventories/${summoner.summonerId}/champions`
    );
    const champs = await resC.json();
    // console.log({ champs });
    const d = [...champs]
      .map((v) => ({ ...v, checked: false }))
      .sort((a, b) => b.id - a.id);
    d.shift();
    DataStore.set("champions", d);
  }

  // undefined
  if (!pool) {
    console.log("NO POOL");
    if (!championList) {
      DataStore.set("champPool", []);
    } else {
      // init
      const p = championList.map((v) => v).filter((z) => z.checked);
      DataStore.set("champPool", p);
    }
  } else {
    // init
    const p = championList.map((v) => v).filter((z) => z.checked);
    DataStore.set("champPool", p);
  }
};

const listenAfterMatch = ({ uri, data }) => {
  const isPrePickMode = DataStore.get("prePickMode");
  if (uri === "/lol-champ-select/v1/session") {
    // console.log("SELECT 😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂");
    // console.log(JSON.stringify(data));

    // handle when lobby has changed
    if (isPrePickMode) {
      prePickChampionEvent(data);
    }
  }
};
const listenAutoAccept = ({ uri, data }) => {
  const isAutoAcceptMode = DataStore.get("autoAcceptMode");
  if (uri === "/lol-gameflow/v1/gameflow-phase") {
    console.log("listenAutoAccept", { data, isAutoAcceptMode });
    // logic goes here
    if (data === "ReadyCheck" && isAutoAcceptMode) {
      fetch("/lol-matchmaking/v1/ready-check/accept", {
        method: "POST",
      });
    }
  }
};
// +=========== window

window.addEventListener("load", () => {
  const url =
    "https://fonts.googleapis.com/css2?family=Dancing+Script&family=Lora:ital,wght@1,500&family=Montserrat:wght@100&display=swap";
  /*           ^----- put your link here */
  /*           the server must support HTTPS, otherwise the theme will be denied */
  injectCSS(url);
  subscribe();

  // menu rendered
  waitForElm(
    "div.lol-social-lower-pane-container > lol-social-roster > lol-uikit-scrollable > div.list-content"
  ).then(() => {
    console.log("list social-scroll RENDER 😁😁😁");
    initSettingAutoAccept();
    prePickChampionsUI();
    // initAramBoostUI();

    initUIPrePickInChampSelect();
    test();
    // /lol-champ-select/v1/session/my-selection/reroll
  });
});

const test = async () => {
  const listMenu = document.querySelector(
    "div.lol-social-lower-pane-container > lol-social-roster > lol-uikit-scrollable > div.list-content"
  );
  while (!listMenu) {
    console.log("NO container", listMenu);
    await delay(500);
  }

  // Clear button
  const btn =
    htmlToElement(`<div style="position : relative;width: 100%;height: 50px;">
    <lol-uikit-flat-button-secondary id="test-123" style="padding : 10px;position : absolute;right: 0;left: 0;top:0;" class="lol-settings-reset-button">
    Test
  </lol-uikit-flat-button-secondary>
  </div>`);

  listMenu.prepend(btn);

  const btnTest = document.getElementById("test-123");
  btnTest.addEventListener("click", async () => {
    // console.log("Click ", c);
    const res = await fetch("https://127.0.0.1:2999/liveclientdata/playerlist");
    const value = await res.json();
  });
};
