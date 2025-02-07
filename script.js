let TASKS = [];
let taskIdCounter = 1;
let chatHistory = []; 

// --- Task Management Functions ---

function addTask(name, emoji, description, id = null, source = 'user') { 
    const newTask = {
        id: id || taskIdCounter++,
        name: name,
        emoji: emoji,
        description: description,
        completed: false,
        source: source  
    };
    TASKS.push(newTask);
    renderTasks();
    updateAvailableTasks();

    
    const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${newTask.id})"])`); // Find the element by the new ID.
    if (taskElement) {
        taskElement.classList.add('ai-added');
        setTimeout(() => {
            taskElement.classList.remove('ai-added');
        }, 3000);
    }

    return newTask.id;
}

function deleteTask(id) {
    const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${id})"])`);
     if(taskElement){
         taskElement.classList.add('ai-deleted');
         setTimeout(() => {
            TASKS = TASKS.filter(task => task.id !== id); //do the filter here
            renderTasks();
            updateAvailableTasks();

        }, 500); // Keep it very short for delete, just a flicker.
     }

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
        updateAvailableTasks();
        const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${id})"])`); // Find the element by the new ID.
        if (taskElement) {
        taskElement.classList.add('ai-edited'); // Add a class for styling.
        setTimeout(() => {
            taskElement.classList.remove('ai-edited'); // Remove the class after 3 seconds
        }, 3000);
    }
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
// --- UI Update Functions ---

function addUserMessage(message) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    // User messages on the RIGHT: self-end, ml-4 (margin-LEFT)
    messageDiv.classList.add('bg-blue-100', 'rounded-lg', 'p-2', 'mb-2', 'self-end', 'ml-4', 'max-w-xs');
    messageDiv.textContent = message;
    chatArea.appendChild(messageDiv);
    document.getElementById('userInput').value = '';
    chatArea.scrollTop = chatArea.scrollHeight;
}

function addBotMessage(taskPerformed, response) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bg-white', 'rounded-lg', 'p-2', 'mb-2', 'self-start', 'mr-4', 'max-w-xs', 'md:max-w-md');

    // Check if there are any task changes
    if (taskPerformed.trim() !== "") {
        // Create a unique ID for the collapsible content
        const detailsId = `details-${Date.now()}`;

        messageDiv.innerHTML = `
            <div>
                <button onclick="toggleDetails('${detailsId}')" class="text-blue-500 hover:text-blue-700 focus:outline-none">
                    See changes made <i class="fas fa-chevron-down"></i>
                </button>
                <div id="${detailsId}" class="details-content hidden mt-2 border-l-4 border-gray-300 pl-2">
                    ${taskPerformed}
                </div>
                <p class="mt-2">${response}</p> 
            </div>
        `;
    } else {
        // If no task changes, just display the response (without bold)
        messageDiv.innerHTML = `<p>${response}</p>`; // Changed to <p>
    }

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Add this function to your script.js
function toggleDetails(detailsId) {
    const detailsElement = document.getElementById(detailsId);
    if (detailsElement) {
        detailsElement.classList.toggle('hidden');
        // Optionally, change the button icon on toggle
        const button = detailsElement.previousElementSibling; // Get the button
         if (button && button.tagName === 'BUTTON') {
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        }
    }
}
function renderTasks() {
    const taskListDiv = document.getElementById('taskList');
    taskListDiv.innerHTML = '';

    TASKS.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow', 'flex', 'items-center', 'justify-between', 'group', 'relative');

        // Add a class based on the source
        if (task.source === 'ai') {
            taskElement.classList.add('ai-task');
        }

        taskElement.innerHTML = `
      <div class="flex items-center">
          <span class="text-2xl mr-2">${task.emoji}</span>
          <span class="${task.completed ? 'line-through' : ''}">${task.name}</span>
          <span class="ml-2 hidden group-hover:inline-block text-sm text-gray-500">${task.id}</span>
      </div>
      <div class="task-buttons flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            // Set source to 'user' for manual additions
            addTask(taskName, taskEmoji, description, null, 'user');
            document.getElementById('taskName').value = '';
            document.getElementById('taskEmoji').value = '';
            addBotMessage("Added Task", `Task "${taskName}" added successfully`);
        }
    } else {
        alert("Enter the emoji and the task name")
    }
}

// --- Chat & AI API ---

const API_KEY = "API_KEY_HERE"; 

let availableTasks = ""; 

function updateAvailableTasks() {
    availableTasks = TASKS.map(task => `"${task.name}" (ID: ${task.id})`).join(', ');
}

function updateChatHistory(role, content) {
    chatHistory.push({ role, content });
    if (chatHistory.length > 10) {
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
    *   if asked you can generate task randomly.
    *   refer to the available task information provided to you whenever required.
    *   Respond appropriately to non-task-related questions.

    **Available Tasks:** ${availableTasks}

     **History (Last 5):**
    ${historyPrompt}

    User: ${userInput}`;

    try {
        // Use your provided API key directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAyxaSyaMHXihnpWCpvhuQtVAdju5pXgLQ`, {
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
                        const newId = addTask(taskCommand.name, taskCommand.emoji, taskCommand.description, null, 'ai');
                        taskPerformedMessage += `Added Task (ID: ${newId})<br>`; // Use <br> for newlines
                        break;
                    case "delete":
                         const task = TASKS.find(task => task.id === taskCommand.id);
                        deleteTask(taskCommand.id);
                         if (task) {
                              taskPerformedMessage += `Deleted Task "${task.name}" (ID: ${taskCommand.id})<br>`; // Include task name and <br>
                         }
                        break;
                    case "edit":
                        const success = editTask(taskCommand.id, taskCommand.name, taskCommand.emoji, taskCommand.description);
                        if (success) {
                            taskPerformedMessage += `Edited Task (ID: ${taskCommand.id})<br>`; // Use <br>
                        } else {
                            taskPerformedMessage += `Failed to edit Task (ID: ${taskCommand.id} - Not Found)<br>`; // Use <br>
                        }
                        break;
                }
            });
        }

        let botResponse = parsedResponse.response;
        addBotMessage(taskPerformedMessage, botResponse);
        updateChatHistory("bot", botResponse);

    } catch (error) {
        addBotMessage("Error", "Failed to communicate with the API.");
        console.error("API call error:", error);
    }
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

addTask("Grocery Shopping", "🛒", "Buy milk, eggs, bread, and cheese", null, 'user');
addTask("Book Doctor Appointment", "👨‍⚕️", "Schedule a check-up", null, 'user');
addTask("Pay Bills", "💸", "Pay electricity and internet bills", null, 'user');
renderTasks();
updateAvailableTasks();
addBotMessage("", "Welcome! How can I help you manage your tasks today?");
