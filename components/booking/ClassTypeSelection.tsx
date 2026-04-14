'use client'

import { useState, useEffect } from 'react'
import { Music, Drum, Package, Check, Star } from 'lucide-react'

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
}

interface ClassTypeSelectionProps {
  onClassTypeSelected: (classType: ClassType) => void
}

export default function ClassTypeSelection({ onClassTypeSelected }: ClassTypeSelectionProps) {
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/class-types')
      .then(res => res.json())
      .then(data => {
        setClassTypes(data.classTypes)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading class types:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  const sortedClassTypes = [...classTypes].sort((a, b) => {
    if (a.name.toLowerCase().includes('prueba')) return -1
    if (b.name.toLowerCase().includes('prueba')) return 1
    if (a.name.toLowerCase().includes('unitaria')) return -1
    if (b.name.toLowerCase().includes('unitaria')) return 1
    return 0
  })

  const getIcon = (classType: ClassType) => {
    const isTrial = classType.name.toLowerCase().includes('prueba')
    const isUnit = classType.name.toLowerCase().includes('unitaria')
    const isMonthly = classType.name.toLowerCase().includes('mensual')
    
    if (isTrial) return <Music className="w-8 h-8" />
    if (isUnit) return <Drum className="w-8 h-8" />
    if (isMonthly) return <Package className="w-8 h-8" />
    return <Music className="w-8 h-8" />
  }

  const getColor = (classType: ClassType) => {
    const isTrial = classType.name.toLowerCase().includes('prueba')
    const isUnit = classType.name.toLowerCase().includes('unitaria')
    const isMonthly = classType.name.toLowerCase().includes('mensual')
    
    if (isTrial) return 'blue'
    if (isUnit) return 'purple'
    if (isMonthly) return 'green'
    return 'gray'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white mb-1">Clases de Batería</h1>
          <p className="text-slate-300">Elige el tipo de clase que mejor se adapte a ti</p>
        </div>

        {/* Cards */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-4">
            {sortedClassTypes.map((classType) => {
              const color = getColor(classType)
              const isMonthly = classType.name.toLowerCase().includes('mensual')
              const isTrial = classType.name.toLowerCase().includes('prueba')

              return (
                <button
                  key={classType.id}
                  onClick={() => onClassTypeSelected(classType)}
                  className={`
                    relative group p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg
                    ${color === 'green' ? 'border-green-200 hover:border-green-500 bg-green-50/50' : ''}
                    ${color === 'blue' ? 'border-blue-200 hover:border-blue-500 bg-blue-50/50' : ''}
                    ${color === 'purple' ? 'border-purple-200 hover:border-purple-500 bg-purple-50/50' : ''}
                  `}
                >
                  {isMonthly && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3" />
                      Popular
                    </div>
                  )}

                  <div className={`
                    mb-4 inline-flex p-3 rounded-lg
                    ${color === 'green' ? 'bg-green-100 text-green-600' : ''}
                    ${color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                    ${color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                  `}>
                    {getIcon(classType)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{classType.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 h-10">{classType.description}</p>

                  <div className="space-y-2 mb-4">
                    {isMonthly && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>4 clases semanales</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Mismo día y hora</span>
                        </div>
                      </>
                    )}

                    {isTrial && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-blue-600" />
                          <span>Sin compromiso</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                          <Check className="w-4 h-4" />
                          <span>Solo 1 por persona</span>
                        </div>
                      </>
                    )}

                    {!isMonthly && !isTrial && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-purple-600" />
                        <span>Flexibilidad total</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-baseline gap-1 mb-1">
                      {isMonthly ? (
                        <>
                          <span className="text-sm text-gray-600">Desde</span>
                          <span className="text-3xl font-bold text-gray-900">
                            ${(classType.price / 1000).toFixed(0)}k
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          ${(classType.price / 1000).toFixed(0)}k
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">{classType.currency}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {isMonthly ? 'Precio varía según fecha de inicio' : `${classType.duration} minutos`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
