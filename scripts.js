
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
