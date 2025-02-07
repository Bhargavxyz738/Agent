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
        source: source,
        status: 'incomplete'
    };
    TASKS.push(newTask);
    renderTasks();
    updateAvailableTasks();

    const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${newTask.id})"])`);
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
    if (taskElement) {
        taskElement.classList.add('ai-deleted');
        setTimeout(() => {
            TASKS = TASKS.filter(task => task.id !== id);
            renderTasks();
            updateAvailableTasks();
        }, 500);
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
        const taskElement = document.querySelector(`#taskList > div:has(button[onclick="showDescription(${id})"])`);
        if (taskElement) {
            taskElement.classList.add('ai-edited');
            setTimeout(() => {
                taskElement.classList.remove('ai-edited');
            }, 3000);
        }
        return true;
    }
    return false;
}

function completeTask(id) {
    const task = TASKS.find(task => task.id === id);
    if (task) {
        // Toggle status, and keep 'completed' in sync.
        task.status = task.status === 'completed' ? 'incomplete' : 'completed';
        task.completed = task.status === 'completed';
        renderTasks();
        updateAvailableTasks(); // *** CRITICAL: Update AI's info immediately ***
    }
}

// --- UI Update Functions ---

function addUserMessage(message) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
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

    if (taskPerformed.trim() !== "") {
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
        messageDiv.innerHTML = `<p>${response}</p>`;
    }

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function toggleDetails(detailsId) {
    const detailsElement = document.getElementById(detailsId);
    if (detailsElement) {
        detailsElement.classList.toggle('hidden');
        const button = detailsElement.previousElementSibling;
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

        if (task.source === 'ai') {
            taskElement.classList.add('ai-task');
        }

        // Use task.status for strikethrough and icon
        taskElement.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-2">${task.emoji}</span>
                <span class="${task.status === 'completed' ? 'line-through' : ''}">${task.name}</span>
                <span class="ml-2 hidden group-hover:inline-block text-sm text-gray-500">${task.id}</span>
            </div>
            <div class="task-buttons flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="showDescription(${task.id})" class="text-blue-500 hover:text-blue-700" title="Show Description"><i class="fas fa-info-circle"></i></button>
                <button onclick="editTaskPrompt(${task.id})" class="text-yellow-500 hover:text-yellow-700" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTask(${task.id}); addBotMessage('Deleted Task', 'Task with ID ${task.id} was deleted')" class="text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
                <button onclick="completeTask(${task.id})" class="text-green-500 hover:text-green-700" title="Complete"><i class="fas ${task.status === 'completed' ? 'fa-check-circle' : 'fa-circle'}"></i></button>
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
// Store the API endpoints for different models
const API_ENDPOINTS = {
    gemini: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=",
    claude: "https://api.anthropic.com/v1/messages?key=",
    openai: "https://api.openai.com/v1/chat/completions?key="
};

let availableTasks = "";

function updateAvailableTasks() {
    // Clear and informative format for the AI
    availableTasks = TASKS.map(task => {
        return `- ${task.name} (ID: ${task.id}) - Status: **${task.status.toUpperCase()}**`;
    }).join('\n');
}

function updateChatHistory(role, content) {
    chatHistory.push({ role, content });
    if (chatHistory.length > 12) {
        chatHistory.shift();
    }
}

function formatChatHistoryForPrompt() {
    let historyPrompt = "";
    chatHistory.forEach(entry => {
        historyPrompt += `\n${entry.role}: ${entry.content}`;
    });
    return historyPrompt;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey.trim()) {
        alert("Please enter your API key.");
        return;
    }

    const selectedModel = document.getElementById('aiModel').value;
    const API_KEY = document.getElementById('apiKey').value;
    const apiUrl = API_ENDPOINTS[selectedModel] + API_KEY; 


    updateChatHistory("user", userInput);
    addUserMessage(userInput);
    
    const prompt = `SYSTEM_PROMPT:- You are a task management AI Agent. Respond in JSON. Manage tasks (add, delete, edit, complete) based on user requests. Interact naturally with the user in the "response" field.

    JSON Format:
    \`\`\`json
    {
        "task": [
            {"action": "add", "name": "Task Name", "emoji": "😀", "description": "Description"},
            {"action": "delete", "id": 2},
            {"action": "edit", "id": 3, "name": "New Name"},
            {"action": "complete", "id": 1}
        ],
        "response": "Confirmation message or normal natural text as you like."
    }
    \`\`\`

    *   **"action"**: REQUIRED. "add", "delete", "edit", or "complete".
    *   **"name"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"emoji"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"description"**: REQUIRED for "add".  OPTIONAL for "edit".
    *   **"id"**: REQUIRED for "delete", "edit", or "complete".
    *   **"response"**: REQUIRED. Natural language response.

    **Rules:**

    *   If no task action: \`"task": []\`.
    *   ONLY the specified fields.
    *   if asked you can generate task randomly.
    *   You can now mark tasks as "complete" using the "complete" action and to mark them as incomplete use the same action.
    *   Tasks have a status of "completed" or "incomplete".
    *   
    *   **IMPORTANT:** When answering questions about task completion, *always* check the "Status" of the tasks in the "Available Tasks" list. Do not assume a task is incomplete unless it explicitly says "Status: INCOMPLETE".

    Available Tasks in task list:-:\n${availableTasks}
    ___
    THIS IS THE CHAT HISTORY:-
    ${formatChatHistoryForPrompt()}
    ___
    NEW MESSAGE:-
    USER_PROMPT: ${userInput}`;

    try {
        const response = await fetch(apiUrl, {
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
        if (!response.ok) {
            addBotMessage("API Error", `The API returned an error: ${data.error.message}`);
            console.error("API Error:", data.error);
            return;
        }

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
                        taskPerformedMessage += `Added Task (ID: ${newId})<br>`;
                        break;
                    case "delete":
                        const task = TASKS.find(task => task.id === taskCommand.id);
                        deleteTask(taskCommand.id);
                        if (task) {
                            taskPerformedMessage += `Deleted Task "${task.name}" (ID: ${taskCommand.id})<br>`;
                        }
                        break;
                    case "edit":
                        const success = editTask(taskCommand.id, taskCommand.name, taskCommand.emoji, taskCommand.description);
                        if (success) {
                            taskPerformedMessage += `Edited Task (ID: ${taskCommand.id})<br>`;
                        } else {
                            taskPerformedMessage += `Failed to edit Task (ID: ${taskCommand.id} - Not Found)<br>`;
                        }
                        break;
                    case "complete":
                        const taskToComplete = TASKS.find(task => task.id === taskCommand.id);
                        if (taskToComplete) {
                            completeTask(taskCommand.id);
                            taskPerformedMessage += `Marked Task "${taskToComplete.name}" (ID: ${taskCommand.id}) as ${taskToComplete.status}<br>`;
                        } else {
                            taskPerformedMessage += `Failed to complete Task (ID: ${taskCommand.id} - Not Found)<br>`;
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

// Initial tasks (for demonstration)
addTask("Grocery Shopping", "🛒", "Buy milk, eggs, bread, and cheese", null, 'user');
addTask("Book Doctor Appointment", "👨‍⚕️", "Schedule a check-up", null, 'user');
addTask("Pay Bills", "💸", "Pay electricity and internet bills", null, 'user');
renderTasks();
updateAvailableTasks();
addBotMessage("", "Welcome! How can I help you manage your tasks today?");
