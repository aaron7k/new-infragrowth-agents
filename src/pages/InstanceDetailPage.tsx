import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, Power, Loader2 } from "lucide-react";
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
      const credentials = await api.getOpenAICredentials(instance.instance_name);
      setOpenAICredentials(credentials);
    } catch (error) {
      console.error("Error fetching OpenAI credentials:", error);
      // No mostramos toast de error aquí porque es posible que no haya credenciales configuradas
      setOpenAICredentials(null);
    } finally {
      setIsLoadingCredentials(false);
    }
  }, [instance.instance_name]);

  const fetchOpenAIAssistants = useCallback(async () => {
    setIsLoadingAssistants(true);
    try {
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
      if (response.qrcode) {
        setQrCode(response.qrcode);
        setShowQRModal(true);
        onQRCodeUpdated();
      } else {
        // No toast here, handled in the API function
      }
    } catch (error) {
      console.error("Error refreshing QR code:", error);
      // No toast here, handled in the API function
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await api.turnOffInstance(locationId, instance.instance_name);
      // No toast here, handled in the API function
      fetchInstanceData();
    } catch (error) {
      console.error("Error disconnecting instance:", error);
      // No toast here, handled in the API function
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleAddCredential = async (name: string, apiKey: string) => {
    try {
      await api.createOpenAICredential(instance.instance_name, name, apiKey);
      await fetchOpenAICredentials();
      // No toast here, handled in the API function
    } catch (error) {
      console.error("Error adding credential:", error);
      // No toast here, handled in the API function
      throw error;
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      await api.deleteOpenAICredential(instance.instance_name, credentialId);
      await fetchOpenAICredentials();
      // No toast here, handled in the API function
    } catch (error) {
      console.error("Error deleting credential:", error);
      // No toast here, handled in the API function
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
    triggerValue?: string
  ) => {
    try {
      await api.createOpenAIAssistant(
        instance.instance_name, 
        name, 
        instructions, 
        apiKeyId,
        assistantId,
        webhookUrl,
        triggerType as any,
        triggerCondition as any,
        triggerValue
      );
      await fetchOpenAIAssistants();
      // No toast here, handled in the API function
    } catch (error) {
      console.error("Error adding assistant:", error);
      // No toast here, handled in the API function
      throw error;
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    try {
      await api.deleteOpenAIAssistant(instance.instance_name, assistantId);
      await fetchOpenAIAssistants();
      // No toast here, handled in the API function
    } catch (error) {
      console.error("Error deleting assistant:", error);
      // No toast here, handled in the API function
    }
  };

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
          {instance.instance_alias}
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
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre de la instancia</p>
                <p className="font-medium">{instance.instance_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Alias</p>
                <p className="font-medium">{instance.instance_alias}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      instanceData?.status === "CONNECTED"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  <span>
                    {instanceData?.status === "CONNECTED"
                      ? "Conectado"
                      : "Desconectado"}
                  </span>
                </div>
              </div>
              {instanceData?.status === "CONNECTED" && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Número</p>
                    <p className="font-medium">{instanceData?.number || "N/A"}</p>
                  </div>
                  {instanceData?.photo && (
                    <div>
                      <p className="text-sm text-gray-500">Foto de perfil</p>
                      <img
                        src={instanceData.photo}
                        alt="Perfil"
                        className="w-16 h-16 rounded-full mt-1"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 flex space-x-3">
                <button
                  onClick={handleRefreshQR}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span>Actualizar QR</span>
                </button>

                {instanceData?.status === "CONNECTED" && (
                  <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                  >
                    <Power className="w-5 h-5" />
                    <span>Desconectar</span>
                  </button>
                )}
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
            isLoading={isLoadingAssistants}
          />
        </div>
      </div>

      {/* Modal de código QR */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrCode={qrCode}
        instanceName={instance.instance_name}
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
