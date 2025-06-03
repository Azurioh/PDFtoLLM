# PDFtoLLM

PDFtoLLM is a modern web application that transforms PDF files into LLM-friendly text format, allowing you to easily interact with your PDF content using Large Language Models (LLMs) like ChatGPT, Deepseek, and others.

## Features

- 📄 Upload multiple PDF files
- 🔄 Convert PDFs to LLM-friendly text format
- 💬 Ask questions about your PDF content
- 🚀 Real-time streaming responses
- 🎨 Modern and intuitive user interface
- 📱 Responsive design

## Tech Stack

- TypeScript
- React
- Vite
- Ant Design
- Mistral AI API
- ESLint
- Biome

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Azurioh/PDFtoLLM.git
cd PDFtoLLM
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

1. Upload one or more PDF files using the drag-and-drop interface or file selector
2. Click "Convert All" to transform your PDFs into LLM-friendly text
3. Once converted, you can ask questions about the content of your PDFs
4. Get real-time responses from the LLM about your documents

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ant Design](https://ant.design/) for the UI components
- [Mistral AI](https://mistral.ai/) for the LLM capabilities
- [Vite](https://vitejs.dev/) for the build tooling
