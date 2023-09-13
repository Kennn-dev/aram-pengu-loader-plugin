const handleClickBoost = () => {
  let urlencoded = new URLSearchParams();
  urlencoded.append("destination", "lcdsServiceProxy");
  urlencoded.append("method", "call");
  urlencoded.append("args", "[,teambuilder-draft,activateBattleBoostV1,]");

  let requestOptions = {
    method: "POST",
    body: urlencoded,
  };

  fetch("/lol-login/v1/session/invoke", requestOptions);
  // .then((response) => response.text())
  // .then((result) => console.log(result))
  // .catch((error) => console.log("error", error));
};
export const initAramBoostUI = () => {};
