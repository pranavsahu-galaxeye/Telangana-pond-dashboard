
import PropTypes from "prop-types";
import { Popup } from "react-map-gl";

const InfoPopup = ({ info, onClose, handleGoogleMapsRedirect }) => {
  return (
    <Popup
      longitude={info.longitude}
      latitude={info.latitude}
      closeButton={!!onClose}
      closeOnClick={!!onClose}
      anchor="top"
      onClose={onClose}
    >
      <div>
        {info.isCluster ? (
          <p>Total Area: {info.area}</p>
        ) : (
          <>
            <p>State: {info.state}</p>
            <p>Subdistrict: {info.subdistrict}</p>
            <p>District: {info.district}</p>
            <p>Village: {info.village}</p>
            <p>Coordinates: {info.coordinates}</p>
            <p>Area: {info.area}</p>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-blue-700 transform transition-all duration-300 text-sm"
              onClick={() =>
                handleGoogleMapsRedirect(info.longitude, info.latitude)
              }
            >
              Open in Google Maps
            </button>
          </>
        )}
      </div>
    </Popup>
  );
};

InfoPopup.propTypes = {
  info: PropTypes.shape({
    longitude: PropTypes.number.isRequired,
    latitude: PropTypes.number.isRequired,
    isCluster: PropTypes.bool,
    area: PropTypes.string,
    state: PropTypes.string,
    subdistrict: PropTypes.string,
    district: PropTypes.string,
    village: PropTypes.string,
    coordinates: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func, // Optional callback for closing the popup
  handleGoogleMapsRedirect: PropTypes.func.isRequired, // Required function for redirecting
};

export default InfoPopup;
