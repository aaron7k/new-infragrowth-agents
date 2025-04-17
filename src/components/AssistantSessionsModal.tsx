import React, { useState, useEffect } from "react";
import { X, Loader2, MoreVertical, Pause, Play, XCircle, Trash2, RefreshCw, Search } from "lucide-react";
import { AssistantSession } from "../types";
import { 
  getAssistantSessions, 
  pauseAssistantSession, 
  openAssistantSession,
  closeAssistantSession, 
  deleteAssistantSession 
} from "../api";
import { toast } from "react-hot-toast";

interface AssistantSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceName: string;
  assistantId: string;
  assistantName: string;
}

const AssistantSessionsModal: React.FC<AssistantSessionsModalProps> = ({
  isOpen,
  onClose,
  instanceName,
  assistantId,
  assistantName,
}) => {
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [processingSession, setProcessingSession] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const sessionsData = await getAssistantSessions(instanceName, assistantId);
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Error al obtener las sesiones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, instanceName, assistantId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSessions();
      toast.success("Sesiones actualizadas");
    } catch (error) {
      console.error("Error refreshing sessions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePauseSession = async (session: AssistantSession) => {
    setProcessingSession(session.sessionId);
    try {
      await pauseAssistantSession(instanceName, assistantId, session.sessionId, session.remoteJid);
      // Actualizar la lista de sesiones
      await fetchSessions();
      setActionMenuOpen(null);
      toast.success("Sesión pausada correctamente");
    } catch (error) {
      console.error("Error pausing session:", error);
      toast.error("Error al pausar la sesión");
    } finally {
      setProcessingSession(null);
    }
  };

  const handleOpenSession = async (session: AssistantSession) => {
    setProcessingSession(session.sessionId);
    try {
      await openAssistantSession(instanceName, assistantId, session.sessionId, session.remoteJid);
      // Actualizar la lista de sesiones
      await fetchSessions();
      setActionMenuOpen(null);
      toast.success("Sesión abierta correctamente");
    } catch (error) {
      console.error("Error opening session:", error);
      toast.error("Error al abrir la sesión");
    } finally {
      setProcessingSession(null);
    }
  };

  const handleCloseSession = async (session: AssistantSession) => {
    setProcessingSession(session.sessionId);
    try {
      await closeAssistantSession(instanceName, assistantId, session.sessionId, session.remoteJid);
      // Actualizar la lista de sesiones
      await fetchSessions();
      setActionMenuOpen(null);
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Error al cerrar la sesión");
    } finally {
      setProcessingSession(null);
    }
  };

  const handleDeleteSession = async (session: AssistantSession) => {
    setProcessingSession(session.sessionId);
    try {
      await deleteAssistantSession(instanceName, assistantId, session.sessionId, session.remoteJid);
      // Actualizar la lista de sesiones
      await fetchSessions();
      setActionMenuOpen(null);
      toast.success("Sesión eliminada correctamente");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Error al eliminar la sesión");
    } finally {
      setProcessingSession(null);
    }
  };

  const toggleActionMenu = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionMenuOpen === sessionId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(sessionId);
    }
  };

  // Cerrar el menú de acciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Solo cerrar si el clic no fue en un botón de acción
      const target = e.target as HTMLElement;
      if (!target.closest('.session-action-button') && !target.closest('.session-action-menu')) {
        setActionMenuOpen(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Filtrar sesiones según la búsqueda
  const filteredSessions = sessions.filter(session => {
    const remoteJidMatch = session.remoteJid && session.remoteJid.toLowerCase().includes(searchQuery.toLowerCase());
    const pushNameMatch = session.pushName && session.pushName.toLowerCase().includes(searchQuery.toLowerCase());
    const sessionIdMatch = session.sessionId && session.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return remoteJidMatch || pushNameMatch || sessionIdMatch;
  });

  // Formatear remoteJid para mostrar solo el número
  const formatRemoteJid = (remoteJid: string) => {
    if (!remoteJid) return "";
    return remoteJid.split('@')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-900">
            Sesiones de {assistantName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de búsqueda y botón de actualizar */}
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por número o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Tabla de sesiones */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 text-center">Cargando sesiones...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay sesiones disponibles</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID de Sesión
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatRemoteJid(session.remoteJid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.pushName || "~"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {session.sessionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${session.status === 'opened' ? 'bg-green-100 text-green-800' : 
                          session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {session.status === 'opened' ? 'Abierta' : 
                         session.status === 'paused' ? 'Pausada' : 'Cerrada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      {/* Botones directos para acciones comunes */}
                      {session.status === 'opened' ? (
                        <button
                          onClick={() => handlePauseSession(session)}
                          disabled={processingSession === session.sessionId}
                          className="mr-2 p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"
                          title="Pausar sesión"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSession(session)}
                          disabled={processingSession === session.sessionId}
                          className="mr-2 p-1 text-green-600 hover:bg-green-100 rounded-full"
                          title="Abrir sesión"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Menú de acciones adicionales */}
                      <button
                        onClick={(e) => toggleActionMenu(session.id, e)}
                        className="text-gray-500 hover:text-gray-700 session-action-button inline-flex"
                        disabled={processingSession === session.sessionId}
                      >
                        {processingSession === session.sessionId ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <MoreVertical className="w-5 h-5" />
                        )}
                      </button>
                      
                      {actionMenuOpen === session.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 session-action-menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {session.status === 'opened' ? (
                              <button
                                onClick={() => handlePauseSession(session)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSession(session)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Abrir
                              </button>
                            )}
                            
                            {session.status !== 'closed' && (
                              <button
                                onClick={() => handleCloseSession(session)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cerrar
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSession(session)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantSessionsModal;
