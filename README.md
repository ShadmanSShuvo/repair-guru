# Repair Guru 🛠️

Repair Guru is an AI-powered smart diagnostic tool that allows non-technical users to report complex service problems by uploading a photo or description. The AI analyzes the media to instantly create a precise job ticket for service providers.

## ✨ Features

*   **AI-Powered Diagnosis**: Utilizes the Google Gemini API to analyze user descriptions and images, providing a detailed diagnosis, likely cause, required parts, and estimated labor hours.
*   **Multi-Language Support**: Fully functional in both English and Bengali (বাংলা), with a simple toggle to switch between languages.
*   **Geolocation Integration**: Uses the browser's geolocation to find and assign the closest available technician. Also supports manual location entry.
*   **Voice-to-Text Input**: Leverages the Gemini Live API for real-time, accurate voice transcription, making it easy for users to describe their issue hands-free.
*   **Dynamic Technician Matching**: Assigns the best technician based on their skill set, availability, and proximity to the user.
*   **Interactive Job Ticket**: Generates a comprehensive job ticket with technician details, estimated arrival time, detailed cost breakdown (parts + labor), and scheduling options.
*   **Service Scheduling**: Allows users to book an appointment with the assigned technician directly from the app by selecting an available time slot.
*   **Responsive & Accessible UI**: Built with Tailwind CSS for a clean, modern, and responsive user experience across all devices.

## 🚀 Tech Stack

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **AI & Machine Learning**:
    *   **Google Gemini API (`gemini-2.5-flash`)**: For generating structured JSON job tickets from text and image inputs.
    *   **Google Gemini Live API (`gemini-2.5-flash-native-audio-preview-09-2025`)**: For real-time audio transcription.
*   **Internationalization (i18n)**: React Context API for managing language state.

## 📂 Project Structure

```
/
├── public/
│   └── locales/
│       ├── en.json       # English translations
│       └── bn.json       # Bengali translations
├── src/
│   ├── components/       # Reusable React components
│   │   ├── icons/        # SVG icon components
│   │   ├── CategorySelector.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── Header.tsx
│   │   ├── JobTicket.tsx
│   │   └── LocationInput.tsx
│   ├── context/
│   │   └── LanguageContext.tsx # Manages language state and translations
│   ├── data/
│   │   └── technicians.ts  # Static data for available technicians
│   ├── services/
│   │   └── geminiService.ts # Handles all interactions with the Gemini API
│   ├── App.tsx             # Main application component, handles step logic
│   ├── constants.ts        # Application-wide constants (e.g., service categories)
│   ├── index.tsx           # React application entry point
│   └── types.ts            # TypeScript type definitions
├── index.html              # Main HTML file
└── README.md               # This file
```

## ⚙️ How It Works

The application guides the user through a simple, multi-step process:

1.  **Location Input**: The app first asks for the user's location, either automatically via the browser's geolocation API or through manual input. This is crucial for finding nearby technicians.
2.  **Category Selection**: The user chooses a service category (e.g., Plumbing, Electrical, Appliances). This helps narrow down the problem and find a technician with the right skills.
3.  **Problem Description**: The user describes their issue in the `ChatInterface`. They can:
    *   Type a description.
    *   Use the microphone to dictate the problem, which is transcribed in real-time.
    *   Upload a photo of the problem area.
4.  **AI Diagnosis**: The `geminiService.ts` sends the category, description, and image to the `gemini-2.5-flash` model. A strict `responseSchema` is used to ensure the API returns a well-structured JSON object containing the `AiDiagnosis`.
5.  **Technician Assignment**: The application filters the list of technicians from `data/technicians.ts` based on the selected category. It then calculates the distance between the user and each qualified technician to find the closest one.
6.  **Job Ticket Generation**: A complete `JobAssignment` object is created, combining the AI diagnosis with the assigned technician's details, estimated travel time, and a full cost breakdown.
7.  **Review and Schedule**: The final `JobTicket` component is displayed, allowing the user to review all details, schedule a specific time for the service, contact the technician, or start over.

## 🔑 Environment Setup

This application is designed to run in a specific development environment where the Google Gemini API key is securely managed.

*   **API Key**: The API key is accessed via `process.env.API_KEY`. It is assumed to be provided by the execution environment.
