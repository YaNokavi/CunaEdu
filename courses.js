import fetchData from "./fetch.js";

class Course {
  constructor(data) {
    this.data = data;
  }

  get authorShort() {
    let author = this.data.author || "";
    return author.length > 15 ? author.slice(0, 15) + "..." : author;
  }

  get lastCompletedStep() {
    return this.data.lastCompletedStep || null;
  }

  get learningOutcomes() {
    return this.data.learningOutcomes || [];
  }

  get courseModulesInfo() {
    return this.data.courseModulesInfo || [];
  }

  get ratingInfo() {
    return (
      this.data.ratingInfo || {
        rating: 0,
        reviewsTotalNumber: 0,
        detailedRatingTotalNumber: {},
      }
    );
  }
}

class CourseUI {
  constructor(course, courseId, buttons) {
    this.course = course;
    this.courseId = courseId;
    this.buttons = buttons;

    this.courseElement = document.getElementById("info");
    this.ratingCourse = document.getElementById("rating");
    this.amountComments = document.getElementById("amount-comments");

    this.lastStepBlock = document.getElementById("last-step-block");
    this.lastStepHref = document.getElementById("last-step");
  }

  displayAll() {
    if (!this.course) return;

    if (this.course.lastCompletedStep) {
      this.displayLastStep();
    }
    this.displayCourseInfo();
    this.displayLearning();
    this.displayModules();
    this.displayRating();

    this.hidePreloader();
  }

  displayCourseInfo() {
    const author = this.course.authorShort;
    const data = this.course.data;

    this.courseElement.innerHTML = `
      <div class="course-media">
        <img src="${data.iconUrl}" class="course-logo" />
        <a href="https://t.me/${data.author}" class="course-block-author">Автор: @${author}</a>
      </div>
      <div class="course-block-description">
        <div class="course-block-name">${data.name}</div>
        ${data.description}
      </div>
    `;
  }

  displayLastStep() {
    const step = this.course.lastCompletedStep;
    if (!step) {
      this.lastStepBlock.style.display = "none";
      return;
    }
    this.lastStepBlock.style.display = "flex";
    this.lastStepHref.innerHTML = `${step.submoduleName} - ${step.number} шаг`;
    this.lastStepHref.href = `step.html?v=2.0.0&courseId=${this.courseId}&submoduleId=${step.submoduleId}&stepNumber=${step.number}`;
  }

  displayLearning() {
    const learningOutcomes = this.course.learningOutcomes;
    if (learningOutcomes.length === 0) return;

    const learnBlock = document.getElementById("learnings-block");
    learnBlock.style.display = "flex";
    const points = document.getElementById("points");
    points.innerHTML = "";

    learningOutcomes.forEach((point) => {
      const pointElem = document.createElement("div");
      pointElem.style.display = "flex";
      pointElem.innerHTML = `•&nbsp&nbsp`;
      const textElem = document.createElement("div");
      textElem.style.display = "flex";
      textElem.innerHTML = point;
      pointElem.append(textElem);
      points.append(pointElem);
    });
  }

