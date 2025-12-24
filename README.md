## **Code Sense UI - Repository Chat & Ingestion Dashboard**
![Code Sense UI](docs/codesense-ui.png)


A React-based interface for managing code repository ingestion and AI-powered chat interactions.

### **Features**

- 📁 **Repository Management** - Browse, ingest, and delete code repositories
- 💬 **AI Chat** - Context-aware conversations about your codebase
- 🔄 **Batch Ingestion** - Ingest single or multiple repositories simultaneously
- 📊 **Job Monitoring** - Real-time tracking of ingestion pipeline stages
- 🗂️ **Conversation History** - Persistent chat sessions per repository


### **Setup**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   Create `.env.local`:
   ```env
   VITE_API_BASE=http://localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   App runs at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

### **Usage**

#### **Ingest Repositories**
1. Click **+** next to "Repositories" in sidebar
2. Enter repo name(s) - comma or newline separated for batch
3. Monitor ingestion progress in "Ingestion Jobs" section

#### **Chat with Repository**
1. Select a repository from sidebar
2. Click **+ New Chat** or select existing conversation
3. Ask questions about the codebase

#### **Manage Jobs**
- **View details**: Click on any job to see pipeline stages and metrics
- **Abort**: Stop running jobs
- **Delete**: Remove completed/failed/aborted jobs


### **API Endpoints**

- `GET /repos` - List repositories
- `POST /ingest` - Start ingestion job(s)
- `GET /status` - Job status & listing
- `POST /jobs/{job_id}/abort` - Abort running job
- `DELETE /jobs/{job_id}` - Delete job
- `POST /conversations` - Create chat session
- `POST /chat` - Send message (streaming)
- `GET /conversations` - List conversations
- `DELETE /conversations/{id}` - Delete conversation

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `http://localhost:8000` |


### **Notes**

- Repositories must exist in `data/` directory on backend
- Job statuses: `queued`, `running`, `completed`, `failed`, `aborted`
- Batch jobs are grouped visually with progress indicators