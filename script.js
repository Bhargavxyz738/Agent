let TASKS = [];
let taskIdCounter = 1;
let chatHistory = []; // Array to store chat history

// --- Task Management Functions ---

function addTask(name, emoji, description, id = null) {
    const newTask = {
        id: id || taskIdCounter++,
        name: name,
        emoji: emoji,
        description: description,
        completed: false
    };
    TASKS.push(newTask);
    renderTasks();
    updateAvailableTasks(); // Update available tasks after adding
    return newTask.id;
}

function deleteTask(id) {
    TASKS = TASKS.filter(task => task.id !== id);
    renderTasks();
    updateAvailableTasks(); // Update available tasks after deleting
}

function editTask(id, newName, newEmoji, newDescription) {
    const taskIndex = TASKS.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        TASKS[taskIndex] = {
            ...TASKS[taskIndex],
            name: newName !== undefined ? newName : TASKS[taskIndex].name,
            emoji: newEmoji !== undefined ? newEmoji : TASKS[taskIndex].emoji,
            description: newDescription !== undefined ? newDescription : TASKS[taskIndex].description,
        };
        renderTasks();
        updateAvailableTasks(); // Update available tasks after editing
        return true;
    }
    return false;
}

function completeTask(id) {
    const task = TASKS.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

function renderTasks() {
    const taskListDiv = document.getElementById('taskList');
    taskListDiv.innerHTML = '';

    TASKS.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow', 'flex', 'items-center', 'justify-between', 'group', 'relative');
        taskElement.innerHTML = `
      <div class="flex items-center">
          <span class="text-2xl mr-2">${task.emoji}</span>
          <span class="${task.completed ? 'line-through' : ''}">${task.name}</span>
          <span class="ml-2 hidden group-hover:inline-block text-sm text-gray-500">${task.id}</span>
      </div>
      <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="showDescription(${task.id})" class="text-blue-500 hover:text-blue-700" title="Show Description"><i class="fas fa-info-circle"></i></button>
          <button onclick="editTaskPrompt(${task.id})" class="text-yellow-500 hover:text-yellow-700" title="Edit"><i class="fas fa-edit"></i></button>
          <button onclick="deleteTask(${task.id}); addBotMessage('Deleted Task', 'Task with ID ${task.id} was deleted')" class="text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
          <button onclick="completeTask(${task.id})" class="text-green-500 hover:text-green-700" title="Complete"><i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i></button>
      </div>

      <div class="task-description hidden absolute bg-gray-200 p-2 rounded-md top-full left-0 mt-1 z-10 w-64 whitespace-normal shadow-md">
        ${task.description}
      </div>

  `;
        taskListDiv.appendChild(taskElement);
    });
}

function addTaskManually() {
    const taskName = document.getElementById('taskName').value;
    const taskEmoji = document.getElementById('taskEmoji').value;

    if (taskName && taskEmoji) {
        const description = prompt("Please enter the description for this task:");
        if (description !== null) {
            addTask(taskName, taskEmoji, description);
            document.getElementById('taskName').value = '';
            document.getElementById('taskEmoji').value = '';
            addBotMessage("Added Task", `Task "${taskName}" added successfully`);
        }
    } else {
        alert("Enter the emoji and the task name")
    }
}

// --- Chat & Gemini API ---

const API_KEY = "AIzaSyCvOHMPI7BIq7NpvsQhZxY7A3yjTLev0h0"; // Placeholder

let availableTasks = ""; // String to hold available task names and IDs

function updateAvailableTasks() {
    availableTasks = TASKS.map(task => `"${task.name}" (ID: ${task.id})`).join(', ');
}

