import React, { useState } from "react";
import { PlusCircle, Bot, Loader2, Trash2 } from "lucide-react";
import { OpenAIAssistant } from "../types";
import { DeleteAssistantConfirmationModal } from "./DeleteAssistantConfirmationModal";

interface OpenAIAssistantsListProps {
  assistants: OpenAIAssistant[];
  onAddAssistant: () => void;
  onDeleteAssistant: (id: string) => void;
  isLoading: boolean;
}

const OpenAIAssistantsList: React.FC<OpenAIAssistantsListProps> = ({
  assistants,
  onAddAssistant,
  onDeleteAssistant,
  isLoading,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assistantToDelete, setAssistantToDelete] = useState<OpenAIAssistant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{assistant.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {assistant.instructions || "Sin instrucciones"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(assistant)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar asistente"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
    </div>
  );
};

export default OpenAIAssistantsList;
