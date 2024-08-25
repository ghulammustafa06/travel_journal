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

const createEntryElement = (entry, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.innerHTML = `
        <div class="entry-image" style="background-image: url('${entry.photo}')"></div>
        <div class="entry-content">
            <h3>${entry.title}</h3>
            <p>${entry.text}</p>
            <button class="delete-entry" data-index="${index}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;
    
    const deleteButton = entryDiv.querySelector('.delete-entry');
    deleteButton.addEventListener('click', () => {
        entries.splice(index, 1);
        saveData();
        renderEntries();
    });
    
    return entryDiv;
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