import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAssistantConfirmationModalProps {
  isOpen: boolean;
  assistantName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteAssistantConfirmationModal: React.FC<DeleteAssistantConfirmationModalProps> = ({
  isOpen,
  assistantName,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-red-600 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Eliminar Asistente
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isDeleting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            ¿Estás seguro de que deseas eliminar el asistente{" "}
            <span className="font-semibold">{assistantName}</span>?
          </p>
          <p className="text-gray-600 text-sm">
            Esta acción no se puede deshacer y eliminará todas las configuraciones asociadas.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
