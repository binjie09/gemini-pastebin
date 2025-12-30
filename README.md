# CBJ Pastebin

A modern, self-hosted pastebin service with syntax highlighting, code formatting, and file sharing capabilities.

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Syntax Highlighting** - Automatic language detection with support for 100+ programming languages
- **Code Formatting** - Built-in code formatter for cleaner code display
- **JSON Tools** - JSON formatting and automatic error correction for malformed JSON
- **Markdown Support** - Full markdown rendering with preview
- **File Sharing** - Upload files via web interface or command line with password protection
- **Expiration Control** - Set custom expiration times or keep pastes forever
- **Multi-platform** - Generate cURL commands for Windows, Linux, and macOS
- **Docker Ready** - One-command deployment with Docker Compose

## Quick Start

### Using Docker Compose (Recommended)

```bash
git clone https://github.com/binjie09/cbj-tools.git
cd cbj-tools
docker-compose up -d
```

Access the application at `http://localhost:3015`

### Using Pre-built Image

```bash
docker pull ghcr.io/binjie09/gemini-pastebin:latest

docker run -d \
  -p 3015:3015 \
  -e MONGO_URI=mongodb://your-mongo-host:27017/cbj-tools-pastbin \
  -v ./uploads:/app/uploads \
  ghcr.io/binjie09/gemini-pastebin:latest
```

## Command Line Usage

### Upload via Pipe

```bash
# Linux/macOS
cat file.txt | curl -F 'f=@-' https://your-domain.com

# Upload with expiration (in seconds)
cat file.txt | curl -F 'f=@-' -F 'expiry=3600' https://your-domain.com
```

### Upload a File

```bash
# Linux/macOS
curl -F 'f=@/path/to/file.txt' https://your-domain.com

# Windows (PowerShell)
curl.exe -F "f=@C:\path\to\file.txt" https://your-domain.com
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3015` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/cbj-tools-pastbin` |
| `UPLOAD_DIR` | Directory for file uploads | `uploads` |

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    image: ghcr.io/binjie09/gemini-pastebin:latest
    ports:
      - "3015:3015"
    environment:
      - MONGO_URI=mongodb://mongo:27017/cbj-tools-pastbin
      - UPLOAD_DIR=uploads
      - PORT=3015
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - mongo
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## Tech Stack

**Frontend:**
- React 19
- Vite
- React Syntax Highlighter
- React Markdown
- i18next (Internationalization)

**Backend:**
- Express.js 5
- MongoDB with Mongoose
- Multer (File uploads)

**Infrastructure:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Node.js 22 Alpine

## Development

### Prerequisites

- Node.js 22+
- MongoDB
- npm or yarn

### Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start MongoDB (or use Docker)
docker run -d -p 27017:27017 mongo:latest

# Start backend
cd server
cp .env.example .env  # Configure your environment
npm run dev

# Start frontend (in another terminal)
cd client
npm run dev
```

## API Reference

### Create Paste

```
POST /api/paste
Content-Type: multipart/form-data

Parameters:
- f: File or text content
- expiry: Expiration time in seconds (optional)
- password: Password protection (optional)
```

### Get Paste

```
GET /api/paste/:id
```

### Download File

```
GET /api/download/:id?password=xxx
```

## Advanced Usage

### Capturing Terminal Session (Input & Output)

If you want to record your entire terminal session and upload it to the pastebin:

#### Linux / macOS
Use the `script` command to record your session:

```bash
# Start recording to file 'session.log'
script session.log

# ... Run your commands ...

# Stop recording (press Ctrl+D or type exit)
exit

# Upload the recording
curl -F 'f=@session.log' https://your-domain.com/api/upload
```

#### Windows (PowerShell)
Use `Start-Transcript` to record your session:

```powershell
# Start recording
Start-Transcript -Path "session.txt"

# ... Run your commands ...

# Stop recording
Stop-Transcript

# Upload the recording
curl -F "f=@session.txt" https://your-domain.com/api/upload
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [React Markdown](https://github.com/remarkjs/react-markdown) for markdown rendering
- [jsonrepair](https://github.com/josdejong/jsonrepair) for JSON error correction
