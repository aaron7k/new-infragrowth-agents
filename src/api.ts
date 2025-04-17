import axios from "axios";
import {
  User,
  UserResponse,
  WhatsAppInstance,
  InstanceConfig,
  OpenAICredential,
  OpenAIAssistant,
  TriggerType,
  TriggerCondition,
} from "./types";
import { toast } from "react-hot-toast";

const BASE_URL = `https://api.infragrowthai.com/webhook/whatsapp`;
const OPENAI_BASE_URL = `https://api.infragrowthai.com/webhook/openai`;

export const getUsers = async (locationId: string): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(`${BASE_URL}/get-users`, {
      params: { locationId },
    });

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map((user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      }));
    }

    return [];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
    }
    return [];
  }
};

export const listInstances = async (
  locationId: string
): Promise<WhatsAppInstance[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/ver-instancias`, {
      params: { locationId },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error listing instances:", error.message);
    }
    return [];
  }
};

export const createInstance = async (
  locationId: string,
  config: InstanceConfig,
  userData?: {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
  }
) => {
  try {
    const response = await axios.post(`${BASE_URL}/create-instance`, {
      locationId,
      ...config,
      n8n_webhook: config.n8n_webhook,
      active_ia: config.active_ia,
      ...(userData && {
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_phone: userData.user_phone,
      }),
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating instance:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al crear la instancia de WhatsApp");
    }
    
    throw error;
  }
};

export const refreshQRCode = async (
  locationId: string,
  instanceName: string
) => {
  try {
    const response = await axios.post(`${BASE_URL}/get-qr`, {
      locationId,
      instanceName,
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error refreshing QR code:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return { error: "Error al obtener QR" };
  }
};

export const deleteInstance = async (
  locationId: string,
  instanceName: string
) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-instance`, {
      data: {
        locationId,
        instanceName,
      },
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting instance:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al eliminar la instancia");
    }
    
    throw error;
  }
};

