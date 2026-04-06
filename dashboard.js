import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const TASKS_FILE = path.resolve('tasks.md');
const PHASES_FILE = path.resolve('phases.json');

// Inicializar phases.json si no existe
if (!fs.existsSync(PHASES_FILE)) {
  const defaultPhases = [
    { id: 1, title: "1. Constitución", type: "macro", file: "constitution.md" },
    { id: 2, title: "2. Glosario de Dominio", type: "macro", file: "domain-glossary.md" },
    { id: 3, title: "3. Especificación Funcional", type: "macro", file: "specs/001-framework-core/spec.md" },
    { id: 4, title: "4. Arquitectura (C4/ADR)", type: "macro", file: "" },
    { id: 5, title: "5. Modelo de Datos", type: "macro", file: "" },
    { id: 6, title: "6. Seguridad (RBAC)", type: "macro", file: "" },
    { id: 7, title: "7. Workflows", type: "macro", file: "docs/workflows/aprobacion-especificacion.md" },
    { id: 8, title: "8. Plan Técnico", type: "macro", file: "" },
    { id: 9, title: "9. Desglose de Tareas", type: "micro", file: "tasks.md" },
    { id: 10, title: "10. Construcción (TDD)", type: "micro", file: "README.md" }
  ];
  fs.writeFileSync(PHASES_FILE, JSON.stringify(defaultPhases, null, 2));
}

