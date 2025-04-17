import React, { useState, useEffect } from "react";
import { X, Loader2, HelpCircle, Info, ExternalLink } from "lucide-react";
import { OpenAIAssistant } from "../types";

interface ApiKeyOption {
  id: string;
  name: string;
}

interface OpenAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string, 
    instructions: string, 
    apiKeyId: string,
    assistantId: string,
    webhookUrl: string,
    triggerType: string,
    triggerCondition?: string,
    triggerValue?: string,
    expirationMinutes?: number,
    stopKeyword?: string,
    messageDelayMs?: number,
    unknownMessage?: string,
    listenToOwner?: boolean,
    stopByOwner?: boolean,
    keepSessionOpen?: boolean,
    debounceSeconds?: number,
    separateMessages?: boolean,
    secondsPerMessage?: number
  ) => Promise<void>;
  instanceName: string;
  apiKeys: ApiKeyOption[];
  isLoading?: boolean;
  initialData?: OpenAIAssistant;
  isEditing?: boolean;
}

const OpenAIAssistantModal: React.FC<OpenAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  instanceName,
  apiKeys = [], // Proporcionar un valor predeterminado para evitar undefined
  isLoading = false,
  initialData,
  isEditing = false,
}) => {
  // Campos básicos
  const [name, setName] = useState("");
  const [apiKeyId, setApiKeyId] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [triggerType, setTriggerType] = useState<string>("all");
  const [triggerCondition, setTriggerCondition] = useState<string>("contains");
  const [triggerValue, setTriggerValue] = useState("");
  
  // Campos adicionales con valores predeterminados actualizados
  const [expirationMinutes, setExpirationMinutes] = useState<number>(60);
  const [stopKeyword, setStopKeyword] = useState<string>("#stop");
  const [messageDelayMs, setMessageDelayMs] = useState<number>(1500);
  const [unknownMessage, setUnknownMessage] = useState<string>("No puedo entender aún este tipo de mensajes");
  const [listenToOwner, setListenToOwner] = useState<boolean>(false);
  const [stopByOwner, setStopByOwner] = useState<boolean>(true);
  const [keepSessionOpen, setKeepSessionOpen] = useState<boolean>(true);
  const [debounceSeconds, setDebounceSeconds] = useState<number>(6);
  const [separateMessages, setSeparateMessages] = useState<boolean>(true);
  const [secondsPerMessage, setSecondsPerMessage] = useState<number>(1);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        // Campos básicos
        setName(initialData.name || "");
        setApiKeyId(initialData.apiKeyId || "");
        setAssistantId(initialData.assistantId || "");
        setWebhookUrl(initialData.webhookUrl || "");
        setTriggerType(initialData.triggerType || "all");
        setTriggerCondition(initialData.triggerCondition || "contains");
        setTriggerValue(initialData.triggerValue || "");
        
        // Campos adicionales
        setExpirationMinutes(initialData.expirationMinutes || 60);
        setStopKeyword(initialData.stopKeyword || "#stop");
        setMessageDelayMs(initialData.messageDelayMs || 1500);
        setUnknownMessage(initialData.unknownMessage || "No puedo entender aún este tipo de mensajes");
        setListenToOwner(initialData.listenToOwner || false);
        setStopByOwner(initialData.stopByOwner !== undefined ? initialData.stopByOwner : true);
        setKeepSessionOpen(initialData.keepSessionOpen !== undefined ? initialData.keepSessionOpen : true);
        setDebounceSeconds(initialData.debounceSeconds || 6);
        setSeparateMessages(initialData.separateMessages !== undefined ? initialData.separateMessages : true);
        setSecondsPerMessage(initialData.secondsPerMessage || 1);
      } else {
        // Resetear los campos cuando se abre el modal para crear
        setName("");
        setApiKeyId("");
        setAssistantId("");
        setWebhookUrl("");
        setTriggerType("all");
        setTriggerCondition("contains");
        setTriggerValue("");
        
        // Campos adicionales con valores predeterminados
        setExpirationMinutes(60);
        setStopKeyword("#stop");
        setMessageDelayMs(1500);
        setUnknownMessage("No puedo entender aún este tipo de mensajes");
        setListenToOwner(false);
        setStopByOwner(true);
        setKeepSessionOpen(true);
        setDebounceSeconds(6);
        setSeparateMessages(true);
        setSecondsPerMessage(1);
      }
      
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, initialData, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!apiKeyId) {
      newErrors.apiKeyId = "Debes seleccionar una credencial";
    }
    
    if (!assistantId.trim()) {
      newErrors.assistantId = "El ID del asistente es requerido";
    }
    
    if (triggerType === 'keyword' || triggerType === 'advanced') {
      if (!triggerValue.trim()) {
        newErrors.triggerValue = "El valor del disparador es requerido";
      }
    }
    
    if (expirationMinutes <= 0) {
      newErrors.expirationMinutes = "El tiempo de expiración debe ser mayor a 0";
    }
    
    if (messageDelayMs < 0) {
      newErrors.messageDelayMs = "El delay debe ser un valor positivo";
    }
    
    if (debounceSeconds < 0) {
      newErrors.debounceSeconds = "El debounce debe ser un valor positivo";
    }
    
    if (separateMessages && secondsPerMessage <= 0) {
      newErrors.secondsPerMessage = "Los segundos por mensaje deben ser mayores a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Pasamos una cadena vacía para instructions ya que no se necesita
      await onSave(
        name, 
        "", // Instrucciones vacías, ya no se utilizan
        apiKeyId, 
        assistantId, 
        webhookUrl, 
        triggerType,
        triggerType === 'keyword' || triggerType === 'advanced' ? triggerCondition : undefined,
        triggerType === 'keyword' || triggerType === 'advanced' ? triggerValue : undefined,
        expirationMinutes,
        stopKeyword,
        messageDelayMs,
        unknownMessage,
        listenToOwner,
        stopByOwner,
        keepSessionOpen,
        debounceSeconds,
        separateMessages,
        separateMessages ? secondsPerMessage : undefined
      );
      onClose();
    } catch (error) {
      console.error("Error saving OpenAI assistant:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-900">
            {isEditing ? "Editar Asistente de OpenAI" : "Crear Asistente de OpenAI"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600 text-center">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tabs para navegación */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                className={`py-2 px-4 font-medium ${
                  activeTab === 'basic'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                Configuración Básica
              </button>
              <button
                type="button"
                className={`py-2 px-4 font-medium ${
                  activeTab === 'advanced'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('advanced')}
              >
                Configuración Avanzada
              </button>
            </div>

            {activeTab === 'basic' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instancia
                  </label>
                  <input
                    type="text"
                    value={instanceName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Asistente
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Ej: Asistente de Ventas"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credencial de OpenAI
                  </label>
                  {apiKeys.length === 0 ? (
                    <div className="text-sm text-red-500">
                      No hay credenciales disponibles. Añade una credencial primero.
                    </div>
                  ) : (
                    <select
                      value={apiKeyId}
                      onChange={(e) => setApiKeyId(e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        errors.apiKeyId ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value="">Selecciona una credencial</option>
                      {apiKeys.map((key) => (
                        <option key={key.id} value={key.id}>
                          {key.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.apiKeyId && (
                    <p className="text-red-500 text-xs mt-1">{errors.apiKeyId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    ID del Asistente
                    <a 
                      href="https://platform.openai.com/playground/assistants" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-purple-600 hover:text-purple-800 flex items-center"
                      title="Crear asistente en OpenAI"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </label>
                  <input
                    type="text"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.assistantId ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="asst_..."
                  />
                  {errors.assistantId && (
                    <p className="text-red-500 text-xs mt-1">{errors.assistantId}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    ID del asistente creado en la plataforma de OpenAI (comienza con "asst_")
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de funciones (webhook)
                  </label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL para llamadas a funciones externas desde el asistente (opcional)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de disparador
                  </label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos los mensajes</option>
                    <option value="none">Ninguno (manual)</option>
                    <option value="keyword">Palabra clave</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Define cuándo se activará el asistente en la conversación
                  </p>
                </div>
                
                {(triggerType === 'keyword' || triggerType === 'advanced') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condición
                      </label>
                      <select
                        value={triggerCondition}
                        onChange={(e) => setTriggerCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="contains">Contiene</option>
                        <option value="equals">Es igual a</option>
                        <option value="startsWith">Empieza con</option>
                        <option value="endsWith">Termina con</option>
                        <option value="regex">Expresión regular</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor del disparador
                      </label>
                      <input
                        type="text"
                        value={triggerValue}
                        onChange={(e) => setTriggerValue(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors.triggerValue ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder={
                          triggerCondition === 'regex' 
                            ? "^hola.*mundo$" 
                            : triggerType === 'keyword' 
                              ? "hola" 
                              : "expresión"
                        }
                      />
                      {errors.triggerValue && (
                        <p className="text-red-500 text-xs mt-1">{errors.triggerValue}</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Configuración avanzada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiración del bot (minutos)
                    </label>
                    <input
                      type="number"
                      value={expirationMinutes}
                      onChange={(e) => setExpirationMinutes(parseInt(e.target.value) || 0)}
                      min="1"
                      className={`w-full px-3 py-2 border ${
                        errors.expirationMinutes ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {errors.expirationMinutes && (
                      <p className="text-red-500 text-xs mt-1">{errors.expirationMinutes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo de inactividad antes de finalizar la conversación automáticamente
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Palabra clave para finalizar
                    </label>
                    <input
                      type="text"
                      value={stopKeyword}
                      onChange={(e) => setStopKeyword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="#stop"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Palabra que el usuario puede enviar para detener la conversación con el asistente
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delay de mensaje (ms)
                    </label>
                    <input
                      type="number"
                      value={messageDelayMs}
                      onChange={(e) => setMessageDelayMs(parseInt(e.target.value) || 0)}
                      min="0"
                      className={`w-full px-3 py-2 border ${
                        errors.messageDelayMs ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {errors.messageDelayMs && (
                      <p className="text-red-500 text-xs mt-1">{errors.messageDelayMs}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo de espera para simular que el asistente está "escribiendo..."
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Debounce (segundos)
                    </label>
                    <input
                      type="number"
                      value={debounceSeconds}
                      onChange={(e) => setDebounceSeconds(parseInt(e.target.value) || 0)}
                      min="0"
                      className={`w-full px-3 py-2 border ${
                        errors.debounceSeconds ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {errors.debounceSeconds && (
                      <p className="text-red-500 text-xs mt-1">{errors.debounceSeconds}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo para agrupar mensajes consecutivos del usuario antes de procesarlos
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje Desconocido
                  </label>
                  <textarea
                    value={unknownMessage}
                    onChange={(e) => setUnknownMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="No puedo entender aún este tipo de mensajes"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mensaje que se muestra cuando el asistente no puede procesar ciertos tipos de mensajes
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="listenToOwner"
                      checked={listenToOwner}
                      onChange={(e) => setListenToOwner(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="listenToOwner" className="ml-2 block text-sm text-gray-700">
                      Escuchando al dueño
                    </label>
                    <div className="ml-2 text-gray-500 cursor-help" title="Permite que el asistente responda a mensajes del propietario del número de WhatsApp">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="stopByOwner"
                      checked={stopByOwner}
                      onChange={(e) => setStopByOwner(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="stopByOwner" className="ml-2 block text-sm text-gray-700">
                      Detener por el dueño
                    </label>
                    <div className="ml-2 text-gray-500 cursor-help" title="Permite que el propietario del número detenga el asistente usando la palabra clave">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="keepSessionOpen"
                      checked={keepSessionOpen}
                      onChange={(e) => setKeepSessionOpen(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="keepSessionOpen" className="ml-2 block text-sm text-gray-700">
                      Mantener sesión abierta
                    </label>
                    <div className="ml-2 text-gray-500 cursor-help" title="Mantiene el contexto de la conversación activo incluso después de periodos de inactividad">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="separateMessages"
                      checked={separateMessages}
                      onChange={(e) => setSeparateMessages(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="separateMessages" className="ml-2 block text-sm text-gray-700">
                      Separar mensajes de IA
                    </label>
                    <div className="ml-2 text-gray-500 cursor-help" title="Divide las respuestas largas del asistente en múltiples mensajes para mejor legibilidad">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                {separateMessages && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segundos por mensaje
                    </label>
                    <input
                      type="number"
                      value={secondsPerMessage}
                      onChange={(e) => setSecondsPerMessage(parseInt(e.target.value) || 1)}
                      min="1"
                      className={`w-full px-3 py-2 border ${
                        errors.secondsPerMessage ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {errors.secondsPerMessage && (
                      <p className="text-red-500 text-xs mt-1">{errors.secondsPerMessage}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Intervalo de tiempo entre el envío de mensajes separados
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-300"
                disabled={isSaving || (apiKeys && apiKeys.length === 0)}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OpenAIAssistantModal;
