import React, { useState } from "react";
import { PlusCircle, Bot, Loader2, Trash2, Copy, Edit, Check, Link, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { OpenAIAssistant } from "../types";
import { DeleteAssistantConfirmationModal } from "./DeleteAssistantConfirmationModal";
import OpenAIAssistantModal from "./OpenAIAssistantModal";
import { getOpenAIAssistant } from "../api";

interface OpenAIAssistantsListProps {
  assistants: OpenAIAssistant[];
  onAddAssistant: () => void;
  onDeleteAssistant: (id: string) => void;
  onEditAssistant?: (
    id: string,
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
  isLoading: boolean;
  instanceName: string;
  apiKeys: { id: string; name: string }[];
}

const OpenAIAssistantsList: React.FC<OpenAIAssistantsListProps> = ({
  assistants,
  onAddAssistant,
  onDeleteAssistant,
  onEditAssistant,
  isLoading,
  instanceName,
  apiKeys,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assistantToDelete, setAssistantToDelete] = useState<OpenAIAssistant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assistantToEdit, setAssistantToEdit] = useState<OpenAIAssistant | null>(null);
  const [isLoadingAssistant, setIsLoadingAssistant] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDeleteClick = (assistant: OpenAIAssistant) => {
    setAssistantToDelete(assistant);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assistantToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteAssistant(assistantToDelete.id);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setAssistantToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAssistantToDelete(null);
  };

  const handleEditClick = async (assistant: OpenAIAssistant) => {
    setIsLoadingAssistant(true);
    try {
      // Verificar que instanceName no sea undefined
      if (!instanceName) {
        console.error("instanceName es undefined en OpenAIAssistantsList");
        toast.error("Error: No se pudo identificar la instancia");
        return;
      }
      
      console.log("Obteniendo asistente con instanceName:", instanceName, "y assistantId:", assistant.id);
      
      // Obtener los datos completos del asistente
      const assistantData = await getOpenAIAssistant(instanceName, assistant.id);
      console.log("Datos del asistente recibidos:", assistantData);
      setAssistantToEdit(assistantData);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error al obtener datos del asistente:", error);
    } finally {
      setIsLoadingAssistant(false);
    }
  };

  const handleSaveEdit = async (
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
  ) => {
    if (!assistantToEdit || !onEditAssistant) return;
    
    await onEditAssistant(
      assistantToEdit.id,
      name,
      instructions,
      apiKeyId,
      assistantId,
      webhookUrl,
      triggerType,
      triggerCondition,
      triggerValue,
      expirationMinutes,
      stopKeyword,
      messageDelayMs,
      unknownMessage,
      listenToOwner,
      stopByOwner,
      keepSessionOpen,
      debounceSeconds,
      separateMessages,
      secondsPerMessage
    );
    
    setEditModalOpen(false);
    setAssistantToEdit(null);
  };

  const handleCopyAssistantId = (id: string) => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  // Función para obtener el texto del disparador según el tipo
  const getTriggerText = (assistant: OpenAIAssistant) => {
    switch (assistant.triggerType) {
      case 'all':
        return 'Todos los mensajes';
      case 'none':
        return 'Manual';
      case 'keyword':
        return assistant.triggerValue || 'Palabra clave';
      case 'advanced':
        const condition = assistant.triggerCondition ? 
          `${assistant.triggerCondition === 'contains' ? 'contiene' : 
            assistant.triggerCondition === 'equals' ? 'igual a' :
            assistant.triggerCondition === 'startsWith' ? 'empieza con' :
            assistant.triggerCondition === 'endsWith' ? 'termina con' :
            'regex'} ` : '';
        return `${condition}${assistant.triggerValue || ''}`;
      default:
        return 'No definido';
    }
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
            <li key={assistant.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{assistant.name}</p>
                  
                  {/* Mostrar el ID del asistente con botón para copiar */}
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-xs">
                      {assistant.assistantId || "Sin ID"}
                    </p>
                    <button
                      onClick={() => handleCopyAssistantId(assistant.assistantId || '')}
                      className="ml-2 text-gray-400 hover:text-purple-600"
                      title="Copiar ID del asistente"
                      disabled={!assistant.assistantId}
                    >
                      {copiedId === assistant.assistantId ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Mostrar webhook de funciones */}
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Link className="w-4 h-4 mr-1 text-gray-400" />
                    <span>
                      {assistant.webhookUrl ? 
                        <span className="truncate inline-block max-w-xs">{assistant.webhookUrl}</span> : 
                        <span className="text-gray-400">Sin webhook</span>
                      }
                    </span>
                  </div>
                  
                  {/* Mostrar tipo de disparador */}
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4 mr-1 text-gray-400" />
                    <span>
                      Disparador: <span className="font-medium">{getTriggerText(assistant)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {onEditAssistant && (
                    <button
                      onClick={() => handleEditClick(assistant)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar asistente"
                      disabled={isLoadingAssistant}
                    >
                      {isLoadingAssistant ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Edit className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(assistant)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar asistente"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteAssistantConfirmationModal
        isOpen={deleteModalOpen}
        assistantName={assistantToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {assistantToEdit && onEditAssistant && (
        <OpenAIAssistantModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setAssistantToEdit(null);
          }}
          onSave={handleSaveEdit}
          instanceName={instanceName}
          apiKeys={apiKeys}
          isLoading={isLoadingAssistant}
          initialData={assistantToEdit}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default OpenAIAssistantsList;