const server = http.createServer((req, res) => {
  // 1. Ruta GET: Renderizar el Dashboard Interactivo
  if (req.method === 'GET' && req.url === '/') {
    let tasksHtml = '<p class="text-gray-500">No se encontró tasks.md</p>';
    let macroPhasesHtml = '';
    let microPhasesHtml = '';
    
    try {
      const tasksContent = fs.readFileSync(TASKS_FILE, 'utf-8');
      const lines = tasksContent.split(/\r?\n/);
      
      // Generamos el HTML inyectando el número de línea para poder editarla luego
      const formattedTasks = lines.map((line, index) => {
        if (line.startsWith('## ')) return `<h2 class="text-2xl font-extrabold mt-8 mb-4 text-blue-900 border-b pb-2">${line.substring(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3 class="text-lg font-bold mt-6 mb-3 text-slate-700 flex items-center gap-2"><span class="bg-slate-200 w-2 h-2 rounded-full"></span>${line.substring(4)}</h3>`;
        
        // Tareas Completadas (Clickeables)
        if (line.startsWith('- [x] ')) return `<div class="flex items-start gap-3 text-slate-400 py-2 cursor-pointer hover:bg-slate-100 px-3 rounded-lg transition-all group" onclick="toggleTask(${index})"><input type="checkbox" checked class="mt-1 w-5 h-5 accent-emerald-500 cursor-pointer pointer-events-none"> <span class="line-through decoration-2 text-base">${line.substring(6)}</span></div>`;
        
        // Tareas Pendientes (Clickeables)
        if (line.startsWith('- [ ] ')) return `<div class="flex items-start gap-3 text-slate-800 py-2 cursor-pointer hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 px-3 rounded-lg transition-all group" onclick="toggleTask(${index})"><input type="checkbox" class="mt-1 w-5 h-5 cursor-pointer pointer-events-none"> <span class="font-medium text-base group-hover:text-blue-700">${line.substring(6)}</span></div>`;
        
        if (line.startsWith('---')) return `<hr class="my-8 border-slate-200 border-2 rounded-full">`;
        if (line.trim() === '') return '';
        return `<p class="text-sm text-slate-500 mt-2 px-3">${line}</p>`;
      }).join('');
      
      tasksHtml = `
        <div class="bg-slate-50 p-6 rounded-xl shadow-inner border border-slate-200 mb-6">${formattedTasks}</div>
        
        <!-- Formulario para agregar tareas nuevas -->
        <div class="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <input type="text" id="newTask" placeholder="Ej: TASK-4.01: [RED] Escribir pruebas para..." class="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
          <button onclick="addTask()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"><span>+</span> Agregar Tarea</button>
        </div>
      `;
    } catch(e) {
      tasksHtml = '<p class="text-red-500 font-bold">Error leyendo tasks.md</p>';
    }

    try {
      const phases = JSON.parse(fs.readFileSync(PHASES_FILE, 'utf-8'));
      
      // Mapeo retroactivo por si el JSON antiguo no tiene la propiedad 'file'
      const phasesWithFiles = phases.map(p => ({
        ...p,
        file: p.file !== undefined ? p.file : (p.id === 1 ? 'constitution.md' : p.id === 2 ? 'domain-glossary.md' : '')
      }));

      const renderPhase = (p) => `
        <div class="p-3 text-slate-600 flex justify-between items-center group hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-2 cursor-pointer" onclick="openDocument(${p.id}, '${p.file || ''}', '${p.title.replace(/'/g, "\\'")}')">
            <span class="text-xl opacity-50 group-hover:opacity-100 transition-opacity">${p.file ? '📄' : '📁'}</span>
            <span class="font-medium text-sm md:text-base hover:text-blue-600 transition-colors">${p.title}</span>
          </div>
          <div class="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
            <button onclick="editPhase(${p.id}, '${p.title.replace(/'/g, "\\'")}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1 rounded transition-colors" title="Editar Nombre">✏️</button>
            <button onclick="deletePhase(${p.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-colors" title="Eliminar">🗑️</button>
          </div>
        </div>
      `;
      macroPhasesHtml = phasesWithFiles.filter(p => p.type === 'macro').map(renderPhase).join('') || '<p class="p-3 text-slate-400 text-sm italic">No hay fases</p>';
      microPhasesHtml = phasesWithFiles.filter(p => p.type === 'micro').map(renderPhase).join('') || '<p class="p-3 text-slate-400 text-sm italic">No hay fases</p>';
    } catch(e) {
      console.error('Error leyendo phases.json', e);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SDD-TDD Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 text-slate-800 font-sans p-8">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-4xl font-black text-blue-700 mb-2 tracking-tight">🚀 SDD-TDD Dashboard</h1>
          <p class="text-lg text-slate-600 mb-8">Monitoreo en tiempo real del estado de tu proyecto y cumplimiento de fases.</p>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <!-- Columna Izquierda: Fases -->
            <div class="md:col-span-4">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-slate-700">🌍 Macro-Ciclo</h2>
                <button onclick="addPhase('macro')" class="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-full font-bold transition-all shadow-sm">+ Añadir Fase</button>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
                ${macroPhasesHtml}
              </div>

              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-slate-700">🔄 Micro-Ciclo</h2>
                <button onclick="addPhase('micro')" class="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-full font-bold transition-all shadow-sm">+ Añadir Fase</button>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-slate-200">
                ${microPhasesHtml}
              </div>
            </div>

            <!-- Columna Derecha: Tareas Dinámicas -->
            <div class="md:col-span-8">
              <h2 class="text-2xl font-bold mb-4 text-slate-700">📋 Tablero de Ejecución (En Vivo)</h2>
              ${tasksHtml}
            </div>
          </div>
        </div>
        
        <!-- Modal del Editor de Documentos -->
        <div id="docModal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-8">
          <div class="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
            <div class="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 id="docTitle" class="text-xl font-bold text-white flex items-center gap-2">📄 <span id="docPhaseName">Cargando...</span></h3>
              <div class="flex gap-3">
                <button onclick="saveDocument()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">💾 Guardar Cambios</button>
                <button onclick="closeDocument()" class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">✖ Cerrar</button>
              </div>
            </div>
            <div class="flex-1 bg-slate-50 p-2">
              <textarea id="docEditor" class="w-full h-full bg-white border border-slate-200 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"></textarea>
            </div>
            <input type="hidden" id="currentFilePath" value="">
          </div>
        </div>

        <!-- Scripts de interactividad -->
        <script>
          // --- Funciones del Editor de Documentos ---
          function openDocument(phaseId, filePath, phaseName) {
            if (!filePath) {
              const newFile = prompt('Esta fase no tiene un archivo vinculado.\\nIntroduce la ruta del archivo a crear (ej: docs/arquitectura.md):');
              if (!newFile || !newFile.trim()) return;
              
              // 1. Vincular el archivo a la fase en phases.json
              fetch('/api/phases/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: phaseId, file: newFile.trim() })
              }).then(() => {
                // 2. Crear el archivo físico con un título base y recargar la página
                fetch('/api/document', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filePath: newFile.trim(), content: '# ' + phaseName + '\\n\\nComienza a documentar esta fase aquí...' })
                }).then(() => window.location.reload());
              });
              return;
            }
            document.getElementById('docModal').classList.remove('hidden');
            document.getElementById('docPhaseName').innerText = phaseName + ' (' + filePath + ')';
            document.getElementById('currentFilePath').value = filePath;
            document.getElementById('docEditor').value = 'Cargando contenido...';
            
            fetch('/api/document?file=' + encodeURIComponent(filePath))
              .then(res => res.text())
              .then(text => document.getElementById('docEditor').value = text)
              .catch(err => document.getElementById('docEditor').value = 'Error al cargar el archivo.');
          }

          function closeDocument() {
            document.getElementById('docModal').classList.add('hidden');
          }

          function saveDocument() {
            const filePath = document.getElementById('currentFilePath').value;
            const content = document.getElementById('docEditor').value;
            fetch('/api/document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath, content })
            }).then(() => {
              alert('✅ Documento guardado con éxito!');
            });
          }

          // --- Funciones de Tareas y Fases ---
          function toggleTask(lineIndex) {
            fetch('/api/toggle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lineIndex })
            }).then(() => window.location.reload());
          }

          function addTask() {
            const text = document.getElementById('newTask').value;
            if (!text.trim()) return;
            fetch('/api/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text })
            }).then(() => window.location.reload());
          }

          function addPhase(type) {
            const title = prompt('Nombre de la nueva fase:');
            if (!title) return;
            fetch('/api/phases/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, type })
            }).then(() => window.location.reload());
          }

          function editPhase(id, oldTitle) {
            const title = prompt('Modificar nombre de la fase:', oldTitle);
            if (!title || title === oldTitle) return;
            fetch('/api/phases/edit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, title })
            }).then(() => window.location.reload());
          }

          function deletePhase(id) {
            if (!confirm('¿Estás seguro de eliminar esta fase?')) return;
            fetch('/api/phases/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id })
            }).then(() => window.location.reload());
          }

          // Permitir usar "Enter" en el input
          document.getElementById('newTask')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
          });
        </script>
      </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

  // 2. Ruta POST: Alternar estado de una tarea (Update)
  } else if (req.method === 'POST' && req.url === '/api/toggle') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { lineIndex } = JSON.parse(body);
      let lines = fs.readFileSync(TASKS_FILE, 'utf-8').split(/\r?\n/);
      
      if (lines[lineIndex].startsWith('- [ ]')) {
        lines[lineIndex] = lines[lineIndex].replace('- [ ]', '- [x]');
      } else if (lines[lineIndex].startsWith('- [x]')) {
        lines[lineIndex] = lines[lineIndex].replace('- [x]', '- [ ]');
      }
      
      fs.writeFileSync(TASKS_FILE, lines.join('\n'));
      res.writeHead(200); res.end('OK');
    });

  // 3. Ruta POST: Agregar nueva tarea (Create)
  } else if (req.method === 'POST' && req.url === '/api/add') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { text } = JSON.parse(body);
      let content = fs.readFileSync(TASKS_FILE, 'utf-8');
      
      // Insertar justo antes del pie de página (---) o al final
      if (content.includes('---')) {
        content = content.replace(/\n---/g, `\n- [ ] ${text}\n---`);
      } else {
        content += `\n- [ ] ${text}`;
      }
      
      fs.writeFileSync(TASKS_FILE, content);
      res.writeHead(200); res.end('OK');
    });

  // 4. Ruta POST: CRUD de Fases
  } else if (req.method === 'POST' && req.url.startsWith('/api/phases/')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const payload = JSON.parse(body);
      let phases = JSON.parse(fs.readFileSync(PHASES_FILE, 'utf-8'));
      
      if (req.url === '/api/phases/add') {
        const maxId = phases.reduce((max, p) => Math.max(max, p.id), 0);
        phases.push({ id: maxId + 1, title: payload.title, type: payload.type });
      } else if (req.url === '/api/phases/edit') {
        phases = phases.map(p => p.id === payload.id ? { ...p, title: payload.title } : p);
      } else if (req.url === '/api/phases/delete') {
        phases = phases.filter(p => p.id !== payload.id);
          } else if (req.url === '/api/phases/link') {
            phases = phases.map(p => p.id === payload.id ? { ...p, file: payload.file } : p);
      }
      
      fs.writeFileSync(PHASES_FILE, JSON.stringify(phases, null, 2));
      res.writeHead(200); res.end('OK');
    });

  // 5. Ruta GET/POST: Leer y Guardar Documentos (Markdown)
  } else if (req.url.startsWith('/api/document')) {
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const fileName = url.searchParams.get('file');
      const filePath = path.resolve(fileName);
      
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(fs.readFileSync(filePath, 'utf-8'));
      } else {
        res.writeHead(404); res.end('Archivo no encontrado.');
      }
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const { filePath, content } = JSON.parse(body);
        const absolutePath = path.resolve(filePath);
        
        // Crear directorios si no existen
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(absolutePath, content, 'utf-8');
        res.writeHead(200); res.end('OK');
      });
    }

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor UI iniciado!`);
  console.log(`👉 Abre tu navegador en: http://localhost:${PORT}\n`);
});