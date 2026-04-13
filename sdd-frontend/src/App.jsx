import React, { useState, useEffect } from 'react';
import { 
  Book, BookOpen, FileText, Layers, Database, 
  ShieldCheck, GitCommit, CheckSquare, ListTodo, 
  Code, Save, ArrowRight, Sun, Moon, Sparkles, Check, Key, Bot, Settings, HardDrive, Server,
  Lock, Shield, User, LogOut, DownloadCloud
} from 'lucide-react';

const PHASES = [
  { id: 1, title: 'Constitución', icon: Book, file: 'constitution.md', que: 'El documento fundacional de tu proyecto.', como: 'Define los principios de arquitectura limpia y reglas categóricas.', paraQue: 'Evitar que la IA alucine librerías donde no debe e instituir una ley inflexible.' },
  { id: 2, title: 'Glosario', icon: BookOpen, file: 'domain-glossary.md', que: 'El diccionario del Lenguaje Ubicuo (DDD).', como: 'Haz una lista de términos de negocio empresariales y defínelos.', paraQue: 'Eliminar ambigüedades idiomáticas. Si la UI y la DB no se entienden, el código colapsa.' },
  { id: 3, title: 'Especificación F.', icon: FileText, file: 'specs/001-core/spec.md', que: 'Tus Requisitos en Criterios de Aceptación.', como: 'Redacta escenarios funcionales con bloques (Dado que / Cuando / Entonces).', paraQue: 'Ser la Source of Truth funcional. Si no se documenta aquí, Antigravity no lo desarrolla.' },
  { id: 4, title: 'Arquitectura C4', icon: Layers, file: 'docs/architecture/context.md', que: 'Topografía del ecosistema.', como: 'Diagrama con código Mermaid los contenedores (DB, UI) y decisiones ADR.', paraQue: 'Tener soporte conceptual gráfico de cómo fluye la estructura del servicio.' },
  { id: 5, title: 'Datos / Estado', icon: Database, file: 'docs/architecture/data-model.md', que: 'Vectores de datos transaccionales.', como: 'Define entidades persistentes, columnas, y cargas de APIs JSON.', paraQue: 'Indicarle al frontend e Infraestructura exactamente la firma que recibirán.' },
  { id: 6, title: 'Roles y Acceso', icon: ShieldCheck, file: 'docs/rbac-matrix.md', que: 'Matriz de control de acceso perimetral.', como: 'Cruza Roles (Guest, Admin) contra los Recursos productivos (Crear_Entidad).', paraQue: 'Desacoplar la protección sin codificar lógica espagueti.' },
  { id: 7, title: 'Flujos (Workflows)', icon: GitCommit, file: 'docs/workflows/state.md', que: 'Fábricas de cambio temporal.', como: 'Usa Mermaid stateDiagram para pintar mutaciones complejas del negocio.', paraQue: 'Resolución explícita del ciclo de vida de un documento o transacción.' },
  { id: 8, title: 'Blueprint TS', icon: CheckSquare, file: 'docs/plan-tecnico.md', que: 'Ingeniería fina del Typescript.', como: 'Escribe interfaces exactas sugeridas, utilitarios puros y las librerías obligatorias.', paraQue: 'Forzar al agente a usar el ecosistema exacto pactado en la constitución.' },
  { id: 9, title: 'Backlog TDD', icon: ListTodo, file: 'tasks.md', que: 'Requerimientos unitarios troquelados.', como: 'Descompila la fase 3 etiquetando casos en base a [RED] y [GREEN].', paraQue: 'Es el comedero puro del Agente dev codificador del IDE. Esto es lo que lee para ejecutar.' },
  { id: 10, title: 'Agente Dev', icon: Code, file: 'src/main.ts', que: 'Momento de verdad.', como: 'Fase simbólica: cierra el orquestador y delega al terminal la orden de construir software.', paraQue: 'Compilar la matriz documental en software tangible sin deuda técnica.' },
];

