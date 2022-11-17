import { useEffect, useRef, useState } from "react";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import Map from "ol/Map";
import View from "ol/View";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Heatmap as HeatmapLayer, Tile as TileLayer } from "ol/layer";
import "ol/ol.css";
import "./App.css";

const C = 0.85;

function App() {
  const mapRef = useRef(); // { current: null }
  const tooltipRef = useRef();
  const overlayRef = useRef();
  const [data, setData] = useState({});

  useEffect(() => {
    const feature1 = new Feature({
      geometry: new Point(
        // Coordenadas GeoEspaciales del punto
        fromLonLat([-75.426276, 9.1197861])
      ),
      voltage: 0.9,
      name: "Bolivar",
    });

    const feature2 = new Feature({
      geometry: new Point(
        // Coordenadas GeoEspaciales del punto
        fromLonLat([-74.426276, 4.1197861])
      ),
      voltage: 1.15,
      name: "Bogota",
    });

    const heatMapLayer = new HeatmapLayer({
      source: new VectorSource({
        features: [feature1, feature2],
      }),
      radius: 20,
      blur: 0,
      gradient: [
        "red",
        "purple",
        "blue",
        "grey",
        "grey",
        "yellow",
        "orange",
        "red",
      ],
      weight: (feature) => {
        const value = (feature.values_.voltage - C) / 0.3;
        const result = Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
        return result;
      },
    });

    const overlay = new Overlay({
      element: tooltipRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    // this.overlay = overlay
    overlayRef.current = overlay;

    // Layer Imagen Mapa
    const mapLayer = new TileLayer({
      source: new XYZ({
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      }),
    });

    const map = new Map({
      target: mapRef.current, // Elemento donde lo voy a montar
      layers: [mapLayer, heatMapLayer],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([-72, 4]),
        zoom: 5,
      }),
    });

    map.on("singleclick", (e) => {
      const { coordinate, pixel } = e;

      const [feature] = map.getFeaturesAtPixel(pixel);

      if (feature) {
        const name = feature.get("name");
        const voltage = feature.get("voltage");

        // Show tooltip and prepare coordinates and data
        setData({ name, voltage });
        overlay.setPosition(coordinate);
        return;
      }

      overlay.setPosition();
    });
  }, []);

  return (
    <>
      <div className="map" ref={mapRef}></div>
      <div className="tooltip" ref={tooltipRef}>
        <button onClick={() => overlayRef.current.setPosition()}>Close</button>
        {data?.name}: {data?.voltage}
      </div>
    </>
  );
}

export default App;
