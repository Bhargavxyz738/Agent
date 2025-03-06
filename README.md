# AI Task Management Application

This is a task management application with an AI assistant to help you manage your tasks more efficiently.

## Features

*   **Task Management:** Add, delete, edit, and complete tasks.
*   **AI Assistant:**  Interact with an AI assistant via chat to manage your tasks.
*   **Task Details:** View detailed descriptions for each task.
*   **User Interface:** Clean and intuitive user interface built with Tailwind CSS.
*   **API Key Input:** Allows users to enter their API key for AI functionality.
*   **Animated Feedback:** Visual cues (background color changes) to indicate tasks added, edited, or deleted by the AI.

## Technologies Used

*   HTML
*   CSS (Tailwind CSS)
*   JavaScript
*   Font Awesome (for icons)
*   Google Gemini API (or similar generative AI API)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Bhargavxyz738/Task-Management-Agent.git
    ```

2.  **Open `index.html` in your web browser.**  No server is required for basic functionality.

## Usage

1.  **Enter your API key:**  Input your Google Gemini API (or equivalent) key in the provided text field above the chat area.

2.  **Add tasks manually:** Use the input fields for "Task Name" and "Emoji" and the "Add Task" button to create new tasks.  You will be prompted for a task description.

3.  **Interact with the AI assistant:** Type your requests in the chat input field and press the send button. The AI can:

    *   Add new tasks
    *   Delete existing tasks
    *   Edit task names, emojis, or descriptions
    *   Mark tasks as complete
    *   Answer questions about your tasks

4.  **Manage tasks directly:** Use the buttons on each task to view the description, edit the task, delete the task, or mark it as complete.

## API Key Security

This application stores the API key in the browser's memory while the page is open.  **This is not a completely secure method for production applications.**  A more secure approach would involve handling the API key on a server-side application. This implementation provides a small improvement over storing the API key in the code directly.

##  Animations and Visual Cues

The application provides the following visual feedback:

*   **AI Added Tasks:**  Tasks added by the AI will briefly have a light green background.
*   **AI Edited Tasks:** Tasks edited by the AI will briefly have a light yellow background.
*   **AI Deleted Tasks:**  Tasks deleted by the AI will briefly fade out.

## Customization

*   **Styling:**  Customize the look and feel of the application by modifying the Tailwind CSS classes in the `index.html` file or by adding your own CSS styles.
*   **AI Prompts:**  Modify the prompt in the `sendMessage()` function in `script.js` to change the AI's behavior and capabilities.
*   **API Endpoint:** Change the API endpoint in `sendMessage()` if you are using a different generative AI service.

## Contributing

Contributions are welcome!  Please submit a pull request with your proposed changes.

## License
Lazy CSS is open-source and released under the [MIT License](LICENSE).
