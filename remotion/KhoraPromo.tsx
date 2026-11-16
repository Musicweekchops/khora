import React from "react"
import { Series } from "remotion"
import { Scene1Hook } from "./scenes/Scene1Hook"
import { Scene2VideoFeedback } from "./scenes/Scene2VideoFeedback"
import { Scene3TasksAndProgress } from "./scenes/Scene3TasksAndProgress"
import { Scene4PushNotification } from "./scenes/Scene4PushNotification"
import { Scene5CTA } from "./scenes/Scene5CTA"

export const KhoraPromo: React.FC = () => {
  return (
    <Series>
      {/* Escena 1: El Gancho (4 segundos = 120 frames) */}
      <Series.Sequence durationInFrames={120}>
        <Scene1Hook />
      </Series.Sequence>

      {/* Escena 2: Video-Reacción en el Segundo Exacto (6 segundos = 180 frames) */}
      <Series.Sequence durationInFrames={180}>
        <Scene2VideoFeedback />
      </Series.Sequence>

      {/* Escena 3: Tareas Semanales y Metas de BPM (4 segundos = 120 frames) */}
      <Series.Sequence durationInFrames={120}>
        <Scene3TasksAndProgress />
      </Series.Sequence>

      {/* Escena 4: Notificación Push en Teléfono Celular (3.5 segundos = 105 frames) */}
      <Series.Sequence durationInFrames={105}>
        <Scene4PushNotification />
      </Series.Sequence>

      {/* Escena 5: Cierre de Marca y Llamado a la Acción (4 segundos = 120 frames) */}
      <Series.Sequence durationInFrames={120}>
        <Scene5CTA />
      </Series.Sequence>
    </Series>
  )
}
