# AI-Powered Task Management Agent

This project is an AI-powered task management application that leverages natural language processing and a large language model (LLM) to streamline your daily workflow and boost your productivity. Unlike traditional task management apps, this agent proactively suggests and manages tasks based on your needs and preferences, all through a conversational interface.

## Key Features

*   **Intelligent Task Planning:** The AI agent analyzes your description of your day and automatically generates a personalized task list, prioritizing productivity and efficiency.
*   **Natural Language Interaction:** Manage your tasks using natural language commands. Add, delete, edit, and complete tasks simply by chatting with the agent.
*   **AI-Driven Task Management:** The agent doesn't just create tasks; it also manages them, allowing you to delete entire workspaces, add/edit tasks, and mark them as complete or incomplete based on your interactions.
*   **Contextual Awareness:** The agent remembers past conversations and uses that information to personalize its task planning and provide relevant suggestions.
*   **Customizable Emojis:** Add a touch of personality to your tasks with customizable emojis.
*   **Clean and Intuitive User Interface:** The split-screen layout (chat + task list) makes it easy to manage tasks and interact with the agent.

## How It Works

The application uses the Gemini API to process natural language input and generate intelligent responses. The core logic is built around prompt engineering, with carefully crafted system and user prompts that guide the LLM to generate JSON-formatted output containing both conversational responses and executable commands. A JavaScript-based system then parses the JSON output and executes the commands, seamlessly integrating the LLM with the task management system.

## Technologies Used

*   Large Language Model: Gemini API
*   Programming Languages: JavaScript, [HTML/Tailwind CSS]


## Usage

1.  Start a conversation with the AI agent.
2.  Describe your day, goals, or any specific tasks you want to accomplish.
3.  The agent will automatically generate a task list based on your description.
4.  Use natural language commands to manage your tasks, such as "Add a task to buy groceries" or "Mark the 'Coding Project' task as complete".
5.  Enjoy a more streamlined and productive workflow!

## Usage Instructions
 Replace the following line from script.js with a valid API key.
 ```Javascript
const API_KEY = "VALID_API_KEY_HERE";
```
Get your API key at https://aistudio.google.com/apikey

## Credits
This application was created by [BHARGAV]
