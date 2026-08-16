import { Fragment } from 'react'
import { Polyline, Marker, Popup } from 'react-leaflet'
import { createRouteEndpointIcon } from '../icons.js'
import RoutePopup from '../popups/RoutePopup.jsx'

const STATUS_COLOR = {
  ACTIVE: '#1668e3',
  PLANNED: '#94a3b8',
  COMPLETED: '#16a34a',
}

export default function RouteLayer({ routes, selectedId, onRouteClick }) {
  if (!routes || routes.length === 0) return null

  return (
    <>
      {routes.map((route) => {
        const color = STATUS_COLOR[route.status] ?? STATUS_COLOR.PLANNED
        const isSelected = route.id === selectedId
        const start = route.coordinates[0]
        const end = route.coordinates[route.coordinates.length - 1]

        return (
          <Fragment key={route.id}>
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color,
                weight: isSelected ? 5 : 3.5,
                opacity: isSelected ? 0.95 : 0.75,
                dashArray: route.status === 'PLANNED' ? '6 8' : undefined,
              }}
              eventHandlers={{ click: () => onRouteClick?.(route) }}
            >
              <Popup className="map-popup">
                <RoutePopup route={route} />
              </Popup>
            </Polyline>
            <Marker position={start} icon={createRouteEndpointIcon('start', color)} eventHandlers={{ click: () => onRouteClick?.(route) }} />
            <Marker position={end} icon={createRouteEndpointIcon('end', color)} eventHandlers={{ click: () => onRouteClick?.(route) }} />
          </Fragment>
        )
      })}
    </>
  )
}
