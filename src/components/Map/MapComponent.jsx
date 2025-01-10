import { useEffect, useState } from "react";
import Map, { Source, Layer } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import MapGeocoder from "./MapGeocoder";
import InfoPopup from "./InfoPopup";
import { formatArea, formatCoordinates } from "./geoUtils"
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
  subdistrictsLayer,
  subdistrictsLineLayer,
} from "./Layers";
import { fetchGeoJSONData } from "./FetchData";

const MapComponent = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [subdistrictsData, setSubdistrictsData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { subdistrictsData, godrejDataFinal } = await fetchGeoJSONData();
        setSubdistrictsData(subdistrictsData);
        setGeojsonData(godrejDataFinal);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);
      }
    };

    loadData();
  }, []);

  const handleMouseEnter = (event) => {
    const feature = event.features[0];
    const [longitude, latitude] = feature.geometry.coordinates;

    setHoverInfo({
      longitude,
      latitude,
      ...(feature.layer.id === "clusters"
        ? {
            area: formatArea(feature.properties.sum_area || 0),
            isCluster: true,
          }
        : {
            state: feature.properties.STATE || "N/A",
            subdistrict: feature.properties.SUBDISTRICT || "N/A",
            district: feature.properties.DISTRICT || "N/A",
            village: feature.properties.VILLAGE || "N/A",
            coordinates: formatCoordinates(longitude, latitude),
            area: formatArea(feature.properties.AREA_ha || 0),
            isCluster: false,
          }),
    });
  };

  const handleMouseLeave = () => setHoverInfo(null);

  const handleClick = (event) => {
     if (!event.features.length) {
       return;
     }
    const feature = event.features[0];
    const [longitude, latitude] = feature.geometry.coordinates;

    if (feature.layer.id === "clusters") {
      const clusterId = feature.properties.cluster_id;
      const mapSource = event.target.getSource("ponds");

      mapSource.getClusterExpansionZoom(clusterId).then((zoom) => {
        event.target.easeTo({ center: [longitude, latitude], zoom });
      });
    } else {
      setPopupInfo({
        longitude,
        latitude,
        state: feature.properties.STATE || "N/A",
        subdistrict: feature.properties.SUBDISTRICT || "N/A",
        district: feature.properties.DISTRICT || "N/A",
        village: feature.properties.VILLAGE || "N/A",
        coordinates: formatCoordinates(longitude, latitude),
        area: formatArea(feature.properties.AREA_ha || 0),
      });
    }
  };

  const handleGoogleMapsRedirect = (longitude, latitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading ? (
        <Box className="flex justify-center items-center absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 z-50">
          <CircularProgress />
        </Box>
      ) : (
        <Map
          initialViewState={{
            longitude: 78.9629,
            latitude: 20.5937,
            zoom: 3,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${
            import.meta.env.VITE_MAPTILER_KEY
          }`}
          mapLib={maplibregl}
          interactiveLayerIds={["clusters", "unclustered-point"]}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {subdistrictsData && (
            <Source id="subdistricts" type="geojson" data={subdistrictsData}>
              <Layer {...subdistrictsLayer} />
              <Layer {...subdistrictsLineLayer} />
            </Source>
          )}

          {geojsonData && (
            <Source
              id="ponds"
              type="geojson"
              data={geojsonData}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={50}
              clusterProperties={{
                sum_area: ["+", ["get", "AREA_ha"]],
              }}
            >
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredPointLayer} />
            </Source>
          )}

          <MapGeocoder />

          {hoverInfo && (
            <InfoPopup
              info={hoverInfo}
              handleGoogleMapsRedirect={handleGoogleMapsRedirect}
            />
          )}

          {popupInfo && (
            <InfoPopup
              info={popupInfo}
              onClose={() => setPopupInfo(null)}
              handleGoogleMapsRedirect={handleGoogleMapsRedirect}
            />
          )}
        </Map>
      )}
    </div>
  );
};

export default MapComponent;
