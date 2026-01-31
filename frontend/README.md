# HolisticAI Frontend

The administration dashboard and candidate intake portal for HolisticAI.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    (Optional) Create a `.env` file if you need to override defaults:
    ```env
    VITE_API_URL=http://localhost:3001/api
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## Project Structure
- `src/components/layout`: AppShell, Sidebar, Topbar.
- `src/components/ui`: Reusable ShadCN components.
- `src/views`: Page components (Dashboard, etc.).
- `src/services`: API integration (communicates with the backend).

For full system documentation, see the [Root README](../README.md).