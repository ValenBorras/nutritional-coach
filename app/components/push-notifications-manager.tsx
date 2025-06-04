"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  Bell,
  BellOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  TestTube,
  Shield,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PushNotificationsManagerProps {
  className?: string;
}

export default function PushNotificationsManager({
  className,
}: PushNotificationsManagerProps) {
  const {
    permission,
    isSupported,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const [isTesting, setIsTesting] = useState(false);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast.success("Notificaciones desactivadas correctamente");
      } else {
        toast.error("Error al desactivar notificaciones");
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast.success(
          "¡Notificaciones activadas! Recibirás recordatorios útiles",
        );
      } else {
        toast.error("Error al activar notificaciones");
      }
    }
  };

  const handleTestNotification = async () => {
    if (!isSubscribed) return;

    setIsTesting(true);
    try {
      await sendTestNotification();
      toast.success("Notificación de prueba enviada");
    } catch (error) {
      toast.error("Error al enviar notificación de prueba");
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        status: "not-supported",
        text: "No compatible",
        description: "Tu navegador no soporta notificaciones push",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: BellOff,
      };
    }

    if (permission === "denied") {
      return {
        status: "denied",
        text: "Bloqueadas",
        description: "Las notificaciones están bloqueadas en tu navegador",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: BellOff,
      };
    }

    if (permission === "granted" && isSubscribed) {
      return {
        status: "active",
        text: "Activas",
        description: "Recibirás notificaciones de NutriGuide",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: Bell,
      };
    }

    return {
      status: "inactive",
      text: "Inactivas",
      description: "Activa las notificaciones para recibir recordatorios",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: BellOff,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (!isSupported) {
    // Detect Safari for specific messaging
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isIOSSafari =
      /iPhone|iPad|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent);
    const isStandalone =
      (navigator as any).standalone === true ||
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

    return (
      <Card className={`${className} border-gray-200`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellOff className="h-5 w-5 text-gray-400" />
              <CardTitle className="text-lg">Notificaciones Push</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              {isSafari ? "Configurando..." : "No compatible"}
            </Badge>
          </div>
          <CardDescription>
            {isSafari ? (
              <div className="space-y-2">
                <p>
                  Estamos configurando las notificaciones para Safari. Esto
                  puede tomar unos segundos...
                </p>
                {!isStandalone && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>
                        💡 Para habilitar notificaciones en Safari:
                      </strong>
                    </p>
                    <ol className="text-sm text-blue-700 mt-1 ml-4 list-decimal">
                      <li>Asegúrate de tener iOS 16.4+ o macOS Safari 16+</li>
                      <li>
                        Instala la app usando "Agregar a pantalla de inicio"
                      </li>
                      <li>
                        Abre la app desde la pantalla de inicio (no desde
                        Safari)
                      </li>
                      <li>
                        Las notificaciones estarán disponibles en unos segundos
                      </li>
                    </ol>
                  </div>
                )}
                {isStandalone && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ App PWA detectada. Las notificaciones deberían
                      activarse automáticamente...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              "Tu navegador no soporta notificaciones push. Usa Chrome, Firefox, Safari o Edge para obtener esta funcionalidad."
            )}
          </CardDescription>
        </CardHeader>

        {isSafari && (
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <strong>Estado del sistema:</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      "serviceWorker" in navigator
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />

                  <span>
                    Service Worker: {"serviceWorker" in navigator ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      "PushManager" in window ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  <span>
                    Push Manager: {"PushManager" in window ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      "Notification" in window ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  <span>
                    Notifications: {"Notification" in window ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isStandalone ? "bg-green-500" : "bg-orange-500"
                    }`}
                  />

                  <span>PWA Mode: {isStandalone ? "Sí" : "No"}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                🔄 Recargar página
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card
      className={`${className} border-soft-rose/20 bg-gradient-to-br from-warm-sand to-warm-sand/80`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />

            <CardTitle className="text-lg text-charcoal">
              Notificaciones Push
            </CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
          >
            {statusInfo.text}
          </Badge>
        </div>
        <CardDescription className="text-charcoal/70">
          {statusInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />

            <span className="text-sm text-red-700">{error}</span>
          </motion.div>
        )}

        {/* Permission denied message */}
        {permission === "denied" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />

              <div>
                <h4 className="font-medium text-amber-800 mb-1">
                  Permisos bloqueados
                </h4>
                <p className="text-sm text-amber-700 mb-2">
                  Para recibir notificaciones, necesitas habilitar los permisos
                  en tu navegador:
                </p>
                <ol className="text-xs text-amber-700 space-y-1 ml-4 list-decimal">
                  <li>
                    Haz clic en el ícono de candado o información en la barra de
                    direcciones
                  </li>
                  <li>
                    Busca la opción "Notificaciones" y selecciona "Permitir"
                  </li>
                  <li>Recarga la página</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Main toggle */}
        {permission !== "denied" && (
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-coral/10 rounded-lg">
                <Smartphone className="h-4 w-4 text-coral" />
              </div>
              <div>
                <Label
                  htmlFor="notifications-toggle"
                  className="text-sm font-medium text-charcoal"
                >
                  Activar notificaciones
                </Label>
                <p className="text-xs text-charcoal/60">
                  Recibe recordatorios y consejos nutricionales
                </p>
              </div>
            </div>
            <Switch
              id="notifications-toggle"
              checked={isSubscribed}
              onCheckedChange={handleToggleNotifications}
              disabled={
                loading || (permission as NotificationPermission) === "denied"
              }
            />
          </div>
        )}

        {/* Test notification button */}
        {isSubscribed && (
          <div className="pt-2 border-t border-soft-rose/20">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isTesting}
              className="w-full border-coral/20 text-coral hover:bg-coral/10"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando prueba...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Enviar notificación de prueba
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isSupported ? "bg-green-500" : "bg-gray-400"
              }`}
            />

            <span className="text-charcoal/60">
              {isSupported ? "Navegador compatible" : "No compatible"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                permission === "granted"
                  ? "bg-green-500"
                  : permission === "denied"
                    ? "bg-red-500"
                    : "bg-orange-500"
              }`}
            />

            <span className="text-charcoal/60">
              {permission === "granted"
                ? "Permisos otorgados"
                : permission === "denied"
                  ? "Permisos denegados"
                  : "Permisos pendientes"}
            </span>
          </div>
        </div>

        {/* Additional info */}
        <div className="pt-3 border-t border-soft-rose/20">
          <details className="group">
            <summary className="cursor-pointer text-xs text-charcoal/60 hover:text-charcoal/80 flex items-center gap-1">
              <span>¿Qué tipo de notificaciones recibiré?</span>
              <span className="transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-2 text-xs text-charcoal/60 space-y-1 pl-2 border-l-2 border-soft-rose/30">
              <p>• Recordatorios para registrar comidas</p>
              <p>• Consejos nutricionales personalizados</p>
              <p>• Actualizaciones importantes de la app</p>
              <p>• Mensajes de tu nutricionista (si estás conectado)</p>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
