const elements = {
    fileInput: document.getElementById('journey-photo'),
    fileLabel: document.getElementById('file-label'),
    fileName: document.getElementById('file-name'),
    removeFileBtn: document.getElementById('remove-file'),
    addEntryBtn: document.getElementById('add-entry'),
    entriesContainer: document.getElementById('entries'),
    addJourneyBtn: document.getElementById('add-journey-btn'),
    weatherWidget: document.getElementById('weather-widget'),
    journeyText: document.getElementById('journey-text'),
    charCount: document.getElementById('char-count'),
    journeyTitle: document.getElementById('journey-title'),
    placesVisited: document.getElementById('places-visited'),
    totalDistance: document.getElementById('total-distance'),
    countriesVisited: document.getElementById('countries-visited'),
    currentLocationBtn: document.getElementById('current-location'),
    markersListContainer: document.getElementById('markers-list')
};

const MAX_CHARS = 500;
const API_KEY = 'e3868b75c7c75932337e372db17ade6c';
const DEFAULT_COORDS = { lat: 51.505, lng: -0.09 };

let entries = JSON.parse(localStorage.getItem('entries')) || [];
let markers = JSON.parse(localStorage.getItem('markers')) || [];

const map = L.map('map-container').setView([DEFAULT_COORDS.lat, DEFAULT_COORDS.lng], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

let journeyLine = L.polyline([], {
    color: '#FF6B6B',
    weight: 3,
    opacity: 0.8,
    smoothFactor: 1,
    dashArray: '10, 10',
    dashOffset: '0'
}).addTo(map);

const saveData = () => {
    try {
        localStorage.setItem('entries', JSON.stringify(entries));
        localStorage.setItem('markers', JSON.stringify(markers));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Some data may not be saved.');
        }
    }
};

const addMarkerToMap = (marker, index) => {
    const markerInstance = L.marker([marker.lat, marker.lng], {icon: customIcon}).addTo(map);
    const popupContent = `
        <div class="custom-popup">
            <h3>${marker.popupText}</h3>
            <p><i class="fas fa-map-marker-alt"></i> Lat: ${marker.lat.toFixed(6)}, Lng: ${marker.lng.toFixed(6)}</p>
            <p><i class="fas fa-globe-americas"></i> ${marker.country}</p>
            <p><i class="far fa-calendar-alt"></i> ${new Date(marker.date).toLocaleDateString()}</p>
            <button class="delete-marker" data-index="${index}">Delete Marker</button>
        </div>
    `;
    markerInstance.bindPopup(popupContent);

    journeyLine.addLatLng([marker.lat, marker.lng]);
    map.fitBounds(journeyLine.getBounds());
};


const clearForm = () => {
    elements.journeyTitle.value = '';
    elements.journeyText.value = '';
    elements.fileInput.value = '';
    elements.fileName.textContent = '';
    elements.removeFileBtn.style.display = 'none';
    elements.fileLabel.innerHTML = '<i class="fas fa-camera"></i> Add Photos';
};

const getWeather = (lat, lng) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            elements.weatherWidget.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
                <div>
                    <h3>${data.name}</h3>
                    <p>${data.weather[0].description}</p>
                    <p>Temperature: ${Math.round(data.main.temp)}°C</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            elements.weatherWidget.innerHTML = '<p>Weather data unavailable</p>';
        });
};

function createEntryElement(entry) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.innerHTML = `
        <img src="${entry.photo}" alt="${entry.title}">
        <h3>${entry.title}</h3>
        <p>${entry.text}</p>
    `;
    return entryDiv;
}

function addMarkerToMap(marker) {
    L.marker([marker.lat, marker.lng]).addTo(map)
        .bindPopup(marker.popupText)
        .openPopup();
}

function clearForm() {
    document.getElementById('journey-title').value = '';
    document.getElementById('journey-text').value = '';
    fileInput.value = '';
    fileName.textContent = '';
    removeFileBtn.style.display = 'none';
    fileLabel.innerHTML = '<i class="fas fa-camera"></i> Add Photos';
}

fileInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        fileName.textContent = this.files[0].name;
        removeFileBtn.style.display = 'inline-block';
        fileLabel.innerHTML = '<i class="fas fa-edit"></i> Change Photo';
    }
});

removeFileBtn.addEventListener('click', function(e) {
    e.preventDefault();
    fileInput.value = '';
    fileName.textContent = '';
    this.style.display = 'none';
    fileLabel.innerHTML = '<i class="fas fa-camera"></i> Add Photos';
});

addEntryBtn.addEventListener('click', function() {
    const title = document.getElementById('journey-title').value;
    const text = document.getElementById('journey-text').value;
    const photo = fileInput.files[0];

    if (title && text && photo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const entry = { title, text, photo: e.target.result };
            entries.push(entry);
            saveData();
            entriesContainer.appendChild(createEntryElement(entry));
            clearForm();
        };
        reader.readAsDataURL(photo);
    }
});

addMarkerBtn.addEventListener('click', function() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        const marker = { lat, lng, popupText: 'New Marker' };
        markers.push(marker);
        addMarkerToMap(marker);
        saveData();
    }
});

addJourneyBtn.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
});

entries.forEach(entry => entriesContainer.appendChild(createEntryElement(entry)));
markers.forEach(addMarkerToMap);

document.getElementById('current-location').addEventListener('click', function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('lat').value = lat;
            document.getElementById('lng').value = lng;
            map.setView([lat, lng], 13);
        });
    } else {
        alert("Geolocation is not available in your browser.");
    }
});