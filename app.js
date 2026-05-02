const STORAGE_KEY = "tokaido-walk-log-v1";

const stations = [
  { name: "日本橋", lat: 35.6841, lng: 139.7745 },
  { name: "品川宿", lat: 35.6197, lng: 139.7393 },
  { name: "川崎宿", lat: 35.5314, lng: 139.7031 },
  { name: "神奈川宿", lat: 35.4715, lng: 139.6264 },
  { name: "保土ヶ谷宿", lat: 35.4462, lng: 139.5967 },
  { name: "戸塚宿", lat: 35.4006, lng: 139.5344 },
  { name: "藤沢宿", lat: 35.3392, lng: 139.4888 },
  { name: "平塚宿", lat: 35.3273, lng: 139.3497 },
  { name: "大磯宿", lat: 35.3106, lng: 139.3132 },
  { name: "小田原宿", lat: 35.2556, lng: 139.1597 },
  { name: "箱根宿", lat: 35.1904, lng: 139.0265 },
  { name: "三島宿", lat: 35.1185, lng: 138.9188 },
  { name: "沼津宿", lat: 35.0956, lng: 138.8634 },
  { name: "原宿", lat: 35.1248, lng: 138.7933 },
  { name: "吉原宿", lat: 35.1616, lng: 138.6882 },
  { name: "蒲原宿", lat: 35.1207, lng: 138.6061 },
  { name: "由比宿", lat: 35.0975, lng: 138.5529 },
  { name: "興津宿", lat: 35.0528, lng: 138.5215 },
  { name: "江尻宿", lat: 35.0232, lng: 138.4895 },
  { name: "府中宿", lat: 34.9756, lng: 138.3831 },
  { name: "丸子宿", lat: 34.9422, lng: 138.3383 },
  { name: "岡部宿", lat: 34.9144, lng: 138.2842 },
  { name: "藤枝宿", lat: 34.8669, lng: 138.2576 },
  { name: "島田宿", lat: 34.8364, lng: 138.1768 },
  { name: "金谷宿", lat: 34.8206, lng: 138.1277 },
  { name: "日坂宿", lat: 34.8015, lng: 138.0669 },
  { name: "掛川宿", lat: 34.7687, lng: 138.0149 },
  { name: "袋井宿", lat: 34.7502, lng: 137.9251 },
  { name: "見附宿", lat: 34.7178, lng: 137.8517 },
  { name: "浜松宿", lat: 34.7108, lng: 137.7261 },
  { name: "舞阪宿", lat: 34.6855, lng: 137.6129 },
  { name: "新居宿", lat: 34.6921, lng: 137.5604 },
  { name: "白須賀宿", lat: 34.6911, lng: 137.4983 },
  { name: "二川宿", lat: 34.7252, lng: 137.4384 },
  { name: "吉田宿", lat: 34.763, lng: 137.3846 },
  { name: "御油宿", lat: 34.8361, lng: 137.3167 },
  { name: "赤坂宿", lat: 34.8559, lng: 137.3096 },
  { name: "藤川宿", lat: 34.9143, lng: 137.2257 },
  { name: "岡崎宿", lat: 34.9569, lng: 137.1628 },
  { name: "池鯉鮒宿", lat: 35.0013, lng: 137.0396 },
  { name: "鳴海宿", lat: 35.0802, lng: 136.9517 },
  { name: "宮宿", lat: 35.1248, lng: 136.9104 },
  { name: "桑名宿", lat: 35.0621, lng: 136.6831 },
  { name: "四日市宿", lat: 34.965, lng: 136.6244 },
  { name: "石薬師宿", lat: 34.9158, lng: 136.5535 },
  { name: "庄野宿", lat: 34.8948, lng: 136.5026 },
  { name: "亀山宿", lat: 34.8558, lng: 136.4516 },
  { name: "関宿", lat: 34.8508, lng: 136.3916 },
  { name: "坂下宿", lat: 34.8919, lng: 136.3399 },
  { name: "土山宿", lat: 34.9366, lng: 136.2838 },
  { name: "水口宿", lat: 34.9661, lng: 136.1674 },
  { name: "石部宿", lat: 35.0108, lng: 136.0525 },
  { name: "草津宿", lat: 35.0182, lng: 135.9602 },
  { name: "大津宿", lat: 35.0046, lng: 135.8687 },
  { name: "三条大橋", lat: 35.0107, lng: 135.7746 },
];

