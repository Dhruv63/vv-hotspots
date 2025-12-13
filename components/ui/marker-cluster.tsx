"use client"

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const MarkerClusterGroup = dynamic(
  async () => {
    const { default: L } = await import('leaflet')
    // @ts-ignore
    if (typeof window !== 'undefined') window.L = L
    await import('leaflet.markercluster')
    const { default: MCG } = await import('react-leaflet-markercluster')
    return MCG
  },
  {
    ssr: false
  }
)

interface MarkerClusterGroupProps {
    children: ReactNode
    showCoverageOnHover?: boolean
    maxClusterRadius?: number
    spiderfyOnMaxZoom?: boolean
    iconCreateFunction?: (cluster: any) => any
}

// Wrapper component to provide types if needed, though dynamic component types are loose
const MarkerClusterGroupWrapper = (props: MarkerClusterGroupProps) => {
    // @ts-ignore
    return <MarkerClusterGroup {...props} />
}

export default MarkerClusterGroupWrapper
