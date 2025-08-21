"use strict";
// DOM elements
const themeToggleBtn = document.querySelector(".theme-toggle img");
const background = document.querySelector(".background");
const container = document.querySelector(".container");
const inputContainer = document.querySelector(".input-container");
const todoList = document.querySelector(".todo-list");
const filtersContainer = document.querySelector(".filters-container");
const dragDropText = document.querySelector(".drag-drop-text");
const itemsLeft = document.querySelector(".items-left");


// isDark variable
let isDark = true;

// theme toggle button click event
themeToggleBtn.addEventListener("click", () => {
  if (isDark) {
    // if moon -> sun
    themeToggleBtn.src = "public/sun.svg";
    themeToggleBtn.alt = "sun icon";
  } else {
    // if sun -> moon
    themeToggleBtn.src = "public/moon.svg";
    themeToggleBtn.alt = "moon icon";
  }

  // toggle isDark variable
  isDark = !isDark;
});