  displayModules() {
    const modules = this.course.courseModulesInfo;
    const elementModules = document.getElementById("modules");
    elementModules.innerHTML = "";

    modules.forEach((mod) => {
      const moduleMain = document.createElement("div");
      moduleMain.className = "syllabus-text-course-main toggle";
      moduleMain.innerHTML = mod.name;

      const svgIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgIcon.setAttribute("width", "17");
      svgIcon.setAttribute("height", "11");
      svgIcon.setAttribute("viewBox", "0 0 17 11");
      svgIcon.setAttribute("fill", "none");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("clip-rule", "evenodd");
      path.setAttribute(
        "d",
        "M9.35907 1.30377L16.1946 8.37502L14.486 10.1425L8.50477 3.95502L2.52352 10.1425L0.814941 8.37502L7.65048 1.30377C7.87708 1.06943 8.18437 0.937784 8.50477 0.937784C8.82518 0.937784 9.13247 1.06943 9.35907 1.30377Z",
      );
      path.setAttribute("fill", "#A6A6A6");

      svgIcon.appendChild(path);
      svgIcon.classList.add("toggle-icon");

      moduleMain.appendChild(svgIcon);
      elementModules.append(moduleMain);

      const moduleAdditional = document.createElement("ol");
      moduleAdditional.style.margin = 0;

      mod.submoduleNames.forEach((subName) => {
        const subText = document.createElement("li");
        subText.classList.add("syllabus-text-course-additional");
        subText.innerText = subName;
        moduleAdditional.append(subText);
      });

      elementModules.append(moduleAdditional);

      moduleMain.addEventListener("click", () => {
        const computedStyle = window.getComputedStyle(moduleAdditional);
        if (computedStyle.display === "none") {
          moduleAdditional.style.display = "flex";
        } else {
          moduleAdditional.style.display = "none";
        }
        svgIcon.classList.toggle("rotated");
      });
    });
  }

  getReviewWord(count) {
    count = Math.abs(count) % 100;
    const lastDigit = count % 10;

    if (count > 10 && count < 20) return "отзывов";
    if (lastDigit > 1 && lastDigit < 5) return "отзыва";
    if (lastDigit === 1) return "отзыв";
    return "отзывов";
  }

  displayRating() {
    const ratingInfo = this.course.ratingInfo;
    const rating = ratingInfo.rating;
    const formattedRating = Number.isInteger(rating)
      ? rating.toString()
      : rating.toFixed(1);
    this.ratingCourse.innerText = `${formattedRating}/5`;

    const count = ratingInfo.reviewsTotalNumber;
    this.amountComments.innerText = `${count} ${this.getReviewWord(count)}`;

    const detailed = ratingInfo.detailedRatingTotalNumber;
    const total = Object.values(detailed).reduce((sum, v) => sum + v, 0);

    const progressBlocks = document.querySelectorAll(".progress-block-elem");

    const values = [
      detailed[5],
      detailed[4],
      detailed[3],
      detailed[2],
      detailed[1],
    ];

    progressBlocks.forEach((block, idx) => {
      const progress = block.querySelector("progress");
      const value = values[idx] || 0;
      const percent = total > 0 ? Math.round((value / total) * 100) : 0;
      progress.value = percent;
    });
  }

  hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "none";
    }
  }
}

class CourseController {
  constructor(courseId, userId) {
    this.courseId = courseId;
    this.userId = userId;
    this.course = null;
    this.ui = null;
    this.buttons = new CourseButtons();

    this.buttons.onGoCourse = this.goCourse.bind(this);
  }

  async loadCourse() {
    try {
      const courseData = await fetchData(
        `course/${this.courseId}/info`,
        "GET",
        {
          "X-User-Id": this.userId,
        },
      );
      this.course = new Course(courseData);
      this.ui = new CourseUI(this.course, this.courseId, this.buttons);
      this.ui.displayAll();
    } catch (error) {
      alert("Ошибка при загрузке данных курса");
      return;
    }
  }

  goCourse() {
    // Переход к курсу
    window.location.href = `syllabus.html?v=2.0.0&courseId=${this.courseId}`;
  }
}

class CourseButtons {
  constructor() {
    this.goCourseButton = document.getElementById("go-course-button");
    this.buttonHrefComments = document.getElementById("button-href-comments");

    this._bindEvents();
  }

  _bindEvents() {
    this.buttonHrefComments.addEventListener("click", () => {
      window.location.href = `rating.html?v=2.0.0&courseId=${courseId}`;
    });

    this.goCourseButton.addEventListener("click", () => {
      this.onGoCourse && this.onGoCourse();
    });
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("courseId"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user.id;

const controller = new CourseController(courseId, userId);
controller.loadCourse();