let watchId = null;
let currentMarker = null;
let trackLine = null;
let trackPoints = [];
let manualWalks = [];
let manualLines = [];
let nearestStationIndex = -1;

const map = L.map("map", { zoomControl: false }).setView([35.1, 137.7], 8);
L.control.zoom({ position: "bottomleft" }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const routeLatLngs = stations.map((station) => [station.lat, station.lng]);
const fallbackRouteLine = L.polyline(routeLatLngs, {
  color: "#0f766e",
  weight: 5,
  opacity: 0.38,
  dashArray: "8 8",
}).addTo(map);
let routeLayer = fallbackRouteLine;

stations.forEach((station, index) => {
  const label = index === 0 ? "起点" : index === stations.length - 1 ? "終点" : `${index}次`;
  L.circleMarker([station.lat, station.lng], {
    radius: index === 0 || index === stations.length - 1 ? 7 : 5,
    color: "#0f766e",
    fillColor: "#fffdf8",
    fillOpacity: 1,
    weight: 2,
  })
    .bindPopup(`<strong>${station.name}</strong><br>${label}`)
    .addTo(map);
});

const elements = {
  accuracy: document.querySelector("#accuracy"),
  addManualButton: document.querySelector("#addManualButton"),
  clearButton: document.querySelector("#clearButton"),
  exportGpxButton: document.querySelector("#exportGpxButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  fitRouteButton: document.querySelector("#fitRouteButton"),
  locateButton: document.querySelector("#locateButton"),
  manualCount: document.querySelector("#manualCount"),
  manualDate: document.querySelector("#manualDate"),
  manualDistance: document.querySelector("#manualDistance"),
  manualDistanceInput: document.querySelector("#manualDistanceInput"),
  manualFrom: document.querySelector("#manualFrom"),
  manualNote: document.querySelector("#manualNote"),
  manualTo: document.querySelector("#manualTo"),
  manualWalks: document.querySelector("#manualWalks"),
  memo: document.querySelector("#walkMemo"),
  nearestStage: document.querySelector("#nearestStage"),
  pointCount: document.querySelector("#pointCount"),
  routeSource: document.querySelector("#routeSource"),
  saveMemoButton: document.querySelector("#saveMemoButton"),
  startButton: document.querySelector("#startButton"),
  stations: document.querySelector("#stations"),
  stopButton: document.querySelector("#stopButton"),
  trackDistance: document.querySelector("#trackDistance"),
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    trackPoints = Array.isArray(state.trackPoints) ? state.trackPoints : [];
    manualWalks = Array.isArray(state.manualWalks) ? state.manualWalks : [];
    elements.memo.value = state.memo || "";
  } catch {
    trackPoints = [];
    manualWalks = [];
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      memo: elements.memo.value,
      manualWalks,
      trackPoints,
      updatedAt: new Date().toISOString(),
    }),
  );
}

async function loadDetailedRoute() {
  try {
    const response = await fetch("./data/tokaido-osm.geojson");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson = await response.json();
    fallbackRouteLine.remove();
    routeLayer = L.geoJSON(geojson, {
      style: {
        color: "#0f766e",
        weight: 4,
        opacity: 0.78,
      },
    }).addTo(map);
    map.attributionControl.addAttribution(
      '<a href="https://www.openstreetmap.org/relation/5185746">旧東海道 route data © OpenStreetMap contributors</a>',
    );
    elements.routeSource.textContent = "ルート: OpenStreetMapの旧東海道データを表示中";
    map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
  } catch (error) {
    elements.routeSource.textContent = "ルート: 詳細データを読めないため、宿場間の概略線を表示中";
    map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
  }
}

function setupManualForm() {
  elements.manualDate.value = dateStamp();

  stations.forEach((station, index) => {
    const label = index === 0 || index === stations.length - 1 ? station.name : `${index}. ${station.name}`;
    const fromOption = new Option(label, String(index));
    const toOption = new Option(label, String(index));
    elements.manualFrom.appendChild(fromOption);
    elements.manualTo.appendChild(toOption);
  });

  elements.manualTo.value = "1";
}

