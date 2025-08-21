"use strict";

// DOM elements
const themeToggleBtn = document.querySelector(".theme-toggle img");
const htmlElement = document.documentElement;

// Theme state
let isDark = true;

// Initialize theme
function initTheme() {
  // Check if user has saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark = savedTheme === 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
  } else {
    // Default to dark theme
    htmlElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();
  }
}

// Update theme icon
function updateThemeIcon() {
  if (isDark) {
    themeToggleBtn.src = "/public/moon.svg";
    themeToggleBtn.alt = "moon icon";
  } else {
    themeToggleBtn.src = "/public/sun.svg";
    themeToggleBtn.alt = "sun icon";
  }
}

// Toggle theme
function toggleTheme() {
  isDark = !isDark;
  const theme = isDark ? 'dark' : 'light';
  
  // Smooth theme transition
  htmlElement.style.transition = 'all 0.5s ease';
  htmlElement.setAttribute('data-theme', theme);
  
  // Remove transition after animation completes
  setTimeout(() => {
    htmlElement.style.transition = '';
  }, 500);
  
  localStorage.setItem('theme', theme);
  updateThemeIcon();
}

// Theme toggle button click event
themeToggleBtn.addEventListener("click", toggleTheme);

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);