function updateChatHistory(role, content) {
    chatHistory.push({ role, content });
    if (chatHistory.length > 5) {
        chatHistory.shift();
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    updateChatHistory("user", userInput);
    addUserMessage(userInput);

    let historyPrompt = "";
    chatHistory.forEach(entry => {
        historyPrompt += `\n${entry.role}: ${entry.content}`;
    });

    // Include available tasks in the prompt
    const prompt = `You are a task management assistant.  Respond in JSON.  Manage tasks (add, delete, edit) based on user requests. Interact naturally with the user in the "response" field.

    JSON Format:
    \`\`\`json
    {
        "task": [
            {"action": "add", "name": "Task Name", "emoji": "😀", "description": "Description"},
            {"action": "delete", "id": 2},
            {"action": "edit", "id": 3, "name": "New Name"}
        ],
        "response": "Confirmation message."
    }
    \`\`\`

    *   **"action"**: REQUIRED. "add", "delete", or "edit".
    *   **"name"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"emoji"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"description"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"id"**: REQUIRED for "delete" or "edit".
    *   **"response"**: REQUIRED. Natural language response.

    **Rules:**

    *   If no task action: \`"task": []\`.
    *   ONLY the specified fields.
    *   Be precise. Don't guess. If a task to delete/edit is ambiguous, ask for clarification.
    *   Respond appropriately to non-task-related questions.

    **Available Tasks:** ${availableTasks}

     **History (Last 5):**
    ${historyPrompt}

    User: ${userInput}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        let parsedResponse;

        try {
            const jsonStartIndex = responseText.indexOf('{');
            const jsonEndIndex = responseText.lastIndexOf('}') + 1;
            const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex);
            parsedResponse = JSON.parse(jsonString);
        } catch (error) {
            addBotMessage("Error", "Invalid JSON response from the API.");
            console.error("JSON parsing error:", error, responseText);
            return;
        }

        let taskPerformedMessage = "";

        if (parsedResponse.task && parsedResponse.task.length > 0) {
            parsedResponse.task.forEach(taskCommand => {
                switch (taskCommand.action) {
                    case "add":
                        const newId = addTask(taskCommand.name, taskCommand.emoji, taskCommand.description);
                        taskPerformedMessage += `Added Task (ID: ${newId}). `;
                        break;
                    case "delete":
                        deleteTask(taskCommand.id);
                        taskPerformedMessage += `Deleted Task (ID: ${taskCommand.id}). `;
                        break;
                    case "edit":
                        const success = editTask(taskCommand.id, taskCommand.name, taskCommand.emoji, taskCommand.description);
                        if (success) {
                            taskPerformedMessage += `Edited Task (ID: ${taskCommand.id}). `;
                        } else {
                            taskPerformedMessage += `Failed to edit Task (ID: ${taskCommand.id} - Not Found). `;
                        }
                        break;
                }
            });
        }

        const botResponse = parsedResponse.response;
        addBotMessage(taskPerformedMessage || "No task changes", botResponse);
        updateChatHistory("bot", botResponse);

    } catch (error) {
        addBotMessage("Error", "Failed to communicate with the API.");
        console.error("API call error:", error);
    }
}

// --- UI Update Functions ---

function addUserMessage(message) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bg-blue-100', 'rounded-lg', 'p-2', 'mb-2', 'self-end', 'mr-4', 'max-w-xs');
    messageDiv.textContent = message;
    chatArea.appendChild(messageDiv);
    document.getElementById('userInput').value = '';
    chatArea.scrollTop = chatArea.scrollHeight;
}

function addBotMessage(taskPerformed, response) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bg-gray-200', 'rounded-lg', 'p-2', 'mb-2', 'self-start', 'ml-4', 'max-w-xs');
    messageDiv.innerHTML = `<strong>${taskPerformed}</strong><br>${response}`;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// --- Helper functions ---

function showDescription(taskId) {
    const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${taskId})"])`);

    if (taskElement) {
        const descriptionDiv = taskElement.querySelector('.task-description');
        if (descriptionDiv) {
            descriptionDiv.classList.toggle('hidden');
        }
    }
}

function editTaskPrompt(taskId) {
    const task = TASKS.find((t) => t.id === taskId);
    if (!task) return;

    const newName = prompt("Enter the new task name:", task.name);
    const newEmoji = prompt("Enter the new emoji:", task.emoji);
    const newDescription = prompt("Enter the new description", task.description);

    if (newName !== null || newEmoji !== null || newDescription != null) {
        editTask(taskId, newName, newEmoji, newDescription);
        addBotMessage("Edited Task", `Task "${newName}" edited successfully`);
    }
}

// --- Initial Setup ---
addTask("Grocery Shopping", "🛒", "Buy milk, eggs, bread, and cheese");
addTask("Book Doctor Appointment", "👨‍⚕️", "Schedule a check-up");
addTask("Pay Bills", "💸", "Pay electricity and internet bills");
renderTasks();
updateAvailableTasks(); // Initialize available tasks
addBotMessage("Welcome!", "How can I help you manage your tasks today?");