function renderStations() {
  elements.stations.innerHTML = "";
  stations.forEach((station, index) => {
    const item = document.createElement("li");
    item.textContent = index === 0 || index === stations.length - 1 ? station.name : `${index}. ${station.name}`;
    if (index === nearestStationIndex) item.classList.add("active");
    elements.stations.appendChild(item);
  });
}

function renderTrack() {
  if (trackLine) {
    trackLine.remove();
  }

  if (trackPoints.length > 0) {
    trackLine = L.polyline(
      trackPoints.map((point) => [point.lat, point.lng]),
      { color: "#d9480f", weight: 5, opacity: 0.9 },
    ).addTo(map);
  }

  const distanceKm = calculateTrackDistance() / 1000;
  elements.trackDistance.textContent = `${distanceKm.toFixed(2)} km`;
  elements.pointCount.textContent = String(trackPoints.length);
}

function renderManualWalks() {
  manualLines.forEach((line) => line.remove());
  manualLines = [];

  const totalKm = manualWalks.reduce((sum, walk) => sum + (Number(walk.distanceKm) || 0), 0);
  elements.manualDistance.textContent = `${totalKm.toFixed(2)} km`;
  elements.manualCount.textContent = String(manualWalks.length);
  elements.manualWalks.innerHTML = "";

  const coveredSegments = new Set();
  manualWalks.forEach((walk) => {
    const start = Math.min(walk.fromIndex, walk.toIndex);
    const end = Math.max(walk.fromIndex, walk.toIndex);
    for (let index = start; index < end; index += 1) {
      coveredSegments.add(index);
    }
  });

  coveredSegments.forEach((index) => {
    const line = L.polyline(
      [
        [stations[index].lat, stations[index].lng],
        [stations[index + 1].lat, stations[index + 1].lng],
      ],
      { color: "#1d4ed8", weight: 8, opacity: 0.6 },
    ).addTo(map);
    manualLines.push(line);
  });

  if (manualWalks.length === 0) {
    const empty = document.createElement("li");
    empty.innerHTML = "<span>まだ追加記録はありません。</span>";
    elements.manualWalks.appendChild(empty);
    return;
  }

  [...manualWalks]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((walk) => {
      const item = document.createElement("li");
      const estimated = walk.distanceSource === "estimated" ? " 概算" : "";
      const distance = walk.distanceKm ? ` / ${Number(walk.distanceKm).toFixed(1)} km${estimated}` : "";
      const note = walk.note ? `<span>${escapeHtml(walk.note)}</span>` : "";
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(walk.date)} ${escapeHtml(stations[walk.fromIndex].name)} → ${escapeHtml(stations[walk.toIndex].name)}${distance}</strong>
          ${note}
        </div>
      `;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "削除";
      deleteButton.addEventListener("click", () => deleteManualWalk(walk.id));
      item.appendChild(deleteButton);
      elements.manualWalks.appendChild(item);
    });
}

function updatePosition(position) {
  const point = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: new Date(position.timestamp).toISOString(),
  };

  const previous = trackPoints.at(-1);
  if (!previous || haversine(previous, point) > 4) {
    trackPoints.push(point);
  }

  elements.accuracy.textContent = `${Math.round(point.accuracy)} m`;

  if (!currentMarker) {
    currentMarker = L.circleMarker([point.lat, point.lng], {
      radius: 8,
      color: "#1d4ed8",
      fillColor: "#1d4ed8",
      fillOpacity: 0.7,
      weight: 3,
    }).addTo(map);
  } else {
    currentMarker.setLatLng([point.lat, point.lng]);
  }

  map.panTo([point.lat, point.lng], { animate: true });
  updateNearestStage(point);
  renderTrack();
  saveState();
}

function updateNearestStage(point) {
  let closestIndex = 0;
  let closestDistance = Infinity;

  stations.forEach((station, index) => {
    const distance = haversine(point, station);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  nearestStationIndex = closestIndex;
  const from = stations[closestIndex];
  const to = stations[Math.min(closestIndex + 1, stations.length - 1)];
  elements.nearestStage.textContent = from === to ? from.name : `${from.name} → ${to.name}`;
  renderStations();
}

function addManualWalk() {
  const fromIndex = Number(elements.manualFrom.value);
  const toIndex = Number(elements.manualTo.value);
  const inputDistanceKm = Number(elements.manualDistanceInput.value);
  const hasInputDistance = elements.manualDistanceInput.value !== "";
  const distanceKm =
    hasInputDistance && Number.isFinite(inputDistanceKm) && inputDistanceKm > 0
      ? inputDistanceKm
      : calculateStationDistance(fromIndex, toIndex) / 1000;

  if (!elements.manualDate.value) {
    alert("日付を入れてください。");
    return;
  }

  if (fromIndex === toIndex) {
    alert("出発と到着は別の宿場を選んでください。");
    return;
  }

  manualWalks.push({
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: elements.manualDate.value,
    fromIndex,
    toIndex,
    distanceKm,
    distanceSource: hasInputDistance ? "manual" : "estimated",
    note: elements.manualNote.value.trim(),
    createdAt: new Date().toISOString(),
  });

  elements.manualDistanceInput.value = "";
  elements.manualNote.value = "";
  elements.manualFrom.value = String(toIndex);
  elements.manualTo.value = String(Math.min(toIndex + 1, stations.length - 1));
  saveState();
  renderManualWalks();
}

function calculateStationDistance(fromIndex, toIndex) {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  let distance = 0;
  for (let index = start; index < end; index += 1) {
    distance += haversine(stations[index], stations[index + 1]);
  }
  return distance;
}

function deleteManualWalk(id) {
  if (!confirm("この追加記録を削除しますか？")) return;
  manualWalks = manualWalks.filter((walk) => walk.id !== id);
  saveState();
  renderManualWalks();
}

function calculateTrackDistance() {
  return trackPoints.reduce((sum, point, index) => {
    if (index === 0) return 0;
    return sum + haversine(trackPoints[index - 1], point);
  }, 0);
}

function haversine(a, b) {
  const radius = 6371000;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("このブラウザではGPS記録が使えません。");
    return;
  }

  watchId = navigator.geolocation.watchPosition(updatePosition, showLocationError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000,
  });

  elements.startButton.disabled = true;
  elements.stopButton.disabled = false;
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  elements.startButton.disabled = false;
  elements.stopButton.disabled = true;
}

function showLocationError(error) {
  alert(`現在地を取得できませんでした: ${error.message}`);
  stopTracking();
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  saveState();
  download(
    `tokaido-walk-${dateStamp()}.json`,
    JSON.stringify({ stations, trackPoints, manualWalks, memo: elements.memo.value }, null, 2),
    "application/json",
  );
}

function exportGpx() {
  const points = trackPoints
    .map(
      (point) =>
        `      <trkpt lat="${point.lat}" lon="${point.lng}"><time>${point.timestamp}</time></trkpt>`,
    )
    .join("\n");

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Tokaido Walk Log" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>東海道五十三次 歩行記録 ${dateStamp()}</name>
  </metadata>
  <trk>
    <name>東海道五十三次 歩行記録</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
  download(`tokaido-walk-${dateStamp()}.gpx`, gpx, "application/gpx+xml");
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

elements.fitRouteButton.addEventListener("click", () => {
  map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
});

elements.locateButton.addEventListener("click", () => {
  navigator.geolocation?.getCurrentPosition(updatePosition, showLocationError, {
    enableHighAccuracy: true,
  });
});

elements.startButton.addEventListener("click", startTracking);
elements.stopButton.addEventListener("click", stopTracking);
elements.clearButton.addEventListener("click", () => {
  if (!confirm("GPS記録をクリアしますか？")) return;
  trackPoints = [];
  saveState();
  renderTrack();
});
elements.addManualButton.addEventListener("click", addManualWalk);
elements.exportGpxButton.addEventListener("click", exportGpx);
elements.exportJsonButton.addEventListener("click", exportJson);
elements.saveMemoButton.addEventListener("click", saveState);

setupManualForm();
loadState();
renderStations();
renderTrack();
renderManualWalks();
loadDetailedRoute();
