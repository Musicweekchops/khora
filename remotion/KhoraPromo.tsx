import React from "react"
import { Series } from "remotion"
import { Scene1Dashboard } from "./scenes/Scene1Dashboard"
import { Scene2RealModal } from "./scenes/Scene2RealModal"
import { Scene3PhonePush } from "./scenes/Scene3PhonePush"
import { Scene4BrandOutro } from "./scenes/Scene4BrandOutro"

export const KhoraPromo: React.FC = () => {
  return (
    <Series>
      {/* Escena 1: El Dashboard Real de Khora y clic en Gloria (3 segundos = 90 frames) */}
      <Series.Sequence durationInFrames={90}>
        <Scene1Dashboard />
      </Series.Sequence>

      {/* Escena 2: El Modal Real de Feedback y Reacción en Pad/Batería (6.5 segundos = 195 frames) */}
      <Series.Sequence durationInFrames={195}>
        <Scene2RealModal />
      </Series.Sequence>

      {/* Escena 3: Notificación Push en Teléfono y Apertura Móvil (3.5 segundos = 105 frames) */}
      <Series.Sequence durationInFrames={105}>
        <Scene3PhonePush />
      </Series.Sequence>

      {/* Escena 4: Cierre de Marca y Llamado a la Acción (3.5 segundos = 105 frames) */}
      <Series.Sequence durationInFrames={105}>
        <Scene4BrandOutro />
      </Series.Sequence>
    </Series>
  )
}
