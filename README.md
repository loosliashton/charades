# Backwards Pantomime (Charades)

A web-based Charades game built with Vue 3 and Vite. Designed for mobile play with a clean, responsive interface.

## 🎮 Features

- **Seamless Gameplay**: Simply hold your device to show your team their word!
- **Team vs. Team**: Track scores for two teams with customizable names.
- **Customizable Settings**:
  - **Round Duration**: Adjust the timer to your liking.
  - **Difficulty Levels**: Choose from Easy, Medium, and Hard word lists.
  - **Free Skips**: Configure how many skips are allowed before penalties apply.
- **Visual Feedback**: Distinct animations for correct guesses and skips.
- **Score Tracking**: Automatic scoring and round management.
- **Detailed Recaps**: View a breakdown of correct and skipped words after each round.
- **Game State Persistence**: Accidental refreshes? No problem. The game saves your progress automatically.
- **PWA Ready**: Installable on mobile devices for a native app-like experience with offline support.

## 🛠️ Technology Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Script Setup)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/) (with persistence)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Project Setup

Run the following commands to get the project up and running locally.

### Install Dependencies

```sh
npm i
```

### Development Server

Start the development server with hot-reload:

```sh
npm run dev
```

### Production Build

Type-check, compile, and minify for production:

```sh
npm run build
```

## 📱 How to Play

1.  **Setup**: Enter team names and adjust settings (if desired) via the gear icon.
2.  **Start**: Click "Start Game".
3.  **Round**:
    - A member from the opposing team holds the device to show the acting team's word.
    - Teammates act out the word displayed.
    - **Correct**: Tap right side for "Got it!".
    - **Skip**: Tap left side to skip.
4.  **Scoring**: Points are tallied automatically. Review the round details and pass the device to the next team!
