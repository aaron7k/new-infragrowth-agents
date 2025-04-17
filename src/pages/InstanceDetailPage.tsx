import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, Power, Loader2, RotateCw } from "lucide-react";
import { toast } from "react-hot-toast";
import QRCodeModal from "../components/QRCodeModal";
import api from "../api";
import { WhatsAppInstance, OpenAICredential, OpenAIAssistant } from "../types";
import OpenAICredentialModal from "../components/OpenAICredentialModal";
import OpenAICredentialsList from "../components/OpenAICredentialsList";
import OpenAIAssistantModal from "../components/OpenAIAssistantModal";
import OpenAIAssistantsList from "../components/OpenAIAssistantsList";

interface InstanceDetailPageProps {
  instance: WhatsAppInstance;
  locationId: string;
  onGoBack: () => void;
  onQRCodeUpdated: () => void;
}

const InstanceDetailPage: React.FC<InstanceDetailPageProps> = ({
  instance,
  locationId,
  onGoBack,
  onQRCodeUpdated,
}) => {
  const [instanceData, setInstanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [openAICredentials, setOpenAICredentials] = useState<OpenAICredential | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  
  // OpenAI Assistants state
  const [openAIAssistants, setOpenAIAssistants] = useState<OpenAIAssistant[]>([]);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);

  const fetchInstanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getInstanceData(locationId, instance.instance_name);
      console.log("Instance data:", data);
      setInstanceData(data);
    } catch (error) {
      console.error("Error fetching instance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [locationId, instance.instance_name]);

  const fetchOpenAICredentials = useCallback(async () => {
    setIsLoadingCredentials(true);
    try {
      console.log("Fetching OpenAI credentials for instance:", instance.instance_name);
      const credentials = await api.getOpenAICredentials(instance.instance_name);
      setOpenAICredentials(credentials);
    } catch (error) {
      console.error("Error fetching OpenAI credentials:", error);
      setOpenAICredentials(null);
    } finally {
      setIsLoadingCredentials(false);
    }
  }, [instance.instance_name]);

  const fetchOpenAIAssistants = useCallback(async () => {
    setIsLoadingAssistants(true);
    try {
      console.log("Fetching OpenAI assistants for instance:", instance.instance_name);
      const assistants = await api.getOpenAIAssistants(instance.instance_name);
      setOpenAIAssistants(assistants);
    } catch (error) {
      console.error("Error fetching OpenAI assistants:", error);
      setOpenAIAssistants([]);
    } finally {
      setIsLoadingAssistants(false);
    }
  }, [instance.instance_name]);

  useEffect(() => {
    fetchInstanceData();
    fetchOpenAICredentials();
    fetchOpenAIAssistants();
  }, [fetchInstanceData, fetchOpenAICredentials, fetchOpenAIAssistants]);

  const handleRefreshQR = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.refreshQRCode(locationId, instance.instance_name);
      console.log("QR response:", response);
      
      // Si hay un código QR, mostrar el modal
      if (response.qrcode) {
        setQrCode(response.qrcode);
        setShowQRModal(true);
        onQRCodeUpdated();
      } else if (response.state === "open") {
        // Si no hay QR pero el estado es "open", significa que ya está conectado
        toast.success("¡WhatsApp ya está conectado!");
        await fetchInstanceData(); // Actualizar datos
      } else {
        toast.error("No se pudo obtener el código QR");
      }
      
      // Actualizar los datos de la instancia después de obtener el QR
      // ya que el endpoint whatsapp/get-qr también devuelve el estado
      await fetchInstanceData();
    } catch (error) {
      console.error("Error refreshing QR code:", error);
      toast.error("Error al obtener el código QR");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await api.turnOffInstance(locationId, instance.instance_name);
      toast.success("Instancia desconectada correctamente");
      // Actualizar los datos de la instancia después de desconectar
      await fetchInstanceData();
    } catch (error) {
      console.error("Error disconnecting instance:", error);
      toast.error("Error al desconectar la instancia");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshingData(true);
    try {
      await fetchInstanceData();
      await fetchOpenAICredentials();
      await fetchOpenAIAssistants();
      toast.success("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Error al actualizar los datos");
    } finally {
      setIsRefreshingData(false);
    }
  };

  const handleAddCredential = async (name: string, apiKey: string) => {
    try {
      await api.createOpenAICredential(instance.instance_name, name, apiKey);
      await fetchOpenAICredentials();
    } catch (error) {
      console.error("Error adding credential:", error);
      throw error;
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      await api.deleteOpenAICredential(instance.instance_name, credentialId);
      await fetchOpenAICredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
      throw error;
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
    try {
      console.log("Creating assistant for instance:", instance.instance_name);
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
      await fetchOpenAIAssistants();
    } catch (error) {
      console.error("Error adding assistant:", error);
      throw error;
    }
  };

  const handleEditAssistant = async (
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
  ) => {
    try {
      console.log("Updating assistant for instance:", instance.instance_name, "with id:", id);
      await api.updateOpenAIAssistant(
        instance.instance_name,
        id,
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
      await fetchOpenAIAssistants();
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw error;
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    try {
      console.log("Deleting assistant for instance:", instance.instance_name, "with id:", assistantId);
      await api.deleteOpenAIAssistant(instance.instance_name, assistantId);
      await fetchOpenAIAssistants();
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  };

  // CORREGIDO: Verificar si la instancia está conectada basado en el estado "open"
  const isConnected = instanceData?.state === "open";

  // Función para depuración
  useEffect(() => {
    if (instanceData) {
      console.log("Estado actual:", instanceData.state);
      console.log("¿Está conectado?:", isConnected);
    }
  }, [instanceData, isConnected]);

  // Manejar el cierre del modal QR y actualizar datos
  const handleQRModalClose = useCallback(async () => {
    setShowQRModal(false);
    // Actualizar datos después de cerrar el modal
    await fetchInstanceData();
  }, [fetchInstanceData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoBack}
            className="p-2 rounded-full hover:bg-purple-100"
          >
            <ArrowLeft className="w-6 h-6 text-purple-700" />
          </button>
          <h1 className="text-2xl font-bold text-purple-900">
            {instance.instance_alias}
          </h1>
        </div>
        
        {/* Botón de actualizar datos */}
        <button
          onClick={handleRefreshData}
          disabled={isRefreshingData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          title="Actualizar datos"
        >
          <RotateCw className={`w-5 h-5 ${isRefreshingData ? "animate-spin" : ""}`} />
          <span>Actualizar datos</span>
        </button>
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
                  <p className="font-medium">{instance.instance_name}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Alias</p>
                  <p className="font-medium">{instance.instance_alias}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Estado</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                  {/* Mostrar el estado real para depuración */}
                  <p className="text-xs text-gray-400 mt-1">
                    Estado API: {instanceData?.state || "No disponible"}
                  </p>
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
                      <Power className={`w-5 h-5 ${isDisconnecting ? "animate-spin" : ""}`} />
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
            onAddAssistant={() => setShowAssistantModal(true)}
            onDeleteAssistant={handleDeleteAssistant}
            onEditAssistant={handleEditAssistant}
            isLoading={isLoadingAssistants}
            instanceName={instance.instance_name}
            apiKeys={(openAICredentials?.apiKeys || []).map(key => ({ id: key.id, name: key.name }))}
          />
        </div>
      </div>

      {/* Modal de código QR */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={handleQRModalClose}
        qrCode={qrCode}
        instanceName={instance.instance_name}
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
        instanceName={instance.instance_name}
      />

      {/* Modal para añadir asistente de OpenAI */}
      <OpenAIAssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        onSave={handleAddAssistant}
        instanceName={instance.instance_name}
        apiKeys={(openAICredentials?.apiKeys || []).map(key => ({ id: key.id, name: key.name }))}
        isLoading={isLoadingCredentials}
      />
    </div>
  );
};

export default InstanceDetailPage;
