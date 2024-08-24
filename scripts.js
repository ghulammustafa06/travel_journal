document.getElementById('add-entry').addEventListener('click', function() {
    const title = document.getElementById('journey-title').value;
    const text = document.getElementById('journey-text').value;
    const photo = document.getElementById('journey-photo').files[0];

    if (title && text && photo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const entry = document.createElement('div');
            entry.className = 'entry';

            entry.innerHTML = `
                <img src="${e.target.result}" alt="${title}">
                <h3>${title}</h3>
                <p>${text}</p>
            `;

            document.getElementById('entries').appendChild(entry);
        };
        reader.readAsDataURL(photo);
    }
});

const map = L.map('map-container').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();


let entries = JSON.parse(localStorage.getItem('entries')) || [];
let markers = JSON.parse(localStorage.getItem('markers')) || [];

function saveData() {
    localStorage.setItem('entries', JSON.stringify(entries));
    localStorage.setItem('markers', JSON.stringify(markers));
}

entries.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.innerHTML = `
        <img src="${entry.photo}" alt="${entry.title}">
        <h3>${entry.title}</h3>
        <p>${entry.text}</p>
    `;
    document.getElementById('entries').appendChild(entryDiv);
});

markers.forEach(marker => {
    L.marker([marker.lat, marker.lng]).addTo(map)
        .bindPopup(marker.popupText)
        .openPopup();
});

document.getElementById('add-entry').addEventListener('click', function() {
    const title = document.getElementById('journey-title').value;
    const text = document.getElementById('journey-text').value;
    const photo = document.getElementById('journey-photo').files[0];

    if (title && text && photo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const entry = {
                title: title,
                text: text,
                photo: e.target.result
            };
            entries.push(entry);
            saveData();

            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';
            entryDiv.innerHTML = `
                <img src="${e.target.result}" alt="${title}">
                <h3>${title}</h3>
                <p>${text}</p>
            `;
            document.getElementById('entries').appendChild(entryDiv);
        };
        reader.readAsDataURL(photo);
    }
});

document.getElementById('add-marker').addEventListener('click', function() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup('New Marker').openPopup();

        markers.push({ lat: lat, lng: lng, popupText: 'New Marker' });
        saveData();
    }
});
