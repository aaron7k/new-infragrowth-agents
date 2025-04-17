import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Power,
} from "lucide-react";
import api from "../api";
import { WhatsAppInstance, OpenAICredential, OpenAIAssistant } from "../types";
import QRCodeModal from "../components/QRCodeModal";
import OpenAICredentialModal from "../components/OpenAICredentialModal";
import OpenAICredentialsList from "../components/OpenAICredentialsList";
import OpenAIAssistantModal from "../components/OpenAIAssistantModal";
import OpenAIAssistantsList from "../components/OpenAIAssistantsList";

interface InstanceDetailPageProps {
  locationId: string;
}

const InstanceDetailPage: React.FC<InstanceDetailPageProps> = ({
  locationId,
}) => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();

  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [instanceData, setInstanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  
  // Estado para credenciales de OpenAI
  const [openAICredentials, setOpenAICredentials] = useState<OpenAICredential | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  
  // Estado para asistentes de OpenAI
  const [openAIAssistants, setOpenAIAssistants] = useState<OpenAIAssistant[]>([]);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState<OpenAIAssistant | null>(null);
  const [isLoadingAssistantDetails, setIsLoadingAssistantDetails] = useState(false);

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      if (!instanceId) return;

      setIsLoading(true);
      try {
        const instances = await api.listInstances(locationId);
        const foundInstance = instances.find(
          (inst) => inst.id === instanceId
        );

        if (foundInstance) {
          setInstance(foundInstance);
          const data = await api.getInstanceData(
            locationId,
            foundInstance.instance_name
          );
          setInstanceData(data);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching instance details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstanceDetails();
  }, [instanceId, locationId, navigate]);

  useEffect(() => {
    if (instance) {
      fetchOpenAICredentials();
      fetchOpenAIAssistants();
    }
  }, [instance]);

  const fetchOpenAICredentials = async () => {
    if (!instance) return;
    
    setIsLoadingCredentials(true);
    try {
      const credentials = await api.getOpenAICredentials(instance.instance_name);
      setOpenAICredentials(credentials);
    } catch (error) {
      console.error("Error fetching OpenAI credentials:", error);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const fetchOpenAIAssistants = async () => {
    if (!instance) return;
    
    setIsLoadingAssistants(true);
    try {
      const assistants = await api.getOpenAIAssistants(instance.instance_name);
      setOpenAIAssistants(assistants);
    } catch (error) {
      console.error("Error fetching OpenAI assistants:", error);
    } finally {
      setIsLoadingAssistants(false);
    }
  };

  const onGoBack = () => {
    navigate("/");
  };

  const handleRefreshQR = async () => {
    if (!instance) return;

    setIsRefreshing(true);
    try {
      const response = await api.refreshQRCode(
        locationId,
        instance.instance_name
      );
      if (response.qrcode) {
        setQrCode(response.qrcode);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Error refreshing QR code:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instance) return;

    setIsDisconnecting(true);
    try {
      await api.turnOffInstance(locationId, instance.instance_name);
      // Actualizar el estado de la instancia después de desconectar
      const data = await api.getInstanceData(locationId, instance.instance_name);
      setInstanceData(data);
    } catch (error) {
      console.error("Error disconnecting instance:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const onQRCodeUpdated = async () => {
    if (!instance) return;
    
    try {
      const data = await api.getInstanceData(locationId, instance.instance_name);
      setInstanceData(data);
    } catch (error) {
      console.error("Error updating instance data:", error);
    }
  };

  const handleAddCredential = async (name: string, apiKey: string) => {
    if (!instance) return;
    
    try {
      await api.createOpenAICredential(instance.instance_name, name, apiKey);
      await fetchOpenAICredentials();
    } catch (error) {
      console.error("Error adding credential:", error);
      throw error;
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (!instance) return;
    
    try {
      await api.deleteOpenAICredential(instance.instance_name, credentialId);
      await fetchOpenAICredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };

  const handleEditAssistant = async (assistant: OpenAIAssistant) => {
    if (!instance) return;
    
    setIsLoadingAssistantDetails(true);
    try {
      // Obtener los detalles completos del asistente
      const assistantDetails = await api.getOpenAIAssistant(instance.instance_name, assistant.id);
      if (assistantDetails) {
        setCurrentAssistant(assistantDetails);
        setShowAssistantModal(true);
      } else {
        // Si no se pudo obtener los detalles, usar los datos básicos
        setCurrentAssistant(assistant);
        setShowAssistantModal(true);
      }
    } catch (error) {
      console.error("Error fetching assistant details:", error);
      // En caso de error, usar los datos básicos
      setCurrentAssistant(assistant);
      setShowAssistantModal(true);
    } finally {
      setIsLoadingAssistantDetails(false);
    }
  };

  const handleAddAssistant = async (
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
    if (!instance) return;
    
    try {
      if (currentAssistant) {
        // Actualizar asistente existente
        await api.updateOpenAIAssistant(
          instance.instance_name,
          currentAssistant.id,
          name,
          instructions,
          apiKeyId,
          assistantId,
          webhookUrl,
          triggerType as any,
          triggerCondition as any,
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
      } else {
        // Crear nuevo asistente
        await api.createOpenAIAssistant(
          instance.instance_name,
          name,
          instructions,
          apiKeyId,
          assistantId,
          webhookUrl,
          triggerType as any,
          triggerCondition as any,
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
      }
      
      setCurrentAssistant(null);
      await fetchOpenAIAssistants();
    } catch (error) {
      console.error("Error adding/editing assistant:", error);
      throw error;
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    if (!instance) return;
    
    try {
      await api.deleteOpenAIAssistant(instance.instance_name, assistantId);
      await fetchOpenAIAssistants();
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  };

  const handleCloseAssistantModal = () => {
    setShowAssistantModal(false);
    setCurrentAssistant(null);
  };

  // Verificar si la instancia está conectada basado en el estado "open"
  const isConnected = instanceData?.state === "open";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onGoBack}
          className="p-2 rounded-full hover:bg-purple-100"
        >
          <ArrowLeft className="w-6 h-6 text-purple-700" />
        </button>
        <h1 className="text-2xl font-bold text-purple-900">
          {instance?.instance_alias}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de la instancia */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-purple-50">
            <h2 className="text-lg font-medium text-purple-900">
              Información de la instancia
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="p-4 flex flex-col items-center">
              {/* Foto de perfil centrada si está disponible */}
              {instanceData?.photo && (
                <div className="mb-4 flex flex-col items-center">
                  <img
                    src={instanceData.photo}
                    alt="Perfil"
                    className="w-24 h-24 rounded-full border-2 border-purple-200"
                  />
                  <p className="mt-2 text-sm text-gray-500">Foto de perfil</p>
                </div>
              )}
              
              {/* Información centrada */}
              <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Nombre de la instancia</p>
                  <p className="font-medium">{instance?.instance_name}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Alias</p>
                  <p className="font-medium">{instance?.instance_alias}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Estado</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
                    </span>
                  </div>
                </div>
                
                {instanceData?.number && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Número</p>
                    <p className="font-medium">{instanceData.number}</p>
                  </div>
                )}
                
                {/* Botones centrados */}
                <div className="flex justify-center pt-4">
                  {!isConnected ? (
                    <button
                      onClick={handleRefreshQR}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      <span>Conectar WhatsApp</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <Power className="w-5 h-5" />
                      <span>Desconectar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Credenciales de OpenAI */}
        <div className="space-y-6">
          <OpenAICredentialsList
            apiKeys={openAICredentials?.apiKeys || []}
            onAddCredential={() => setShowCredentialModal(true)}
            onDeleteCredential={handleDeleteCredential}
            isLoading={isLoadingCredentials}
          />
          
          {/* Asistentes de OpenAI */}
          <OpenAIAssistantsList
            assistants={openAIAssistants}
            onAddAssistant={() => {
              setCurrentAssistant(null);
              setShowAssistantModal(true);
            }}
            onDeleteAssistant={handleDeleteAssistant}
            onEditAssistant={handleEditAssistant}
            isLoading={isLoadingAssistants || isLoadingAssistantDetails}
          />
        </div>
      </div>

      {/* Modal de código QR */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrCode={qrCode}
        instanceName={instance?.instance_name || ""}
        locationId={locationId}
        onQRCodeUpdated={(newQrCode) => {
          setQrCode(newQrCode);
          onQRCodeUpdated();
        }}
      />

      {/* Modal para añadir credencial de OpenAI */}
      <OpenAICredentialModal
        isOpen={showCredentialModal}
        onClose={() => setShowCredentialModal(false)}
        onSave={handleAddCredential}
        instanceName={instance?.instance_name || ""}
      />

      {/* Modal para añadir/editar asistente de OpenAI */}
      <OpenAIAssistantModal
        isOpen={showAssistantModal}
        onClose={handleCloseAssistantModal}
        onSave={handleAddAssistant}
        instanceName={instance?.instance_name || ""}
        apiKeys={(openAICredentials?.apiKeys || []).map(key => ({ id: key.id, name: key.name }))}
        isLoading={isLoadingAssistantDetails}
        assistant={currentAssistant}
      />
    </div>
  );
};

export default InstanceDetailPage;
