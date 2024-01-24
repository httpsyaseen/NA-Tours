const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaHR0cHN5YXNlZW4iLCJhIjoiY2xycHdiZnMxMDhpeTJsbGZxd2pobHdmbiJ9.c2CDJfZbpfYq2a0cs339aQ';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
});
