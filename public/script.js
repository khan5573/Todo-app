const token = localStorage.getItem("token");

async function loadTodos() {
  const res = await fetch("/api/todos", {
    headers: { "authorization": token }
  });

  const data = await res.json();
  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(todo => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${todo.task}
      <button onclick="editTodo('${todo._id}','${todo.task}')">Edit</button>
      <button onclick="deleteTodo('${todo._id}')">X</button>
    `;
    list.appendChild(li);
  });
}

async function addTodo() {
  const task = taskInput.value;

  await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "authorization": token
    },
    body: JSON.stringify({ task })
  });

  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/api/todos/${id}`, {
    method: "DELETE",
    headers: { "authorization": token }
  });

  loadTodos();
}

async function editTodo(id, oldTask) {
  const newTask = prompt("Edit:", oldTask);

  await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type":"application/json",
      "authorization": token
    },
    body: JSON.stringify({ task: newTask })
  });

  loadTodos();
}

function logout() {
  localStorage.removeItem("token");
  window.location = "login.html";
}

loadTodos();