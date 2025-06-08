# Discord-Inspired Portfolio

This project is a personal portfolio website with a Discord-inspired UI design. Built with React, TypeScript, and Tailwind CSS, it provides an interactive and modern way to showcase your professional information.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/discord-portfolio.git
cd discord-portfolio
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configuration:

    - Rename `.env.example` to `.env` and fill in the required environment variables
    - Modify `src/config/user.json` with your personal information

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## ✨ Features

| Feature             | Description                                        |
|---------------------|----------------------------------------------------|
| 💬 **Discord UI**   | Familiar Discord-inspired user interface           |
| 🌙 **Dark Mode**    | Discord's signature dark theme                     |
| 🧩 **Customizable** | Easily update your information via the config file |
| 📱 **Responsive**   | Works seamlessly on desktop and mobile devices     |
| 🔄 **i18n Support** | Multi-language support (English/French)            |

## 📝 Configuration

### Environment Variables

Create a `.env` file based on `.env.example` with your configuration:

```
VITE_DISCORD_WEBHOOK_URL=<YOUR_DISCORD_WEBHOOK_URL>
VITE_GITHUB_USERNAME=<YOUR_GITHUB_USERNAME>
VITE_DISCORD_CLIENT_ID=<YOUR_DISCORD_CLIENT_ID>
VITE_DISCORD_REDIRECT_URI=<YOUR_DISCORD_REDIRECT_URI>
```

### User Profile

Edit `src/config/user.json` to update your personal information:

- Profile: name, job title, location & description
- Contact: email & phone
- Work Status: availability, preferred work type & project interests
- Skills: programming languages, frameworks & tools with proficiency levels
- Experience: previous work history with company, role, duration & key achievements
- Education: degrees, certifications & courses
- Projects: personal & open source with descriptions
- Social Links: GitHub, LinkedIn, Twitter & personal website
- Interests: hobbies, activities & areas of passion

## 📦 Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── app/             # App-specific components
│   ├── components/      # Reusable UI components 
│   ├── config/         
│   │   └── user.json   # Your personal information
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions & helpers
│   ├── locales/        # i18n translation files
│   ├── styles/         # Global styles & Tailwind
│   ├── types/          # TypeScript type definitions
│   ├── index.tsx       # App entry point
│   └── vite-env.d.ts   # Vite type definitions
├── .env.example        # Environment variables template
├── index.html          # HTML entry point
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🔧 Technologies

- React
- TypeScript
- Tailwind CSS
- Next.js

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.