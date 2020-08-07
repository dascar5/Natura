export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGFudGV2biIsImEiOiJja2RoYXplY2cwNm9jMnF1YzI3YzZwNGhsIn0.Pl4SqqROO9Vd1BzjyMWm2Q';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dantevn/ckdhbcffe117f1iq5krw9tj45',
    scrollZoom: false,
    //   center: [-118.4535089, 34.1240171],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // kreiraj marker/point
    const el = document.createElement('div');
    el.className = 'marker'; //custom slika koja se nalazi u public/img
    //dodaj marker/point
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', //donji dio slike da upire na koordinate
    })
      .setLngLat(loc.coordinates)
      .addTo(map); //cita koordinate iz tours

    //dodaj popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
