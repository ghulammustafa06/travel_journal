const fileInput = document.getElementById('journey-photo');
const fileLabel = document.getElementById('file-label');
const fileName = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file');
const addEntryBtn = document.getElementById('add-entry');
const entriesContainer = document.getElementById('entries');
const addMarkerBtn = document.getElementById('add-marker');
const addJourneyBtn = document.getElementById('add-journey-btn');

let entries = JSON.parse(localStorage.getItem('entries')) || [];
let markers = JSON.parse(localStorage.getItem('markers')) || [];

const map = L.map('map-container').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function saveData() {
    localStorage.setItem('entries', JSON.stringify(entries));
    localStorage.setItem('markers', JSON.stringify(markers));
}

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