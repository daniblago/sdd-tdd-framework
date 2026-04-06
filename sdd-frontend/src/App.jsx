import React, { useState, useEffect } from 'react';
import { 
  Book, BookOpen, FileText, Layers, Database, 
  ShieldCheck, GitCommit, CheckSquare, ListTodo, 
  Code, Play, Save, Activity, Server, HardDrive, 
  Key, Sparkles, AlertTriangle, X, Copy, Check
} from 'lucide-react';

const PHASES = [
  { id: 1, title: 'Constitución', icon: Book, file: 'constitution.md', desc: 'Principios y Arquitectura' },
  { id: 2, title: 'Glosario', icon: BookOpen, file: 'domain-glossary.md', desc: 'Lenguaje Ubicuo' },
  { id: 3, title: 'Especificación', icon: FileText, file: 'specs/001-framework-core/spec.md', desc: 'Casos de Uso y ACs' },
  { id: 4, title: 'Arquitectura', icon: Layers, file: 'docs/architecture/context.md', desc: 'Diagramas C4 y ADRs' },
  { id: 5, title: 'Datos y Contratos', icon: Database, file: 'docs/architecture/data-model.md', desc: 'Modelos y APIs' },
  { id: 6, title: 'Seguridad', icon: ShieldCheck, file: 'docs/rbac-matrix.md', desc: 'Roles y Permisos' },
  { id: 7, title: 'Workflows', icon: GitCommit, file: 'docs/workflows/aprobacion-especificacion.md', desc: 'Estados de Negocio' },
  { id: 8, title: 'Plan Técnico', icon: CheckSquare, file: 'docs/plan-tecnico.md', desc: 'Firmas e Interfaces' },
  { id: 9, title: 'Tareas (Backlog)', icon: ListTodo, file: 'tasks.md', desc: 'Desglose TDD' },
  { id: 10, title: 'Construcción', icon: Code, file: 'src/domain/Task.ts', desc: 'Código Fuente' },
];

const getPromptsForPhase = (phaseId, content) => {
  const prompts = {
    1: "Actúa como un arquitecto de software experto. Dado un breve contexto del proyecto, genera una constitución técnica que defina principios de Arquitectura Limpia, Reglas de TDD y estándares.",
    2: "Analiza la Constitución o el contexto actual y extrae un Glosario de Dominio (Lenguaje Ubicuo) en formato Markdown.",
    3: "Crea una Especificación Funcional que incluya Visión, Criterios de Aceptación (AC) precisos y un diagrama Mermaid del flujo principal.",
    4: "Genera un diagrama C4 Nivel 2 (Containers) usando Mermaid y un registro ADR inicial basándote en la especificación previa.",
    5: "Diseña el Modelo de Datos (tablas, relaciones) y los contratos de API en base a la arquitectura definida.",
    6: "Construye una Matriz de Control de Acceso Basado en Roles (RBAC) para el sistema propuesto.",
    7: "Modela los estados de negocio (Workflows) con diagramas de estado Mermaid.",
    8: "Crea el Plan Técnico con las firmas de interfaces de TypeScript requeridas.",
    9: "Basándote en la Especificación y el Modelo de Datos, genera una lista de tareas (Backlog) usando etiquetas [RED], [GREEN], [REFACTOR].",
    10: "Escribe el test automatizado fallido (Fase RED) para la primera tarea disponible."
  };
  return prompts[phaseId] || "Asísteme con esta fase.";
};

