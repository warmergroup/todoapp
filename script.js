"use strict";

// DOM elements
const themeToggleBtn = document.querySelector(".theme-toggle img");
const htmlElement = document.documentElement;
const inputCheckbox = document.querySelector(".input-container .checkbox");
const todoInput = document.querySelector(".input-container input");
const todoList = document.querySelector(".todo-list");
const itemsLeftElement = document.querySelector(".items-left");
const clearCompletedBtn = document.querySelector(".clear-completed");

// Filter elements
const filterButtons = document.querySelectorAll(".filter");

// Todo counter
let nextId = 1;

// Current filter state
let currentFilter = 'all';

// Load todos from localStorage or use default data
let todos = loadTodosFromStorage();

// If localStorage is empty, load default data
if (todos.length === 0) {
  todos = [
    { id: 1, text: "Complete online JavaScript course", completed: true },
    { id: 2, text: "Jog around the park 3x", completed: false },
    { id: 3, text: "10 minutes meditation", completed: false },
    { id: 4, text: "Read for 1 hour", completed: false },
    { id: 5, text: "Pick up groceries", completed: false },
    { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false }
  ];
  nextId = 7;
  saveTodosToStorage();
} else {
  // Find the highest ID from loaded todos
  nextId = Math.max(...todos.map(t => t.id)) + 1;
}

// Theme state
let isDark = true;

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark = savedTheme === 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
  } else {
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
  
  htmlElement.style.transition = 'all 0.5s ease';
  htmlElement.setAttribute('data-theme', theme);
  
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

// Input text event - update checkbox style
todoInput.addEventListener("input", function() {
  if (this.value.trim() !== "") {
    inputCheckbox.classList.add("checked");
  } else {
    inputCheckbox.classList.remove("checked");
  }
});

// Enter key event for adding todos
todoInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter" && this.value.trim() !== "") {
    addTodo();
  }
});

// Render todos function
function renderTodos() {
  // Remove existing todo items (except footer)
  const existingTodos = todoList.querySelectorAll(".todo-item");
  existingTodos.forEach(todo => todo.remove());
  
  // Filter todos based on current filter
  const filteredTodos = filterTodos();
  
  // Create new todo items
  filteredTodos.forEach(todo => {
    const todoItem = createTodoElement(todo);
    const listFooter = todoList.querySelector(".list-footer");
    if (listFooter) {
      todoList.insertBefore(todoItem, listFooter);
    } else {
      todoList.appendChild(todoItem);
    }
  });
  
  // Update items count
  updateItemsCount();
}

// Create todo element
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  todoItem.dataset.id = todo.id;
  
  todoItem.draggable = true;
  
  todoItem.innerHTML = `
    <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
    <p class="todo-text">${todo.text}</p>
    <span class="remove-todo"><img src="./public/x.svg" alt="remove icon"></span>
  `;
  
  addTodoEventListeners(todoItem, todo);
  
  return todoItem;
}

// Add todo event listeners
function addTodoEventListeners(todoItem, todo) {
  const checkbox = todoItem.querySelector(".checkbox");
  const removeBtn = todoItem.querySelector(".remove-todo");
  
  checkbox.addEventListener("click", () => toggleTodo(todo.id));
  removeBtn.addEventListener("click", () => removeTodo(todo.id));
  
  addDragAndDropListeners(todoItem, todo);
}

// Add drag and drop listeners
function addDragAndDropListeners(todoItem, todo) {
  todoItem.addEventListener('dragstart', () => {
    setTimeout(() => todoItem.classList.add("dragging"), 0);
    todoItem.style.transform = 'scale(1.05)';
    todoItem.style.zIndex = '1000';
  });
  
  todoItem.addEventListener('dragend', () => {
    todoItem.classList.remove("dragging");
    todoItem.style.transform = 'none';
    todoItem.style.zIndex = 'auto';
    reorderTodosFromDOM();
  });
}

// Sortable list logic
const initSortableList = (e) => {
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  if (!draggingItem) return;
  
  let siblings = [...todoList.querySelectorAll(".todo-item:not(.dragging):not(.list-footer)")];
  
  if (siblings.length === 0) return;
  
  let nextSibling = siblings.find(sibling => {
    const rect = sibling.getBoundingClientRect();
    return e.clientY <= rect.top + rect.height / 2;
  });
  
  if (nextSibling) {
    todoList.insertBefore(draggingItem, nextSibling);
  } else {
    const lastTodoItem = siblings[siblings.length - 1];
    if (lastTodoItem) {
      todoList.insertBefore(draggingItem, lastTodoItem.nextSibling);
    } else {
      const listFooter = todoList.querySelector('.list-footer');
      if (listFooter) {
        todoList.insertBefore(draggingItem, listFooter);
      } else {
        todoList.appendChild(draggingItem);
      }
    }
  }
};

// Reorder todos from DOM
function reorderTodosFromDOM() {
  const todoItems = document.querySelectorAll('.todo-item:not(.list-footer)');
  const newTodos = [];
  
  todoItems.forEach(item => {
    const todoId = parseInt(item.dataset.id);
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      newTodos.push(todo);
    }
  });
  
  todos = newTodos;
  saveTodosToStorage();
}

// Add drag and drop event listeners
todoList.addEventListener("dragover", initSortableList);
todoList.addEventListener("dragenter", e => e.preventDefault());

// Add todo function
function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText === "") return;
  
  const newTodo = {
    id: nextId++,
    text: todoText,
    completed: false
  };
  
  todos.unshift(newTodo);
  
  renderTodos();
  saveTodosToStorage();
  
  todoInput.value = "";
  inputCheckbox.classList.remove("checked");
}

// Toggle todo function
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
    saveTodosToStorage();
  }
}

// Remove todo function
function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
  saveTodosToStorage();
}

// Update items count
function updateItemsCount() {
  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftElement.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Clear completed function
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  renderTodos();
  saveTodosToStorage();
}

// Save todos to localStorage
function saveTodosToStorage() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodosFromStorage() {
  const savedTodos = localStorage.getItem('todos');
  return savedTodos ? JSON.parse(savedTodos) : [];
}

// Filter todos
function filterTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

// Set filter
function setFilter(filter) {
  currentFilter = filter;
  
  filterButtons.forEach(btn => btn.classList.remove('active'));
  
  const activeButton = document.querySelector(`[data-filter="${filter}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  renderTodos();
}

// Event listeners
themeToggleBtn.addEventListener("click", toggleTheme);
clearCompletedBtn.addEventListener("click", clearCompleted);

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    setFilter(filter);
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  renderTodos();
});
