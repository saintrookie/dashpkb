import { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { createEntityDivIcon, createClusterIcon } from '../icons.js'
import EntityPopup from '../popups/EntityPopup.jsx'

export default function MarkerLayer({ entities, selectedId, onEntityClick }) {
  const [hoveredId, setHoveredId] = useState(null)

  if (!entities || entities.length === 0) return null

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      iconCreateFunction={createClusterIcon}
    >
      {entities.map((entity) => (
        <Marker
          key={entity.id}
          position={[entity.latitude, entity.longitude]}
          icon={createEntityDivIcon({
            entityType: entity.entityType,
            color: entity.color,
            selected: entity.id === selectedId,
            hovered: entity.id === hoveredId,
          })}
          eventHandlers={{
            click: () => onEntityClick?.(entity),
            mouseover: () => setHoveredId(entity.id),
            mouseout: () => setHoveredId((current) => (current === entity.id ? null : current)),
          }}
        >
          <Popup className="map-popup">
            <EntityPopup entity={entity} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}