const getPromptsForPhase = (phaseId) => {
  const instructions = {
    1: "Escribe una constitución de arquitectura limpia (Markdown). TDD obligatorio.",
    2: "Extrae de la fase previa conceptos y redacta un glosario con formato tabla.",
    3: "Crea Criterios de Aceptación precisos en formato Gherkin (Given-When-Then).",
  };
  return instructions[phaseId] || "Asiste documentando esta fase técnica con exactitud de ingeniero Senior.";
};

export default function App() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const activePhase = PHASES[activePhaseIndex];
  
  const [vfs, setVfs] = useState({});
  const [currentContent, setCurrentContent] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverMode, setServerMode] = useState(false); 
  
  const [activeProvider, setActiveProvider] = useState(() => localStorage.getItem('sdd_active_provider') || 'gemini');
  const [apiKeys, setApiKeys] = useState(() => { try { return JSON.parse(localStorage.getItem('sdd_api_keys')) || { gemini: '', openai: '', anthropic: '' }; } catch(e) { return { gemini: '', openai: '', anthropic: '' }; } });
  const [serverHasKeys, setServerHasKeys] = useState({ gemini: false, openai: false, anthropic: false });
  const [showSettings, setShowSettings] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Workspace Projects
  const [projectsList, setProjectsList] = useState([]);
  const [activeProject, setActiveProject] = useState(() => localStorage.getItem('sdd_active_project') || '');
  const [isProjectSealed, setIsProjectSealed] = useState(false);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', error: '', loading: false });

  const isDevMode = currentUser?.role === 'DEVELOPER';

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('sdd_token');
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
       setCurrentUser(null);
       localStorage.removeItem('sdd_token');
       alert('OWASP Shield: Sesión expirada o permisos insuficientes (403/401).');
       throw new Error('Acceso Denegado');
    }
    return res;
  };

  useEffect(() => {
    if (serverMode) {
      apiFetch('/api/workspace/ai-status')
        .then(res => res.json())
        .then(data => setServerHasKeys(data.serverHasKey || {}))
        .catch(() => {});

      apiFetch('/api/workspace/projects')
        .then(res => res.json())
        .then(data => {
          if (data.projects) setProjectsList(data.projects);
          if (data.projects.length > 0 && !activeProject) {
            setActiveProject(data.projects[0]);
          }
        })
        .catch(() => console.error('Error cargando lista de proyectos'));
    }
  }, [serverMode]);

  // Persist Active Project Config
  useEffect(() => {
    if (activeProject) localStorage.setItem('sdd_active_project', activeProject);
  }, [activeProject]);

  // Create Project Helper
  const handleCreateProject = async () => {
    const name = window.prompt("Introduce un identificador para el nuevo proyecto (sin espacios):");
    if (!name?.trim()) return;
    const sanitized = name.trim().replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    
    try {
      const res = await apiFetch('/api/workspace/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: sanitized })
      });
      if (res.ok) {
         setProjectsList(prev => prev.includes(sanitized) ? prev : [...prev, sanitized]);
         setActiveProject(sanitized);
      } else {
         alert("Fallo creando el directorio del proyecto.");
      }
    } catch (e) {
      alert("Error de conexión al crear proyecto.");
    }
  };

  // Apply dark mode to Document
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Bulk Load on Background to populate Checklist Checkmarks
  useEffect(() => {
    setVfs({}); // Volver a cero al cambiar proyecto
    setIsProjectSealed(false);
    
    const fetchAllPhasesBackground = async () => {
      if (serverMode && activeProject) {
        // Consultar estado del candado
        try {
          const sealRes = await apiFetch(`/api/workspace/seal?projectName=${encodeURIComponent(activeProject)}`);
          if (sealRes.ok) {
            const sealData = await sealRes.json();
            setIsProjectSealed(sealData.isSealed);
          }
        } catch(e) {}

        const newVfs = {};
        for (const phase of PHASES) {
          try {
            const response = await apiFetch(`/api/workspace/artifact?relativePath=${encodeURIComponent(phase.file)}&projectName=${encodeURIComponent(activeProject)}`);
            if (response.ok) {
              newVfs[phase.file] = await response.text();
            }
          } catch (e) {
            // fail quietly in background
          }
        }
        setVfs(newVfs);
      }
    };
    fetchAllPhasesBackground();
  }, [serverMode, activeProject]);

  // Sync Editor when tab changes
  useEffect(() => {
    setCurrentContent(vfs[activePhase.file] || '');
  }, [activePhase, vfs]);

  // Save current step and go to next
  const handleSaveAndContinue = async () => {
    if (!currentContent?.trim()) {
      alert("❌ Tu área de trabajo está vacía. No se puede avanzar de fase sin arquitectura documentada.");
      return;
    }

    setIsSaving(true);
    let newVfsState = { ...vfs, [activePhase.file]: currentContent };
    
    if (serverMode) {
      if (!activeProject) {
        alert("¡Alto arquitecto! Debes crear o seleccionar un Proyecto Activo en la barra lateral antes de persistir en tu disco físico.");
        setIsSaving(false);
        return;
      }
      try {
        await apiFetch('/api/workspace/artifact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName: activeProject, relativePath: activePhase.file, content: currentContent })
        });
      } catch (error) {
        console.error('Error guardando proxy local', error);
      }
    } 
    
    setVfs(newVfsState);
    setIsSaving(false);
    
    // Auto Avanzar Phase o Sellar si es la número 10
    if (activePhaseIndex < PHASES.length - 1) {
      setActivePhaseIndex(activePhaseIndex + 1);
    } else {
      // Fase 10 Completada! Sellar proyecto.
      if (serverMode && activeProject) {
        try {
           await apiFetch('/api/workspace/seal', { 
             method: 'POST', 
             headers: {'Content-Type':'application/json'},
             body: JSON.stringify({ projectName: activeProject })
           });
           setIsProjectSealed(true);
        } catch(e) {}
      }
    }
  };

  const handleUnlockProject = async () => {
      if (!serverMode || !activeProject) return;
      try {
         await apiFetch(`/api/workspace/seal/${encodeURIComponent(activeProject)}`, { method: 'DELETE' });
         setIsProjectSealed(false);
      } catch(e) {
         alert("Error abriendo el candado");
      }
  };

  const handleAiAction = async () => {
    if (isProjectSealed) {
      alert("❌ El proyecto está protegido bajo Bóveda. Abre el candado en la parte inferior para pedir nuevos borradores.");
      return;
    }
    const hasKey = serverHasKeys[activeProvider] || apiKeys[activeProvider];
    if (!hasKey) {
      setShowSettings(true);
      return;
    }
    setCopilotLoading(true);
    try {
      // 🧠 Motor de Memoria Histórica Continua
      let memoryContext = "";
      for (let i = 0; i < activePhaseIndex; i++) {
        const pastPhase = PHASES[i];
        const content = vfs[pastPhase.file];
        if (content && content.trim().length > 50) {
          memoryContext += `\n\n[MEMORIA FASE ${pastPhase.id} - ${pastPhase.title}]:\n${content}`;
        }
      }

      const memoryPrompt = memoryContext ? `\n\nCONOCIMIENTO ACUMULADO DEL PROYECTO (USAR COMO BASE ESTRICTA):${memoryContext}` : '';

      const systemPrompt = `Eres el Arquitecto Docente (SpecAgent) IA. Asiste asertivamente en redactar y expandir la fase "${activePhase.title}". Directiva obligatoria: ${getPromptsForPhase(activePhase.id)}`;
      const userPrompt = `Por favor genera el contenido para la fase actual. ${memoryPrompt}\n\nCONTENIDO ACTUAL DE LA FASE ACTIVA (Enriquecer o Autocompletar):\n${currentContent?.trim() ? currentContent : '(vacío, diséñalo interactuando con la memoria)'}\n\nRedacta en formato Markdown profesional y técnico.`;

      const res = await apiFetch('/api/workspace/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider, apiKey: apiKeys[activeProvider], systemPrompt, userPrompt })
      });
      const data = await res.json();
      
      if (res.ok && data.text) {
        setCurrentContent(prev => prev + (prev.trim() ? '\n\n' : '') + data.text);
      } else if (res.ok && !data.text) {
        alert("⚠️ El Agente IA procesó el contexto histórico sin errores de red, pero devolvió un texto vacío.\n\nEsto suele suceder cuando Google Gemini detecta alguna palabra en tu Constitución previa (Phase 1) que activa sus filtros internos de seguridad (Safety Block), obligándolo a censurar la respuesta.\n\nPrueba agregar una frase base tú mismo en este recuadro antes de pulsar el botón.");
      } else {
        alert(`❌ El Agente IA fue bloqueado por Node.\n\nServidor ${activeProvider.toUpperCase()} devolvió: ${data?.error?.message || 'Token inválido o error de conexión'}.\n\nRevisa tu Llave IA en el Panel Lateral.`);
      }
    } catch(err) {
       console.error("AI fetch exception", err);
       alert("❌ Imposible contactar con el Proxy de Node. Revisa tu consola de servidor local.");
    }
    setCopilotLoading(false);
  };

  // Helper check completion (more than 50 chars)
  const isPhaseCompleted = (phase) => {
    const text = vfs[phase.file] || '';
    return text.trim().length > 50;
  };

  const attemptLogin = async (e) => {
    e.preventDefault();
    setLoginForm(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('sdd_token', data.token);
        setCurrentUser(data.user);
      } else {
        setLoginForm(prev => ({ ...prev, error: data.error || 'Autenticación fallida' }));
      }
    } catch(err) {
      setLoginForm(prev => ({ ...prev, error: 'Servidor fuera de línea. Inicia "npm run dev"' }));
    } finally {
      setLoginForm(prev => ({ ...prev, loading: false }));
    }
  };

  if (!currentUser) {
    return (
      <div className={`h-screen w-full flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f4f4f5]'} font-sans`}>
         <div className={`p-10 rounded-[32px] w-[420px] max-w-[90%] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border ${isDarkMode ? 'bg-[#121215] border-zinc-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600/10 p-4 rounded-full border border-indigo-500/20">
                <Lock size={32} className="text-indigo-500" />
              </div>
            </div>
            <h1 className={`text-2xl font-black text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} outfit-font tracking-tight`}>Acceso Restringido</h1>
            <p className={`text-sm text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estación de control SDD-TDD Orchestrator</p>
            
            {loginForm.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl mb-6 flex items-center justify-center gap-2">
                 <Shield size={14}/> {loginForm.error}
              </div>
            )}

            <form onSubmit={attemptLogin} className="flex flex-col gap-4">
               <div>
                 <input 
                   type="text" 
                   autoFocus
                   placeholder="Usuario"
                   value={loginForm.username}
                   onChange={e => setLoginForm(p => ({...p, username: e.target.value}))}
                   className={`w-full p-4 rounded-2xl text-sm font-bold border focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                 />
               </div>
               <div>
                 <input 
                   type="password" 
                   placeholder="Contraseña"
                   value={loginForm.password}
                   onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
                   className={`w-full p-4 rounded-2xl text-sm font-bold border focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                 />
               </div>
               <button 
                 type="submit" 
                 disabled={loginForm.loading}
                 className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
               >
                 {loginForm.loading ? 'Desencriptando...' : 'Desbloquear Interfaz'} <ArrowRight size={16}/>
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-gray-50 text-slate-800 dark:bg-[#0c0c0e] dark:text-gray-200 transition-colors duration-300 font-sans`}>
      
      {/* 1. SIDEBAR OMNIPRESENTE (CHECKLIST) */}
      <aside className="w-80 flex flex-col shrink-0 bg-white dark:bg-[#121215] border-r border-gray-200 dark:border-zinc-800/80 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors z-20">
        
        {/* Cabecera Sidebar */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 dark:border-zinc-800/80 shrink-0">
          <div className="p-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-lg text-white shadow-md">
             <Layers size={18} />
          </div>
          <h1 className="font-extrabold text-lg tracking-tight outfit-font text-gray-900 dark:text-white">Factoría SDD</h1>
        </div>

        {/* Selector de Workspace */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-[#0c0c0e]/30 shrink-0">
           <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">Workspace Activo</div>
           <div className="flex items-center gap-2">
             <select 
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                disabled={!serverMode}
                className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 appearance-none shadow-sm cursor-pointer"
             >
                <option value="" disabled>Selecciona...</option>
                {projectsList.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
             {!isDevMode && (
               <button 
                  onClick={handleCreateProject}
                  disabled={!serverMode}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 disabled:opacity-50 transition-colors shadow-sm"
                  title="Generar Nuevo Proyecto"
               >
                  +
               </button>
             )}
           </div>
           {!serverMode && <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 font-medium leading-tight">Activa el Disco Físico (abajo) para habilitar directorios aislados.</p>}
        </div>

        {/* Lista Clicleable Checklist */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-2 mb-4">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Ciclo Orquestador</p>
          </div>
          
          {PHASES.map((phase, index) => {
            const isActive = index === activePhaseIndex;
            const completed = isPhaseCompleted(phase);
            
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseIndex(index)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 relative group
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60 text-gray-600 dark:text-gray-400'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-transform ${isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white scale-105 shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                    <phase.icon size={16} />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[13px] font-bold tracking-wide ${isActive ? 'font-extrabold' : 'font-medium'}`}>{phase.title}</span>
                  </div>
                </div>

                {/* Checklist Green Icon */}
                {completed && (
                  <div className={`p-1 rounded-full ${isActive ? 'text-emerald-500' : 'text-emerald-500/80 group-hover:text-emerald-500'} dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] bg-emerald-50 dark:bg-transparent`}>
                    <Check size={16} strokeWidth={3.5} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Console / Settings Footer del Sidebar */}
        <div className="p-5 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-[#0c0c0e]/50 shrink-0 space-y-5">
          <div className="flex flex-col gap-2">
            <div className="flex bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1 rounded-lg">
               <button onClick={() => setServerMode(false)} className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-xs font-bold rounded-md transition-colors ${!serverMode ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
                 <Server size={14}/> Memoria RAM
               </button>
               <button onClick={() => setServerMode(true)} className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-xs font-bold rounded-md transition-colors ${serverMode ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
                 <HardDrive size={14}/> Disco Físico
               </button>
            </div>
            
            <div className="px-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                {serverMode 
                  ? "Se conecta al API. Los archivos y fases se guardarán físicamente en tu disco local." 
                  : "Modo simulador (No escribe). Todos tus datos desaparecerán al reiniciar el explorador."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-200 dark:border-transparent dark:hover:border-zinc-700"
            >
              <Key size={14}/>
              <span className="flex items-center gap-2">
                {activeProvider === 'gemini' ? 'Gemini IA' : activeProvider === 'openai' ? 'GPT-4o' : 'Claude 3.5'}
                {(serverHasKeys[activeProvider] || apiKeys[activeProvider]) ? (
                   <span className={`w-2 h-2 rounded-full ${serverHasKeys[activeProvider] ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} title={serverHasKeys[activeProvider] ? "Protegido por Variables de Servidor" : "Cargada Localmente"}></span>
                ) : (
                   <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" title="Falta Llave de Autenticación"></span>
                )}
              </span>
            </button>
            
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-zinc-800 dark:text-gray-400 transition-colors bg-gray-50 dark:bg-zinc-900"
                title="Conmutar Tema (Claro / Oscuro)"
              >
                {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. FLUJO PRINCIPAL WIZARD */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Identity Badge & Logout */}
        <div className="absolute top-6 right-8 flex items-center gap-2 z-10 hidden sm:flex">
             <div className="px-3 py-1.5 bg-white dark:bg-[#121215] rounded-lg text-[10px] font-bold text-gray-600 dark:text-zinc-400 flex items-center gap-2 shadow-sm border border-gray-100 dark:border-zinc-800">
                <User size={12} className={isDevMode ? "text-blue-500" : "text-amber-500"} />
                <span className="uppercase tracking-[0.15em]">{currentUser.role}</span>
             </div>
             
             <button 
               onClick={() => {
                 if(activeProject) {
                   window.location.href = `/api/workspace/download/${encodeURIComponent(activeProject)}?token=${localStorage.getItem('sdd_token')}`;
                 } else {
                   alert("Selecciona un proyecto activo en el disco físico primero.");
                 }
               }}
               className="p-1.5 bg-white dark:bg-[#121215] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500 rounded-lg border border-gray-100 dark:border-zinc-800 transition-colors shadow-sm"
               title="Descargar Arquitectura (.ZIP)"
             >
                <DownloadCloud size={14} />
             </button>

             <button 
               onClick={() => { setCurrentUser(null); localStorage.removeItem('sdd_token'); }}
               className="p-1.5 bg-white dark:bg-[#121215] hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg border border-gray-100 dark:border-zinc-800 transition-colors shadow-sm"
               title="Cerrar Sesión"
             >
                <LogOut size={14} />
             </button>
        </div>

        <div className="max-w-4xl mx-auto px-10 py-12 pb-32 flex flex-col gap-10">
          
          {/* Componente Hero / Título de Fase */}
          <div className="flex items-start justify-between border-b border-gray-200 dark:border-zinc-800/80 pb-6">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-2 font-mono flex items-center gap-2">
                 Fase {activePhase.id} <ArrowRight size={10}/> Documentación Activa
              </p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white outfit-font tracking-tight mb-3">
                {activePhase.title}
              </h2>
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 font-mono text-[11px] shadow-inner">
                Single Source of Truth: <strong className="text-gray-900 dark:text-gray-200">{activePhase.file}</strong>
              </div>
            </div>
          </div>

          {/* Tarjetas 3 Preguntas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">1. Qué es</h4>
              <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{activePhase.que}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">2. Qué hago</h4>
              <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{activePhase.como}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-2">3. Para qué</h4>
              <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{activePhase.paraQue}</p>
            </div>
          </div>

          {/* Bloque: Asistente IA */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner relative overflow-hidden">
             
             <div className="flex items-center gap-4 z-10">
               <div className="p-3 bg-indigo-600 text-white dark:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30">
                 <Bot size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900 dark:text-indigo-100 text-[15px] mb-1">Agente Educativo (SpecAgent)</h3>
                  <p className="text-xs font-medium text-gray-600 dark:text-indigo-300/80 leading-relaxed max-w-lg">
                    ¿Síndrome de la hoja en blanco? Con tu aprobación, usaré la IA (Google Gemini) para devorar las descripciones 
                    técnicas de esta fase y autocompletarte un borrador de calidad en el recuadro inferior. 
                  </p>
               </div>
             </div>

             {!isDevMode && (
               <button 
                  onClick={handleAiAction} 
                  disabled={copilotLoading} 
                  className="z-10 group flex shrink-0 items-center gap-3 text-[13px] font-bold text-white transition-all bg-indigo-600 dark:bg-indigo-600 border border-indigo-700/50 px-6 py-3.5 rounded-xl shadow-[0_4px_15px_-3px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(79,70,229,0.5)] hover:bg-indigo-500 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {copilotLoading ? <Sparkles size={18} className="animate-spin text-white" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                  {copilotLoading ? 'Forjando borrador...' : 'Exigir Borrador a IA'}
               </button>
             )}
             
             {/* Simple bg decoration */}
             <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/5 dark:bg-indigo-500/5 rounded-full blur-3xl -z-0"></div>
          </div>

          {/* Bloque: Editor Documental */}
          {activePhase.id < 10 ? (
            <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group focus-within:border-indigo-300 dark:focus-within:border-indigo-500/50 transition-colors">
              <div className="px-6 py-3 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between bg-gray-50/80 dark:bg-[#0c0c0e]/80">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Workspace Editor</span>
                 <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
                 </div>
              </div>
              <textarea
                value={currentContent}
                onChange={(e) => !isDevMode && setCurrentContent(e.target.value)}
                placeholder={isDevMode ? "Modo Desarrollador. Archivo de solo lectura." : isProjectSealed ? "Este proyecto está protegido bajo Bóveda. Desbloquéalo abajo para continuar editando." : "Digita libremente el contexto aquí..."}
                className={`w-full h-[450px] bg-transparent text-gray-800 dark:text-gray-200 p-8 font-mono text-[14px] leading-8 resize-y focus:outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-700 ${(isProjectSealed || isDevMode) ? 'cursor-not-allowed opacity-50' : ''}`}
                spellCheck="false"
                disabled={isProjectSealed || isDevMode}
              />
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#121215] rounded-3xl border border-gray-200 border-dashed dark:border-zinc-800">
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 mb-6">
                 <Bot size={48} className="text-gray-900 dark:text-white" />
               </div>
               <h3 className="text-2xl font-bold outfit-font text-gray-900 dark:text-white mb-3">La Arquitectura Está Sellada</h3>
               <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed font-medium">
                 El orquestador concluye aquí. Pasa a nivel terminal y dile a tu agente de IDE local explícitamente: 
                 <br/><br/>
                 <code className="text-xs bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white p-2 rounded block">Antigravity, asimila tasks.md y ejecuta TDD para la primera historia.</code>
               </p>
            </div>
          )}

          {/* Floating Save Action */}
          <div className="sticky bottom-8 flex justify-end">
             {isDevMode ? (
               <div className="flex flex-1 w-full justify-center lg:flex-none lg:w-auto items-center gap-3 px-10 py-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wide text-xs rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800/30">
                 <Shield size={18} />
                 Modo Solo Lectura - Acceso Configurado
               </div>
             ) : serverMode && !activeProject ? (
              <button
                disabled={true}
                title="Debes crear tu proyecto en la barra lateral izquierda"
                className="group flex flex-1 w-full justify-center lg:flex-none lg:w-auto items-center gap-3 px-10 py-5 bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-wide text-xs rounded-2xl shadow-none cursor-not-allowed transition-all"
              >
                <Save size={18} />
                Selecciona tu Proyecto Arriba (Disco)
              </button>
             ) : isProjectSealed ? (
              <button
                onClick={handleUnlockProject}
                className="group flex flex-1 w-full justify-center lg:flex-none lg:w-auto items-center gap-3 px-10 py-5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-extrabold uppercase tracking-wide text-xs rounded-2xl shadow-lg transition-all transform hover:-translate-y-1"
                title="Al abrir el candado podrás sobrescribir la arquitectura generada."
              >
                🔒 Habilitar Edición (Proyecto Sellado)
              </button>
             ) : (
              <button
                onClick={handleSaveAndContinue}
                disabled={isSaving || copilotLoading || !currentContent?.trim()}
                className="group flex flex-1 w-full justify-center lg:flex-none lg:w-auto items-center gap-3 px-10 py-5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-extrabold uppercase tracking-wide text-xs rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title={!currentContent?.trim() ? "El documento no puede estar vacío" : "Guardar Documento"}
              >
                <Save size={18} />
                {isSaving ? 'Grabando Arquitectura...' : (!currentContent?.trim() ? 'Prohibido Guardar Archivos Vacíos' : 'Validar Documento y Avanzar Fase')}
                <ArrowRight size={18} className={`transition-transform ${!currentContent?.trim() ? 'opacity-0' : 'group-hover:translate-x-1.5'}`} />
              </button>
             )}
          </div>

        </div>
      </main>

      {/* Settings Modal (Configurar LLave Multi-Provider) */}
       {showSettings && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 w-[420px] max-w-[90%] shadow-2xl">
            <h3 className="text-2xl font-black mb-1 text-gray-900 dark:text-white flex items-center gap-3 outfit-font">
              <Key size={22} className="text-indigo-600 dark:text-indigo-400" /> Motor IA
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
              Selecciona el proveedor y asigna su Token. Estas llaves residen 100% localmente en tu `localStorage` bajo esquemas Zero-Trust.
            </p>
            
            <div className="flex bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl mb-4">
              {['gemini', 'openai', 'anthropic'].map(p => (
                 <button 
                    key={p}
                    onClick={() => { setActiveProvider(p); localStorage.setItem('sdd_active_provider', p); }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeProvider === p ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                 >
                    {p}
                 </button>
              ))}
            </div>

            <input 
              type="password" 
              value={apiKeys[activeProvider] || ''}
              onChange={e => setApiKeys(prev => ({ ...prev, [activeProvider]: e.target.value }))}
              placeholder={`Llave de ${activeProvider.toUpperCase()}...`}
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl p-4 mb-6 text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Abortar</button>
              <button 
                onClick={() => { localStorage.setItem('sdd_api_keys', JSON.stringify(apiKeys)); setShowSettings(false); }} 
                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Guardar Motor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}