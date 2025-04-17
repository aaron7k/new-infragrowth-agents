import React, { useState, useEffect } from "react";
import { X, Loader2, HelpCircle } from "lucide-react";

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
    triggerValue?: string
  ) => Promise<void>;
  instanceName: string;
  apiKeys: ApiKeyOption[];
  isLoading?: boolean;
}

const OpenAIAssistantModal: React.FC<OpenAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  instanceName,
  apiKeys,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apiKeyId, setApiKeyId] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [triggerType, setTriggerType] = useState<string>("all");
  const [triggerCondition, setTriggerCondition] = useState<string>("contains");
  const [triggerValue, setTriggerValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear los campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setName("");
      setInstructions("");
      setApiKeyId("");
      setAssistantId("");
      setWebhookUrl("");
      setTriggerType("all");
      setTriggerCondition("contains");
      setTriggerValue("");
      setErrors({});
    }
  }, [isOpen]);

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
      await onSave(
        name, 
        instructions, 
        apiKeyId, 
        assistantId, 
        webhookUrl, 
        triggerType,
        triggerType === 'keyword' || triggerType === 'advanced' ? triggerCondition : undefined,
        triggerType === 'keyword' || triggerType === 'advanced' ? triggerValue : undefined
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-900">
            Crear Asistente de OpenAI
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
                Descripción
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Instrucciones para el asistente..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe cómo debe comportarse el asistente y qué tipo de respuestas debe dar.
              </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Asistente
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
                ID del asistente creado en OpenAI (comienza con "asst_")
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
                URL para llamadas a funciones (opcional)
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
                Define cuándo se activará el asistente
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
                disabled={isSaving || apiKeys.length === 0}
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
