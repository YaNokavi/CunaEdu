window.addEventListener("DOMContentLoaded", () => {
  const tabBar = document.querySelectorAll(".tab-item");
  tabBar.forEach((item) => {
    item.style.pointerEvents = "none";
  });
});

//TODO Подумать
// localStorage.clear();
localStorage.removeItem("referallId");
localStorage.removeItem("flagFirstJoin");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

window.location.href = "favorite.html?v=2.0.0";
