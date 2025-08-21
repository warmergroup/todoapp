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

// Todo-larni localStorage dan yuklash yoki default data ishlatish
let todos = loadTodosFromStorage();

// Agar localStorage da hech narsa yo'q bo'lsa, default data yuklash
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
  // localStorage dan yuklangan todo-lar bo'lsa, eng katta ID ni topish
  nextId = Math.max(...todos.map(t => t.id)) + 1;
}

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

// Input-ga matn terilganda checkbox-ni checked qilodi
todoInput.addEventListener("input", function() {
  if (this.value.trim() !== "") {
    inputCheckbox.classList.add("checked");
  } else {
    inputCheckbox.classList.remove("checked");
  }
});

// Todo render qilish funksiyasi
function renderTodos() {
  console.log('Rendering todos. Total todos:', todos.length, 'Filter:', currentFilter);
  
  // Mavjud todo item-larni o'chirish (footer dan tashqari)
  const existingTodos = todoList.querySelectorAll(".todo-item");
  existingTodos.forEach(todo => todo.remove());
  
  // Filter bo'yicha todo-larni filtrlash
  const filteredTodos = filterTodos();
  console.log('Filtered todos:', filteredTodos.length);
  
  // Yangi todo item-larni yaratish
  filteredTodos.forEach(todo => {
    const todoItem = createTodoElement(todo);
    const listFooter = todoList.querySelector(".list-footer");
    if (listFooter) {
      todoList.insertBefore(todoItem, listFooter);
  } else {
      todoList.appendChild(todoItem);
    }
  });
  
  // Items count yangilash
  updateItemsCount();
}

// Todo element yaratish funksiyasi
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  todoItem.dataset.id = todo.id;
  
  // DRAG AND DROP: Elementni drag qilish mumkin qilish
  todoItem.draggable = true;
  
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
  
  // DRAG AND DROP: Drag event listener-larini qo'shish
  addDragAndDropListeners(todoItem, todo);
}

// DRAG AND DROP: Yangi funksiya - drag event listener-larini qo'shish
function addDragAndDropListeners(todoItem, todo) {
  // 1. Drag boshlanganda
  todoItem.addEventListener('dragstart', () => {
    // Adding dragging class to item after a delay
    setTimeout(() => todoItem.classList.add("dragging"), 0);
    
    // Ushlangan todo-ni scale qilib ko'rsatish
    todoItem.style.transform = 'scale(1.05)';
    todoItem.style.zIndex = '1000';
  });
  
  // 2. Drag tugaganda
  todoItem.addEventListener('dragend', () => {
    todoItem.classList.remove("dragging");
    todoItem.style.transform = 'none';
    todoItem.style.zIndex = 'auto';
    
    // Todo-larni qayta tartiblash va localStorage ga saqlash
    reorderTodosFromDOM();
  });
}

// DRAG AND DROP: Sortable list logikasi
const initSortableList = (e) => {
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  if (!draggingItem) return;
  
  // Getting all items except currently dragging and making array of them
  let siblings = [...todoList.querySelectorAll(".todo-item:not(.dragging):not(.list-footer)")];
  
  if (siblings.length === 0) return;
  
  // Finding the sibling after which the dragging item should be placed
  let nextSibling = siblings.find(sibling => {
    const rect = sibling.getBoundingClientRect();
    return e.clientY <= rect.top + rect.height / 2;
  });
  
  // Inserting the dragging item before the found sibling
  if (nextSibling) {
    // Agar nextSibling topilgan bo'lsa, uning oldiga qo'yish
    todoList.insertBefore(draggingItem, nextSibling);
  } else {
    // Agar nextSibling topilmagan bo'lsa (yani oxiriga qo'yish kerak)
    // Barcha todo-lar orasida eng oxirgi joyga qo'yish
    const lastTodoItem = siblings[siblings.length - 1];
    if (lastTodoItem) {
      todoList.insertBefore(draggingItem, lastTodoItem.nextSibling);
    } else {
      // Agar hech qanday todo yo'q bo'lsa, list-footer dan oldin qo'yish
      const listFooter = todoList.querySelector('.list-footer');
      if (listFooter) {
        todoList.insertBefore(draggingItem, listFooter);
      } else {
        todoList.appendChild(draggingItem);
      }
    }
  }
};

// DRAG AND DROP: Todo-larni DOM dan qayta tartiblash
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
  
  // Yangi tartibni saqlash
  todos = newTodos;
  saveTodosToStorage();
}

// DRAG AND DROP: Event listener-larni qo'shish
todoList.addEventListener("dragover", initSortableList);
todoList.addEventListener("dragenter", e => e.preventDefault());

// DRAG AND DROP: Todo-larni qayta tartiblash (yaxshilangan)
function reorderTodos(draggedId, targetId) {
  // 1. Drag qilingan todo-ni topish
  const draggedIndex = todos.findIndex(t => t.id === draggedId);
  const targetIndex = todos.findIndex(t => t.id === targetId);
  
  if (draggedIndex === -1 || targetIndex === -1) return;
  
  // 2. Drop position ni aniqlash
  const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
  const targetElement = document.querySelector(`[data-id="${targetId}"]`);
  
  if (!draggedElement || !targetElement) return;
  
  const indicator = targetElement.querySelector('.drop-indicator');
  const position = indicator ? indicator.dataset.position : 'bottom';
  
  // 3. Todo-ni array-dan olib tashlash
  const [draggedTodo] = todos.splice(draggedIndex, 1);
  
  // 4. Position ga qarab yangi joyga qo'yish
  let newIndex;
  if (position === 'top') {
    newIndex = targetIndex;
  } else {
    newIndex = targetIndex + 1;
  }
  
  // Agar drag qilingan element pastga tushirilayotgan bo'lsa, index ni tuzatish
  if (draggedIndex < newIndex) {
    newIndex--;
  }
  
  todos.splice(newIndex, 0, draggedTodo);
  
  // 5. UI va localStorage ni yangilash
  renderTodos();
  saveTodosToStorage();
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
  
  // localStorage ga saqlash
  saveTodosToStorage();
  
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
    saveTodosToStorage();
  }
}

// Todo o'chirish funksiyasi
function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
  saveTodosToStorage();
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
  saveTodosToStorage();
}

// Todo-larni localStorage ga saqlash
function saveTodosToStorage() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Todo-larni localStorage dan yuklash
function loadTodosFromStorage() {
  const savedTodos = localStorage.getItem('todos');
  const parsedTodos = savedTodos ? JSON.parse(savedTodos) : [];
  console.log('Loaded todos from storage:', parsedTodos);
  return parsedTodos;
}

// Todo-larni filter qilish
function filterTodos() {
  console.log('Filtering todos. Current filter:', currentFilter, 'Total todos:', todos.length);
  switch (currentFilter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

// Filter tugmasini bosish
function setFilter(filter) {
  currentFilter = filter;
  
  // Barcha filter tugmalaridan active class-ni olib tashlash
  filterButtons.forEach(btn => btn.classList.remove('active'));
  
  // Bosilgan filter tugmasiga active class qo'shish
  const activeButton = document.querySelector(`[data-filter="${filter}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  // Todo-larni qayta render qilish
  renderTodos();
}

// Theme toggle button click event
themeToggleBtn.addEventListener("click", toggleTheme);

// Clear completed button event listener
clearCompletedBtn.addEventListener("click", clearCompleted);

// Filter button event listeners
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    setFilter(filter);
  });
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  renderTodos(); // Mock data bilan initial render
});
