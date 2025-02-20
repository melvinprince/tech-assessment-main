---

# Chat Demo Application

A demo chat application built with Next.js, Prisma, and Radix UI that integrates a real-world language model (GPT2-medium via the Hugging Face API) for text generation. This project includes features like real-time chat, message starring, error handling with toast notifications, and a fully functional backend API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

This application is a demo chat interface that allows users to:
- Interact with a chatbot powered by the GPT2-medium model from Hugging Face.
- Star/unstar messages to save important chat exchanges.
- View starred messages on a separate page.
- Receive real-time error notifications through a custom toast system.

The integration with Hugging Face is handled securely on the server side, ensuring that API keys are never exposed to the client.

## Features

- **Chat Interface:** A responsive chat window built with Next.js.
- **Language Model Integration:** Use of GPT2-medium from Hugging Face for generating text responses.
- **Message Starring:** Ability to mark messages as starred and view them separately.
- **Error Handling:** Robust error notifications using a toast system built with Radix UI.
- **Prisma ORM:** Secure and efficient database operations for saving chat history and starred messages.
- **Next.js API Routes:** Custom endpoints to handle chat, starred messages, and interactions with the Hugging Face API.

## Technologies Used

- **Next.js:** React framework for server-side rendering and API routes.
- **React:** UI development library.
- **Prisma:** ORM for database interactions.
- **Hugging Face Inference API:** Provides GPT2-medium model integration.
- **Radix UI:** Accessible, unstyled UI components (for the toast notifications).
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **TypeScript:** Typed JavaScript for improved developer experience and code quality.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/chat-demo.git
   cd chat-demo
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Prisma:**

   Initialize Prisma and apply the migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

## Environment Variables

Create a `.env.local` file in the root of your project and add the following:

```env
# Database connection string for Prisma
DATABASE_URL=postgresql://user:password@localhost:5432/yourdbname

# Hugging Face API Key (Ensure you prefix with NEXT_PUBLIC_ if used on client, otherwise keep on the server-side)
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

> **Note:** Ensure that sensitive keys are kept secure and are not exposed on the client side.

## Usage

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to use the application.

### Production

Build and start the production server:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## API Endpoints

### `/api/chat`

- **GET:** Retrieves chat history for a given user.
- **POST:** Accepts a user message, calls the GPT2-medium model (or uses default logic) and saves the chat along with the AI response.

### `/api/starred`

- **GET:** Retrieves all starred messages for a user.
- **POST:** Stars a specific chat message.
- **DELETE:** Unstars a specific chat message.

## Project Structure

```
/src
  /app
    layout.tsx          # Global layout and Toaster inclusion
    page.tsx            # Main chat page
    starred-page.tsx    # Page for starred messages
  /components
    /ui
      button.tsx        # Button component
      input.tsx         # Input component
      loadingMini.tsx   # Mini loader component
      loading.tsx       # Loader component
      toast.tsx         # Toast UI component
      toaster.tsx       # Toaster provider component
  /elements
    toggle-mode.tsx     # Mode toggle (light/dark)
    model-options.tsx   # Model selection dropdown
  /store
    llm-store.ts        # Global store for selected model
  /api
    chat/route.ts       # Chat API endpoints
    starred/route.ts    # Starred messages API endpoints
  /lib
    utils.ts            # Utility functions
.env.local              # Environment configuration
package.json            # Project dependencies and scripts
prisma/schema.prisma    # Prisma schema definition
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your proposed changes.

## License

This project is licensed under the [MIT License](LICENSE).

---
