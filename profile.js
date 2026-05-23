import fetchData from "./fetch.js";

class ProfileController {
  constructor(userId) {
    this.userId = userId;

    this.profileUI = new ProfileUI(this);
  }

  async getUserInfo() {
    try {
      const userInfo = await fetchData(`user/profile/info`, "GET", {
        "X-User-Id": this.userId,
      });

      if (userInfo.coursesProgress.length != 0) {
        this.profileUI.displayProgress(userInfo);
      } else {
        this.profileUI.displayNotProgress();
      }
    } catch (error) {
      console.error(error);
    }
  }
}

class ProfileUI {
  constructor(profileController) {
    this.profileController = profileController;

    this.coursesProgressBlock = document.getElementById(
      "courses-progress-block",
    );

    this.listProgress = [];
  }

  displayProgress(userInfo) {
    this.coursesProgressBlock.innerHTML = "";

    userInfo.coursesProgress.forEach((elem) => {
      const courseHtml = `<div >
    <div class="course-info-name">${elem.courseName}</div>
    <div class="course-info-frame-bar">
      <div class="course-info-bar">
        <div class="course-info-bar-progress" style="width: 0; transition: none;"></div>
      </div>
      <div class="course-info-percent">${elem.progress}%</div>
    </div>
    </div>
  `;
      this.listProgress.push(elem.progress);
      this.coursesProgressBlock.innerHTML += courseHtml;
    });
    document.getElementById("preloader").style.display = "none";
    this.animateProgress();
  }

  animateProgress() {
    let progressBarElements = this.coursesProgressBlock.querySelectorAll(
      ".course-info-bar-progress",
    );
    if (document.getElementById("preloader").style.display === "none") {
      requestAnimationFrame(() => {
        progressBarElements.forEach((currentProgressBar, index) => {
          setTimeout(() => {
            currentProgressBar.style.transition = "width 1s ease";
            currentProgressBar.style.width = `${this.listProgress[index]}%`;
          }, index * 300);
        });
      });
    }
  }

  displayNotProgress() {
    this.coursesProgressBlock.style.marginLeft = "0";
    const notProgressHtml = `<div class="progress-title-enable-courses">Вы не изучаете ни один курс</div>`;
    this.coursesProgressBlock.innerHTML = notProgressHtml;
    document.getElementById("preloader").style.display = "none";
  }
}

const userIdProfile = document.querySelector(".profile-userid");
const logoNameProfile = document.querySelector(".profile-logo");
const usernameProfile = document.querySelector(".profile-nickname");

const tg = window.Telegram.WebApp;
const avatarUrl = tg.initDataUnsafe.user.photo_url;
const userId = tg.initDataUnsafe.user.id;
const rawUsername = tg.initDataUnsafe.user.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

userIdProfile.innerText += userId;
logoNameProfile.style.backgroundImage = `url('${avatarUrl}')`;

const profileController = new ProfileController(userId);
profileController.getUserInfo();

const setUserNameProfile = (name) => {
  let fontSize;

  if (name.length <= 15) {
    fontSize = "30px";
  } else if (name.length < 19) {
    fontSize = "24px";
  } else {
    name = name.slice(0, -2) + "...";
    fontSize = "23px";
  }

  usernameProfile.style.fontSize = fontSize;
  const sanitizedUserName = DOMPurify.sanitize(name);
  usernameProfile.innerText = sanitizedUserName;
};

setUserNameProfile(username);
