const map = L.map("map").setView([-7.8014, 110.3647], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let bufferActive = false, measureActive = false, markerActive = false;
let bufferLayer = L.layerGroup().addTo(map);
let markerLayer = L.layerGroup().addTo(map);
let measureLayer = L.layerGroup().addTo(map);
let tempLine = null, pointA = null;

function toggleEditMenu() {
  const menu = document.getElementById("editMenu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function toggleBuffer() {
  bufferActive = !bufferActive;
  measureActive = markerActive = false;
  updateStatus();
}

function toggleMeasure() {
  measureActive = !measureActive;
  bufferActive = markerActive = false;
  pointA = null;
  if (tempLine) { measureLayer.removeLayer(tempLine); tempLine = null; }
  updateStatus();
}

function toggleMarker() {
  markerActive = !markerActive;
  bufferActive = measureActive = false;
  updateStatus();
}

function updateStatus() {
  document.getElementById("bStatus").innerText = bufferActive ? "ON" : "OFF";
  document.getElementById("mStatus").innerText = measureActive ? "ON" : "OFF";
  document.getElementById("tStatus").innerText = markerActive ? "ON" : "OFF";
}

map.on("click", function (e) {
  if (bufferActive) {
    let radius = prompt("Masukkan radius buffer (meter):", "500");
    if (radius === null || isNaN(radius) || radius < 0) return;
    radius = parseFloat(radius);
    const circle = L.circle(e.latlng, {
      radius: radius,
      color: "red",
      fillColor: "#ffff66",
      fillOpacity: 0.4
    }).addTo(bufferLayer);
    const id = circle._leaflet_id;
    circle.bindPopup(`
      <b>Buffer</b><br>Radius: ${radius} m<br>
      <button onclick="editBuffer(${id})">Edit Radius</button><br>
      <button onclick="deleteBuffer(${id})">Hapus</button>
    `).openPopup();
  } else if (measureActive) {
    if (!pointA) {
      pointA = e.latlng;
      L.marker(pointA).addTo(measureLayer).bindPopup("Titik A").openPopup();
    } else {
      const pointB = e.latlng;
      const distance = pointA.distanceTo(pointB);
      const km = (distance / 1000).toFixed(2);
      const m = Math.round(distance);
      tempLine = L.polyline([pointA, pointB], { color: "blue" }).addTo(measureLayer)
        .bindPopup(`Jarak: ${m} m (${km} km)<br><button onclick="hapusGaris()">Hapus</button>`).openPopup();
      pointA = null;
    }
  } else if (markerActive) {
    const marker = L.marker(e.latlng, { draggable: true }).addTo(markerLayer);
    const id = marker._leaflet_id;
    marker.bindPopup(`
      <b>Marker</b><br>
      <button onclick="deleteMarker(${id})">Hapus</button>
    `).openPopup();
  }
});

function editBuffer(id) {
  const layer = bufferLayer.getLayer(id);
  let newRadius = prompt("Radius baru (meter):", layer.getRadius());
  if (newRadius === null || isNaN(newRadius) || newRadius < 0) return;
  layer.setRadius(parseFloat(newRadius));
  layer.setPopupContent(`
    <b>Buffer</b><br>Radius: ${newRadius} m<br>
    <button onclick="editBuffer(${id})">Edit Radius</button><br>
    <button onclick="deleteBuffer(${id})">Hapus</button>
  `);
}

function deleteBuffer(id) {
  bufferLayer.removeLayer(bufferLayer.getLayer(id));
}

function deleteMarker(id) {
  markerLayer.removeLayer(markerLayer.getLayer(id));
}

function hapusGaris() {
  measureLayer.clearLayers();
  tempLine = null;
  pointA = null;
}

function locateUser() {
  if (!navigator.geolocation) return alert("Browser tidak mendukung geolokasi.");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    L.marker([latitude, longitude]).addTo(map)
      .bindPopup("📍 Lokasi Anda").openPopup();
    map.setView([latitude, longitude], 16);
  });
}
