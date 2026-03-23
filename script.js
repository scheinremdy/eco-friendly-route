// INIT MAP
let map = L.map('map').setView([52.52, 13.405], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let routeLayer;

// =========================
// FIND ROUTE
// =========================
async function findRoute() {
  const fromText = document.getElementById("from").value;
  const toText = document.getElementById("to").value;

  if (!fromText || !toText) {
    alert("Please enter both locations");
    return;
  }

  try {
    const from = await geocode(fromText);
    const to = await geocode(toText);

    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      alert("No route found");
      return;
    }

    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

    if (routeLayer) map.removeLayer(routeLayer);

    routeLayer = L.polyline(coords, {
      color: '#2ecc71',
      weight: 5
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    const distance = data.routes[0].distance / 1000;

    updateStats(distance);

  } catch (error) {
    alert("Error finding route");
    console.error(error);
  }
}

// =========================
// GEOCODE
// =========================
async function geocode(place) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`);
  const data = await res.json();

  if (!data.length) {
    throw new Error("Location not found");
  }

  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// =========================
// UPDATE STATS
// =========================
function updateStats(distance) {
  document.getElementById("distance").innerText =
    distance.toFixed(2) + " km";

  document.getElementById("time").innerText =
    Math.round((distance / 50) * 60) + " min";

  document.getElementById("co2").innerText =
    (distance * 120).toFixed(0) + " g";

  const cost = distance * 0.08 * 70;

  document.getElementById("cost").innerText =
    "₱ " + cost.toFixed(2);
}

// =========================
// RESET
// =========================
function resetMap() {
  if (routeLayer) map.removeLayer(routeLayer);
}
