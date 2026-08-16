import LayerSwitcher from './LayerSwitcher.jsx'
import MapStyleSwitcher from './MapStyleSwitcher.jsx'
import MapSearch from './MapSearch.jsx'

export default function MapToolbar() {
  return (
    <div className="absolute top-3 left-3 right-[52px] z-[1000] flex items-start gap-2">
      <LayerSwitcher />
      <MapStyleSwitcher />
      <MapSearch />
    </div>
  )
}
