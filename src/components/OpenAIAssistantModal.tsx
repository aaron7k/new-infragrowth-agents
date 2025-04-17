import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ApiKeyOption {
  id: string;
  name: string;
}

interface OpenAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, instructions: string, apiKeyId: string) => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    if (!apiKeyId) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(name, instructions, apiKeyId);
      setName("");
      setInstructions("");
      setApiKeyId("");
      onClose();
      // Removed toast notification here as it will be handled by the API response
    } catch (error) {
      console.error("Error saving OpenAI assistant:", error);
      // Removed toast notification here as it will be handled by the API response
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Asistente de Ventas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrucciones
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona una credencial</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

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