export const getInstanceData = async (
  locationId: string,
  instanceName: string
) => {
  try {
    const response = await axios.post(`${BASE_URL}/get-instance-data`, {
      locationId,
      instanceName,
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error getting instance data:", error.message);
    }
    return { name: "", number: "", photo: "" };
  }
};

export const turnOffInstance = async (
  locationId: string,
  instanceName: string
) => {
  try {
    const response = await axios.post(`${BASE_URL}/turn-off`, {
      locationId,
      instanceName,
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error turning off instance:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al desconectar la instancia");
    }
    
    throw error;
  }
};

export const editInstance = async (
  locationId: string,
  instanceName: string,
  config: InstanceConfig
) => {
  try {
    const response = await axios.put(`${BASE_URL}/edit-instance`, {
      locationId,
      instanceName,
      ...config,
      n8n_webhook: config.n8n_webhook,
      active_ia: config.active_ia,
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error editing instance:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al actualizar la configuración de la instancia");
    }
    
    throw error;
  }
};

export const getInstanceConfig = async (
  locationId: string,
  instanceId: string
) => {
  try {
    const response = await axios.get(`${BASE_URL}/ver-instancia`, {
      params: { locationId, instanceId },
    });

    if (!response.data.data) {
      throw new Error("No se encontró la configuración de la instancia");
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error getting instance config:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al obtener la configuración de la instancia");
    }
    
    throw error;
  }
};

// OpenAI API endpoints
export const getOpenAICredentials = async (instanceName: string): Promise<OpenAICredential> => {
  try {
    const response = await axios.get(`${OPENAI_BASE_URL}/creds`, {
      params: { instance_name: instanceName }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching OpenAI credentials:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    throw new Error("Error al obtener las credenciales de OpenAI");
  }
};

export const createOpenAICredential = async (
  instanceName: string,
  name: string,
  apiKey: string
) => {
  try {
    const response = await axios.post(`${OPENAI_BASE_URL}/creds`, {
      instance_name: instanceName,
      name,
      apikey: apiKey
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating OpenAI credential:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al crear la credencial de OpenAI");
    }
    
    throw error;
  }
};

export const deleteOpenAICredential = async (
  instanceName: string,
  credentialId: string
) => {
  try {
    const response = await axios.delete(`${OPENAI_BASE_URL}/creds`, {
      params: { 
        instance_name: instanceName,
        id: credentialId
      }
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting OpenAI credential:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al eliminar la credencial de OpenAI");
    }
    
    throw error;
  }
};

// OpenAI Assistant endpoints
export const getOpenAIAssistants = async (instanceName: string): Promise<OpenAIAssistant[]> => {
  try {
    const response = await axios.get(`${OPENAI_BASE_URL}/assistants`, {
      params: { instance_name: instanceName }
    });
    
    // Verificar si la respuesta contiene la propiedad 'data'
    if (response.data && Array.isArray(response.data.data)) {
      // Mapear los datos del API a nuestra estructura OpenAIAssistant
      return response.data.data.map((assistant: any) => ({
        id: assistant.id,
        name: assistant.description || "Sin nombre", // Usando description como nombre
        instructions: "", // Ya no se usa
        apiKeyId: assistant.openaiCredsId,
        createdAt: assistant.createdAt,
        updatedAt: assistant.updatedAt,
        assistantId: assistant.assistantId,
        webhookUrl: assistant.functionUrl,
        triggerType: assistant.triggerType as TriggerType,
        triggerCondition: assistant.triggerOperator as TriggerCondition,
        triggerValue: assistant.triggerValue,
        expirationMinutes: assistant.expire,
        stopKeyword: assistant.keywordFinish,
        messageDelayMs: assistant.delayMessage,
        unknownMessage: assistant.unknownMessage,
        listenToOwner: assistant.listeningFromMe,
        stopByOwner: assistant.stopBotFromMe,
        keepSessionOpen: assistant.keepOpen,
        debounceSeconds: assistant.debounceTime,
        separateMessages: assistant.splitMessages,
        secondsPerMessage: assistant.timePerChar / 10 // Convertir timePerChar a segundos por mensaje
      }));
    }
    
    return [];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching OpenAI assistants:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return [];
  }
};

// Función para obtener un asistente específico
export const getOpenAIAssistant = async (instanceName: string, assistantId: string): Promise<OpenAIAssistant> => {
  try {
    console.log(`Enviando petición GET a ${OPENAI_BASE_URL}/agent con params:`, { 
      instance_name: instanceName, 
      id: assistantId 
    });
    
    const response = await axios.get(`${OPENAI_BASE_URL}/agent`, {
      params: { 
        instance_name: instanceName,
        id: assistantId
      }
    });
    
    console.log("Respuesta completa de getOpenAIAssistant:", response);
    
    if (!response.data) {
      throw new Error("La respuesta no contiene datos");
    }
    
    // Mapear directamente los campos de la respuesta a nuestra estructura
    const assistant = response.data;
    return {
      id: assistant.id || "",
      name: assistant.description || "Sin nombre",
      instructions: "",
      apiKeyId: assistant.openaiCredsId || "",
      createdAt: assistant.createdAt || new Date().toISOString(),
      updatedAt: assistant.updatedAt || new Date().toISOString(),
      assistantId: assistant.assistantId || "",
      webhookUrl: assistant.functionUrl || "",
      triggerType: (assistant.triggerType || "all") as TriggerType,
      triggerCondition: (assistant.triggerOperator || "contains") as TriggerCondition,
      triggerValue: assistant.triggerValue || "",
      expirationMinutes: assistant.expire || 60,
      stopKeyword: assistant.keywordFinish || "#stop",
      messageDelayMs: assistant.delayMessage || 1500,
      unknownMessage: assistant.unknownMessage || "No puedo entender aún este tipo de mensajes",
      listenToOwner: assistant.listeningFromMe || false,
      stopByOwner: assistant.stopBotFromMe !== undefined ? assistant.stopBotFromMe : true,
      keepSessionOpen: assistant.keepOpen !== undefined ? assistant.keepOpen : true,
      debounceSeconds: assistant.debounceTime || 6,
      separateMessages: assistant.splitMessages !== undefined ? assistant.splitMessages : true,
      secondsPerMessage: (assistant.timePerChar || 10) / 10
    };
  } catch (error) {
    console.error("Error completo al obtener asistente:", error);
    
    if (error instanceof Error) {
      console.error("Error fetching OpenAI assistant:", error.message);
    }
    
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
      console.error("Status:", error.response?.status);
      console.error("Headers:", error.response?.headers);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error("Error al obtener el asistente de OpenAI");
    }
    
    throw error;
  }
};

export const createOpenAIAssistant = async (
  instanceName: string,
  name: string,
  instructions: string,
  apiKeyId: string,
  assistantId: string,
  webhookUrl: string,
  triggerType: TriggerType,
  triggerCondition?: TriggerCondition,
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
    const payload: any = {
      instance_name: instanceName,
      description: name, // Usar name como description
      openaiCredsId: apiKeyId,
      assistantId: assistantId,
      functionUrl: webhookUrl,
      triggerType: triggerType,
      botType: "assistant"
    };

    // Solo incluir condición y valor si el tipo de disparador lo requiere
    if (triggerType === 'keyword' || triggerType === 'advanced') {
      payload.triggerOperator = triggerCondition;
      payload.triggerValue = triggerValue;
    }

    // Incluir todas las configuraciones avanzadas
    if (expirationMinutes !== undefined) payload.expire = expirationMinutes;
    if (stopKeyword !== undefined) payload.keywordFinish = stopKeyword;
    if (messageDelayMs !== undefined) payload.delayMessage = messageDelayMs;
    if (unknownMessage !== undefined) payload.unknownMessage = unknownMessage;
    if (listenToOwner !== undefined) payload.listeningFromMe = listenToOwner;
    if (stopByOwner !== undefined) payload.stopBotFromMe = stopByOwner;
    if (keepSessionOpen !== undefined) payload.keepOpen = keepSessionOpen;
    if (debounceSeconds !== undefined) payload.debounceTime = debounceSeconds;
    if (separateMessages !== undefined) payload.splitMessages = separateMessages;
    if (secondsPerMessage !== undefined) payload.timePerChar = secondsPerMessage * 10; // Convertir segundos por mensaje a timePerChar

    const response = await axios.post(`${OPENAI_BASE_URL}/assistants`, payload);
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating OpenAI assistant:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al crear el asistente de OpenAI");
    }
    
    throw error;
  }
};

// Añadir función para actualizar un asistente existente
export const updateOpenAIAssistant = async (
  instanceName: string,
  id: string,
  name: string,
  instructions: string,
  apiKeyId: string,
  assistantId: string,
  webhookUrl: string,
  triggerType: TriggerType,
  triggerCondition?: TriggerCondition,
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
    const payload: any = {
      instance_name: instanceName,
      id: id,
      description: name,
      openaiCredsId: apiKeyId,
      assistantId: assistantId,
      functionUrl: webhookUrl,
      triggerType: triggerType,
      botType: "assistant"
    };

    // Solo incluir condición y valor si el tipo de disparador lo requiere
    if (triggerType === 'keyword' || triggerType === 'advanced') {
      payload.triggerOperator = triggerCondition;
      payload.triggerValue = triggerValue;
    }

    // Incluir todas las configuraciones avanzadas
    if (expirationMinutes !== undefined) payload.expire = expirationMinutes;
    if (stopKeyword !== undefined) payload.keywordFinish = stopKeyword;
    if (messageDelayMs !== undefined) payload.delayMessage = messageDelayMs;
    if (unknownMessage !== undefined) payload.unknownMessage = unknownMessage;
    if (listenToOwner !== undefined) payload.listeningFromMe = listenToOwner;
    if (stopByOwner !== undefined) payload.stopBotFromMe = stopByOwner;
    if (keepSessionOpen !== undefined) payload.keepOpen = keepSessionOpen;
    if (debounceSeconds !== undefined) payload.debounceTime = debounceSeconds;
    if (separateMessages !== undefined) payload.splitMessages = separateMessages;
    if (secondsPerMessage !== undefined) payload.timePerChar = secondsPerMessage * 10;

    const response = await axios.put(`${OPENAI_BASE_URL}/assistants`, payload);
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating OpenAI assistant:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al actualizar el asistente de OpenAI");
    }
    
    throw error;
  }
};

export const deleteOpenAIAssistant = async (
  instanceName: string,
  assistantId: string
) => {
  try {
    const response = await axios.delete(`${OPENAI_BASE_URL}/assistants`, {
      params: { 
        instance_name: instanceName,
        id: assistantId
      }
    });
    
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting OpenAI assistant:", error.message);
    }
    
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al eliminar el asistente de OpenAI");
    }
    
    throw error;
  }
};

// Asegurarse de que todas las funciones estén disponibles para importación
const api = {
  getUsers,
  listInstances,
  createInstance,
  refreshQRCode,
  deleteInstance,
  getInstanceData,
  turnOffInstance,
  editInstance,
  getInstanceConfig,
  getOpenAICredentials,
  createOpenAICredential,
  deleteOpenAICredential,
  getOpenAIAssistants,
  getOpenAIAssistant,
  createOpenAIAssistant,
  updateOpenAIAssistant,
  deleteOpenAIAssistant
};

export default api;
