import { adjustCoordinatesToIndia } from "./geoUtils";

export const fetchGeoJSONData = async () => {
  const promises = [
    fetch("/telangana_districts.geojson"),
    fetch("/FINAL_TELANGANA_PONDS_MAPPED_2.geojson"),
  ];

  const [subdistricts, godrej_data_final] = await Promise.all(promises);

  if (!subdistricts.ok) {
    throw new Error(
      `Failed to fetch subdistricts GeoJSON data: ${subdistricts.statusText}`
    );
  }

  if (!godrej_data_final.ok) {
    throw new Error(
      `Failed to fetch GeoJSON data: ${godrej_data_final.statusText}`
    );
  }

  const subdistrictsData = await subdistricts.json();
  let godrejDataFinal = await godrej_data_final.json();
  godrejDataFinal = adjustCoordinatesToIndia(godrejDataFinal);

  return { subdistrictsData, godrejDataFinal };
};
