import React, { useState } from "react";
import { PlusCircle, Bot, Loader2, Trash2, Copy, Check } from "lucide-react";
import { OpenAIAssistant } from "../types";

interface OpenAIAssistantsListProps {
  assistants: OpenAIAssistant[];
  onAddAssistant: () => void;
  onDeleteAssistant: (id: string) => void;
  onEditAssistant: (assistant: OpenAIAssistant) => void;
  isLoading: boolean;
}

const OpenAIAssistantsList: React.FC<OpenAIAssistantsListProps> = ({
  assistants,
  onAddAssistant,
  onDeleteAssistant,
  onEditAssistant,
  isLoading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-purple-900">
              Asistentes de OpenAI
            </h3>
          </div>
        </div>
        <div className="p-6 flex justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-purple-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-purple-900">
            Asistentes de OpenAI
          </h3>
          <button
            onClick={onAddAssistant}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {assistants.length === 0 ? (
        <div className="p-6 text-center">
          <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay asistentes configurados</p>
          <button
            onClick={onAddAssistant}
            className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            Crear asistente
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {assistants.map((assistant) => (
            <li 
              key={assistant.id} 
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onEditAssistant(assistant)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <p className="font-medium text-gray-800">{assistant.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    {assistant.assistantId && (
                      <div className="flex items-center">
                        <span>ID: {assistant.assistantId.substring(0, 12)}...</span>
                        <button
                          onClick={(e) => handleCopyId(e, assistant.assistantId || '')}
                          className="ml-1 text-purple-500 hover:text-purple-700"
                          title="Copiar ID completo"
                        >
                          {copiedId === assistant.assistantId ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                    <span className="mx-1">•</span>
                    <span>
                      {assistant.triggerType === 'keyword' && assistant.triggerValue ? 
                        `Palabra clave: ${assistant.triggerValue}` : 
                        assistant.triggerType === 'all' ? 
                        `Responde a todos los mensajes` : 
                        assistant.triggerType === 'none' ? 
                        `Activación manual` : 
                        assistant.triggerType === 'advanced' && assistant.triggerValue ? 
                        `Expresión: ${assistant.triggerValue}` : ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAssistant(assistant.id);
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Eliminar asistente"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OpenAIAssistantsList;
