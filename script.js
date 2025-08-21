"use strict";

// DOM elements
const themeToggleBtn = document.querySelector(".theme-toggle img");
const htmlElement = document.documentElement;
const inputCheckbox = document.querySelector(".input-container .checkbox");
const todoInput = document.querySelector(".input-container input");
const todoList = document.querySelector(".todo-list");
const itemsLeftElement = document.querySelector(".items-left");
const clearCompletedBtn = document.querySelector(".clear-completed");

// Mock data - initial todos
let todos = [
  { id: 1, text: "Complete online JavaScript course", completed: true },
  { id: 2, text: "Jog around the park 3x", completed: false },
  { id: 3, text: "10 minutes meditation", completed: false },
  { id: 4, text: "Read for 1 hour", completed: false },
  { id: 5, text: "Pick up groceries", completed: false },
  { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false }
];

// Todo counter
let nextId = 7;

// Theme state
let isDark = true;

// Initialize theme
function initTheme() {
  // theme saqlash
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark = savedTheme === 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
  } else {
    // default theme - dark
    htmlElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();
  }
}

// Update theme icon
function updateThemeIcon() {
  if (isDark) {
    themeToggleBtn.src = "./public/moon.svg";
    themeToggleBtn.alt = "moon icon";
  } else {
    themeToggleBtn.src = "./public/sun.svg";
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

// Input checkbox click event
inputCheckbox.addEventListener("click", function() {
  if (todoInput.value.trim() !== "") {
    addTodo();
  }
});

// Input-ga matn terilganda checkbox-ni checked qilish
todoInput.addEventListener("input", function() {
  if (this.value.trim() !== "") {
    inputCheckbox.classList.add("checked");
  } else {
    inputCheckbox.classList.remove("checked");
  }
});

// Todo render qilish funksiyasi
function renderTodos() {
  // Mavjud todo item-larni o'chirish (footer dan tashqari)
  const existingTodos = todoList.querySelectorAll(".todo-item");
  existingTodos.forEach(todo => todo.remove());
  
  // Yangi todo item-larni yaratish
  todos.forEach(todo => {
    const todoItem = createTodoElement(todo);
    todoList.insertBefore(todoItem, todoList.querySelector(".list-footer"));
  });
  
  // Items count yangilash
  updateItemsCount();
}

// Todo element yaratish funksiyasi
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  todoItem.dataset.id = todo.id;
  
  todoItem.innerHTML = `
    <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
    <p class="todo-text">${todo.text}</p>
    <span class="remove-todo"><img src="./public/x.svg" alt="remove icon"></span>
  `;
  
  // Event listener-larni qo'shish
  addTodoEventListeners(todoItem, todo);
  
  return todoItem;
}

// Todo event listener-larni qo'shish
function addTodoEventListeners(todoItem, todo) {
  const checkbox = todoItem.querySelector(".checkbox");
  const removeBtn = todoItem.querySelector(".remove-todo");
  
  // Checkbox click event
  checkbox.addEventListener("click", () => toggleTodo(todo.id));
  
  // Remove button click event
  removeBtn.addEventListener("click", () => removeTodo(todo.id));
}

// Todo qo'shish funksiyasi
function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText === "") return;
  
  // Yangi todo yaratish
  const newTodo = {
    id: nextId++,
    text: todoText,
    completed: false
  };
  
  // Array-ga qo'shish (boshidan)
  todos.unshift(newTodo);
  
  // UI yangilash
  renderTodos();
  
  // Input-ni tozalash
  todoInput.value = "";
  
  // Checkbox-ni unchecked qilish
  inputCheckbox.classList.remove("checked");
}

// Todo toggle funksiyasi
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

// Todo o'chirish funksiyasi
function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

// Items count yangilash
function updateItemsCount() {
  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftElement.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Clear completed funksiyasi
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  renderTodos();
}

// Theme toggle button click event
themeToggleBtn.addEventListener("click", toggleTheme);

// Clear completed button event listener
clearCompletedBtn.addEventListener("click", clearCompleted);

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  renderTodos(); // Mock data bilan initial render
});
