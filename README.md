# Campus Israel - Frontend

The frontend of Campus Israel is built with **React**, **Vite**, and **Redux Toolkit**. It provides a comprehensive platform for students to explore universities, career paths, and manage applications, along with a robust admin dashboard for staff.

## 🚀 Getting Started
#test change
### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/)

### Installation
```bash
# Install dependencies
npm install
```

### Development
```bash
# Start the development server
npm run dev
```
The application will be available at `http://localhost:3000` 

### Build for Production
```bash
# Create a production build
npm run build

```

## 📂 Project Structure

- `src/assets`: Static assets, images, and global SCSS files.
- `src/components`: Reusable UI components, including:
    - `/admin`: Components specifically for the admin dashboard.
    - `/common`: Reusable base components (loaders, inputs, etc.).
- `src/hooks`: Custom React hooks for shared logic (cache, auth, etc.).
- `src/pages`: Main page components mapped to routes.
- `src/services`: API service layers using Axios.
- `src/store`: Redux store configuration and state slices.
- `src/utils`: Shared utility functions and formatting helpers.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: SCSS / Vanilla CSS
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Graphs**: [Recharts](https://recharts.org/)