export default function App() {
  const [activePhase, setActivePhase] = useState(PHASES[0]);
  const [currentContent, setCurrentContent] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [serverMode, setServerMode] = useState(false); 
  const [vfs, setVfs] = useState({});

  // IA y Copilot State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sdd_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showSoftWarning, setShowSoftWarning] = useState(false);
  const [nextPhaseToNavigate, setNextPhaseToNavigate] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      if (serverMode) {
        try {
          const response = await fetch(`/api/document?file=${encodeURIComponent(activePhase.file)}`);
          if (response.ok) {
            const text = await response.text();
            setCurrentContent(text);
            addLog(`[SISTEMA] Archivo ${activePhase.file} cargado.`, 'info');
          } else {
            setCurrentContent('');
            addLog(`[SISTEMA] Archivo ${activePhase.file} no encontrado.`, 'warning');
          }
        } catch (error) {
          setServerMode(false);
          addLog(`[ADVERTENCIA] Falló modo local. Pasando a Memoria.`, 'warning');
          setCurrentContent(vfs[activePhase.file] || '');
        }
      } else {
        setCurrentContent(vfs[activePhase.file] || '');
        addLog(`[SIMULACIÓN] ${activePhase.file} cargado de memoria.`, 'info');
      }
      setIsLoading(false);
    };

    fetchDocument();
  }, [activePhase, serverMode]); 

  const addLog = (msg, type = 'info') => {
    setTerminalLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    addLog(`Intentando guardar ${activePhase.file}...`, 'info');
    if (serverMode) {
      try {
        const response = await fetch('/api/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: activePhase.file, content: currentContent })
        });
        if (response.ok) addLog(`Guardado en disco.`, 'success');
        else addLog(`Error al guardar en disco.`, 'error');
      } catch (error) {
        addLog(`Falló la conexión al servidor.`, 'error');
      }
    } else {
      setVfs(prev => ({ ...prev, [activePhase.file]: currentContent }));
      addLog(`Guardado en memoria de sesión.`, 'success');
    }
    setIsSaving(false);
  };

  const attemptNavigate = (phase) => {
    // Soft block logic: if going to phase 9 or 10, check if we have content
    if (phase.id >= 9) {
      // Basic heuristic: check if early phases are very short
      const docLen = currentContent.trim().length;
      if (activePhase.id < 9 && docLen < 50) {
        setNextPhaseToNavigate(phase);
        setShowSoftWarning(true);
        return;
      }
    }
    setActivePhase(phase);
  };

  const handleAiAction = async () => {
    const promptInstructions = getPromptsForPhase(activePhase.id);
    
    if (!apiKey) {
      // Act mode "Prompt Generator"
      addLog(`Copilot: Mostrando prompt para copiar (Sin API Key).`, 'info');
      return; // Will just show in UI
    }

    setCopilotLoading(true);
    addLog(`Copilot: Consultando IA...`, 'info');
    
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      const systemPrompt = `Eres un experto guiando SDD-TDD. ${promptInstructions}`;
      const userPrompt = `El contenido actual es: \n\n${currentContent || '(vacío)'}\n\nPor favor, genera un borrador o asísteme con completarlo. Responde solo con lo que se deba colocar en el documento.`;

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `System Instruccion: ${systemPrompt}\n\nRequerimiento: ${userPrompt}` }]
          }]
        })
      });
      const data = await res.json();
      
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setCurrentContent(prev => prev + '\n\n' + data.candidates[0].content.parts[0].text);
        addLog(`Copilot: Borrador generado para ${activePhase.title}.`, 'success');
      } else {
        addLog(`Copilot Error: ${data.error?.message || 'Fallo de IA'}`, 'error');
      }
    } catch(err) {
      addLog(`Error al conectar con la IA de Google. Revisa tu red o API Key.`, 'error');
    }
    setCopilotLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-300 font-sans overflow-hidden">
      
      {/* SIDEBAR - FASES */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-10 glass-panel">
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 outfit-font">
            <Activity className="text-emerald-500" />
            SDD-TDD Factoría
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const isActive = activePhase.id === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => attemptNavigate(phase)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
                <div>
                  <div className={`font-medium text-sm ${isActive ? 'text-emerald-300 font-semibold' : 'text-gray-300'}`}>
                    {phase.title}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT Y EDITOR */}
      <div className="flex-1 flex flex-col relative z-0">
        
        {/* HEADER */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900 py-1 px-3 rounded-full border border-gray-800">
              <span className="text-emerald-500 font-mono">Fase {activePhase.id}</span>
              <span>/</span>
              <span className="font-mono">{activePhase.file}</span>
            </div>
            {isLoading && <span className="text-xs text-emerald-500 animate-pulse">Cargando...</span>}
            
            <button 
              onClick={() => setServerMode(!serverMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                serverMode 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {serverMode ? <HardDrive size={12} /> : <Server size={12} />}
              {serverMode ? 'Modo: Local' : 'Modo: Memoria'}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-full"
              title="Configurar Copilot (API Key)"
            >
              <Key size={18} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors border border-gray-700 disabled:opacity-50"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        </div>

        {/* EDITOR TIPO NOTION/VSCODE */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 border border-gray-800/80 rounded-xl overflow-hidden bg-[#0d1117] flex flex-col relative shadow-2xl">
            <textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              placeholder={`Escribe aquí la documentación para:\n${activePhase.desc}...`}
              className="flex-1 w-full bg-transparent text-gray-300 p-6 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* TERMINAL */}
        <div className="h-48 border-t border-gray-800 bg-gray-950 flex flex-col">
          <div className="px-4 py-1.5 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
            <Play size={12} className="text-gray-500" />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Terminal Output</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 scroll-smooth">
            {terminalLogs.slice().reverse().map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-emerald-400' : ''}
                  ${log.type === 'warning' ? 'text-yellow-400' : ''}
                  ${log.type === 'info' ? 'text-blue-300' : ''}
                `}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - COPILOT PANEL */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-10 glass-panel">
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-indigo-900/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 outfit-font">
            <Sparkles className="text-indigo-400" size={18}/>
            Copiloto SDD
          </h2>
          <p className="text-xs text-gray-400 mt-1">Asistente estratégico de fase</p>
        </div>
        
        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 text-sm">
            <p className="text-gray-300 mb-2">
              <strong className="text-white block mb-1">Guía para {activePhase.title}:</strong>
              {activePhase.id === 1 && "Start by defining the system's architecture boundaries. If you're stuck, I can draft a basic DDD schema."}
              {activePhase.id === 3 && "This is the source of truth. Make sure to use clear Acceptance Criteria (AC)."}
              {activePhase.id === 9 && "Break down the specs into TDD loops (RED, GREEN, REFACTOR). Focus on testable units."}
              {activePhase.id !== 1 && activePhase.id !== 3 && activePhase.id !== 9 && "Asegúrate de que esta fase concuerda con la fase anterior."}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {!apiKey ? (
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-sm">
                <p className="text-blue-300 mb-3 text-xs">Sin API Key. Copia este prompt a tu ChatGPT/Gemini:</p>
                <div className="bg-gray-950 p-3 rounded text-xs font-mono text-gray-400 break-words mb-3 relative max-h-32 overflow-y-auto">
                  {getPromptsForPhase(activePhase.id)}
                </div>
                <button 
                  onClick={() => copyToClipboard(getPromptsForPhase(activePhase.id))}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded transition-colors text-xs"
                >
                  {copiedResponse ? <Check size={14}/> : <Copy size={14}/>}
                  {copiedResponse ? 'Copiado' : 'Copiar Prompt'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAiAction}
                disabled={copilotLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none overflow-hidden transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              >
                {copilotLoading ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <Sparkles size={16} /> Pensando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                    Generar Borrador AI
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 w-96 max-w-[90%] shadow-2xl glass-panel">
            <h3 className="text-xl font-bold mb-4 outfit-font text-white flex items-center gap-2">
              <Key size={18} className="text-emerald-500" /> API Key (Gemini)
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Añade tu clave para que el Copilot genere texto directamente. Si lo dejas vacío, te mostraremos los prompts para que copies a tu LLM preferido.
            </p>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 mb-4 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('sdd_api_key', apiKey);
                  setShowSettings(false);
                  addLog('API Key guardada localmente.', 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOFT WARNING MODAL */}
      {showSoftWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-900/50 w-[450px] max-w-[90%] shadow-[0_0_40px_rgba(220,38,38,0.2)] glass-panel">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold outfit-font">¡Atención! Vibe Coding Detectado</h3>
            </div>
            <p className="text-sm text-gray-300 mb-5 leading-relaxed">
              Estás intentando avanzar a la fase del Micro-Ciclo (<strong>{nextPhaseToNavigate?.title}</strong>) pero la fase actual parece carecer de detalle sustancial (menos de 50 caracteres).
              <br/><br/>
              La regla de oro del framework prohíbe escribir código sin una especificación clara. ¿Aún así deseas avanzar?
            </p>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowSoftWarning(false)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors border border-gray-700"
              >
                Quiero completar la documentación primero
              </button>
              <button 
                onClick={() => {
                  setShowSoftWarning(false);
                  setActivePhase(nextPhaseToNavigate);
                  addLog(`Ignoró advertencia de diseño, pasando código.`, 'warning');
                }}
                className="w-full py-2 text-gray-500 hover:text-red-400 text-sm transition-colors"
              >
                Asumiré el riesgo, continuar a la fase.
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}