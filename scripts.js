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

const updateStatistics = () => {
    elements.placesVisited.textContent = markers.length;
    
    let totalDistance = 0;
    let countries = new Set();
    
    for (let i = 1; i < markers.length; i++) {
        const from = L.latLng(markers[i-1].lat, markers[i-1].lng);
        const to = L.latLng(markers[i].lat, markers[i].lng);
        totalDistance += from.distanceTo(to);
        countries.add(markers[i].country);
    }
    
    elements.totalDistance.textContent = `${(totalDistance / 1000).toFixed(2)} km`;
    elements.countriesVisited.textContent = countries.size;
};

const renderEntries = () => {
    elements.entriesContainer.innerHTML = '';
    entries.forEach((entry, index) => {
        const entryElement = createEntryElement(entry, index);
        elements.entriesContainer.appendChild(entryElement);
    });
};

const renderMarkers = () => {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    journeyLine.setLatLngs([]);
    
    markers.forEach((marker, index) => {
        addMarkerToMap(marker, index);
    });

    updateMarkersList();
};

const updateMarkersList = () => {
    elements.markersListContainer.innerHTML = '';
    markers.forEach((marker, index) => {
        const markerItem = document.createElement('div');
        markerItem.className = 'marker-item';
        markerItem.innerHTML = `
            <div class="marker-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="marker-content">
                <h4>${marker.popupText}</h4>
                <p><i class="fas fa-map-marker-alt"></i> Lat: ${marker.lat.toFixed(6)}, Lng: ${marker.lng.toFixed(6)}</p>
                <p><i class="far fa-calendar-alt"></i> ${new Date(marker.date).toLocaleDateString()}</p>
                <p><i class="fas fa-globe-americas"></i> ${marker.country}</p>
            </div>
            <button class="delete-marker" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        elements.markersListContainer.appendChild(markerItem);
    });
};

elements.fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        elements.fileName.textContent = this.files[0].name;
        elements.removeFileBtn.style.display = 'inline-block';
        elements.fileLabel.innerHTML = '<i class="fas fa-edit"></i> Change Photo';
    }
});

elements.removeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    elements.fileInput.value = '';
    elements.fileName.textContent = '';
    elements.removeFileBtn.style.display = 'none';
    elements.fileLabel.innerHTML = '<i class="fas fa-camera"></i> Add Photos';
});

elements.addEntryBtn.addEventListener('click', () => {
    const title = elements.journeyTitle.value;
    const text = elements.journeyText.value;
    const photo = elements.fileInput.files[0];

    if (title && text) {
        if (photo) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addEntry(title, text, e.target.result);
            };
            reader.readAsDataURL(photo);
        } else {
            addEntry(title, text, '');
        }
    } else {
        alert('Please fill in both title and text fields.');
    }
});

const addEntry = (title, text, photo) => {
    const entry = { title, text, photo };
    entries.unshift(entry); 
    if (entries.length > 50) { 
        entries.pop(); 
    }
    saveData();
    renderEntries();
    clearForm();
};

map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const popupText = prompt('Enter a name for this location:') || 'New Marker';
    const country = prompt('Enter the country:') || 'Unknown';
    const marker = { 
        lat, 
        lng, 
        popupText,
        country,
        date: new Date().toISOString()
    };
    markers.push(marker);
    renderMarkers();
    saveData();
    getWeather(lat, lng);
    updateStatistics();
});

elements.addJourneyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
});

elements.journeyText.addEventListener('input', function() {
    const remaining = MAX_CHARS - this.value.length;
    elements.charCount.textContent = `${this.value.length} / ${MAX_CHARS}`;
    elements.charCount.style.color = remaining < 0 ? 'red' : 'inherit';
});

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});
