# JSON Patch Applier

JSON Patch Applier is a web-based tool that allows users to apply JSON Patch operations to JSON data and visualize the changes. It provides an intuitive interface for working with JSON Patch, making it easier to understand and manipulate JSON data.

## Features

- Apply JSON Patch operations to JSON data
- Visualize differences between original and patched JSON
- Generate reverse JSON Patch operations
- Prettify JSON input
- Persistent state using local storage
- Responsive design for various screen sizes

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- immutable-json-patch
- jsondiffpatch
- pnpm (Package manager)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (v6 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/json-patch-applier.git
   cd json-patch-applier
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

### Running the Application

To start the development server:

```
pnpm dev
```

The application will be available at `http://localhost:4242`.

### Building for Production

To create a production build:

```
pnpm build
```

The built files will be in the `dist` directory.

## Usage

1. Enter your JSON data in the "JSON Data" textarea.
2. Enter your JSON Patch operations in the "Proposed JSON Patch" textarea.
3. Click the "Apply Patch" button to see the result.
4. The patched JSON will appear in the "Result" textarea.
5. The reverse JSON Patch will be displayed in the "Revert JSON Patch" textarea.
6. Use the "Prettify JSON" button to format the input JSON.
7. Toggle the "Show unchanged values" checkbox to control the diff view.
8. Use the "Reset" button to clear all inputs and results.

## Project Structure

- `src/App.tsx`: Main application component
- `src/components/react-formatter.tsx`: Component for rendering JSON diffs
- `src/main.tsx`: Entry point of the application
- `src/index.css`: Global styles (Tailwind CSS)
- `public/`: Static assets
- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `pnpm-lock.yaml`: pnpm lock file for consistent dependency versions

## Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the project for production
- `pnpm lint`: Run ESLint for code linting
- `pnpm preview`: Preview the production build locally

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [immutable-json-patch](https://github.com/Starcounter-Jack/JSON-Patch) for JSON Patch operations
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) for JSON diffing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for fast development and building
- [pnpm](https://pnpm.io/) for efficient package management
