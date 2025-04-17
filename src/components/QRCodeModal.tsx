import React from "react";
import { X, RefreshCw, Loader2 } from "lucide-react";
import { refreshQRCode } from "../api";
import { toast } from "react-hot-toast";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode?: string;
  instanceName?: string;
  locationId?: string;
  userId?: string;
  userName?: string;
  onQRCodeUpdated?: (qrcode: string) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  instanceName,
  locationId,
  userId,
  userName,
  onQRCodeUpdated,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [qrcodeState, setQrcodeState] = React.useState<string | undefined>(qrCode);

  React.useEffect(() => {
    setQrcodeState(qrCode);
  }, [qrCode]);

  const fetchQRCode = async () => {
    if (!locationId || (!userId && !instanceName)) {
      console.error("Missing required parameters", { locationId, userId, instanceName });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await refreshQRCode(locationId, userId || instanceName || "");
      if (response && response.qrcode) {
        setQrcodeState(response.qrcode);
        if (onQRCodeUpdated) {
          onQRCodeUpdated(response.qrcode);
        }
      } else {
        console.error("No QR code received in response:", response);
        toast.error("No se pudo obtener el código QR.");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("Error al obtener el código QR.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Código QR de {userName || instanceName || "WhatsApp"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 text-center">
                Obteniendo código QR...
              </p>
            </div>
          ) : qrcodeState ? (
            <>
              <img
                src={`data:image/png;base64,${qrcodeState}`}
                alt="Código QR de WhatsApp"
                className="w-64 h-64"
              />
              {locationId && (userId || instanceName) && (
                <button
                  onClick={fetchQRCode}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar QR</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600">Esperando código QR...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
