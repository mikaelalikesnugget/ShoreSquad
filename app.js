// Initialize Leaflet Map
let map;
let beachMarkers = {};

function initMap() {
    // Create map instance centered on Singapore
    map = L.map('leaflet-map', {
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        zoomControl: true,
        center: [1.3521, 103.8198],
        zoom: 11
    }).setView([1.3521, 103.8198], 11);

    // Add multiple tile layer options - using better quality tiles
    L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 9,
        className: 'map-tiles'
    }).addTo(map);

    // Alternative layer - Satellite view
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18,
        minZoom: 9
    });

    // Beach data with coordinates
    const beaches = [
        {
            id: 'east-coast',
            name: 'East Coast Park Beach',
            lat: 1.3024,
            lng: 103.9054,
            color: '#0066cc',
            volunteers: 24,
            rating: 4.8,
            description: 'Popular urban beach with easy access and facilities'
        },
        {
            id: 'sentosa',
            name: 'Sentosa Beach',
            lat: 1.2489,
            lng: 103.8305,
            color: '#003d7a',
            volunteers: 18,
            rating: 4.6,
            description: 'Beautiful resort beach with pristine sand'
        },
        {
            id: 'changi',
            name: 'Changi Beach',
            lat: 1.3852,
            lng: 103.9981,
            color: '#0080ff',
            volunteers: 32,
            rating: 4.9,
            description: 'Scenic beach with rich biodiversity'
        }
    ];

    // Add markers to map with custom icons
    beaches.forEach(beach => {
        // Create custom HTML icon
        const markerHTML = `
            <div class="custom-marker" style="background-color: ${beach.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                🏖️
            </div>
        `;

        const customIcon = L.divIcon({
            html: markerHTML,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        const marker = L.marker([beach.lat, beach.lng], {
            icon: customIcon
        }).addTo(map);

        // Create detailed popup
        const popupContent = `
            <div class="map-popup" style="width: 280px;">
                <div style="margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; color: #001f3f; font-size: 1.1rem; font-weight: 600;">
                        ${beach.name}
                    </h4>
                    <p style="margin: 0 0 6px 0; font-size: 0.9rem; color: #546e7a;">
                        📍 ${beach.description}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 0.9rem; color: #546e7a;">
                        ⭐ ${beach.rating}/5 • 👥 ${beach.volunteers} volunteers
                    </p>
                </div>
                <button class="popup-btn" onclick="scrollToBeach('${beach.id}')" style="background: linear-gradient(135deg, #0066cc, #0080ff); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; width: 100%; transition: background 0.3s;">
                    View Details
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'beach-popup'
        });

        beachMarkers[beach.id] = marker;

        // Add click event to marker
        marker.on('click', function() {
            highlightBeachItem(beach.id);
            setTimeout(() => {
                marker.openPopup();
            }, 100);
        });

        // Add hover effect
        marker.on('mouseover', function() {
            this.setOpacity(1);
        });

        marker.on('mouseout', function() {
            this.setOpacity(0.8);
        });
    });

    // Fit all markers in view
    const group = new L.featureGroup(Object.values(beachMarkers));
    map.fitBounds(group.getBounds().pad(0.15));

    // Add map controls
    addMapControls();

    // Add layer control
    const baseMaps = {
        'Map': L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 9
        }),
        'Satellite': satelliteLayer
    };

    L.control.layers(baseMaps).addTo(map);
}

// Add map controls and info
function addMapControls() {
    // Info control
    const infoDiv = L.control({ position: 'topright' });
    
    infoDiv.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-info-control');
        div.innerHTML = `
            <div style="background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,31,63,0.2); border-left: 4px solid #0066cc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <p style="margin: 0; font-size: 0.85rem; color: #001f3f; font-weight: 600; line-height: 1.4;">
                    🖱️ Drag to move<br>
                    🔍 Scroll to zoom<br>
                    ◼ Double-click to zoom in
                </p>
            </div>
        `;
        return div;
    };
    
    infoDiv.addTo(map);

    // Scale control
    L.control.scale().addTo(map);
}

// Highlight beach item in sidebar when marker is clicked
function highlightBeachItem(beachId) {
    document.querySelectorAll('.beach-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-id="${beachId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Scroll to beach item and pan map
function scrollToBeach(beachId) {
    const beachItem = document.querySelector(`[data-id="${beachId}"]`);
    if (beachItem) {
        beachItem.click();
    }
}

// Beach item click functionality with map panning
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.beach-item').forEach(item => {
        item.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const beachId = this.getAttribute('data-id');

            // Remove active class from all items
            document.querySelectorAll('.beach-item').forEach(el => {
                el.classList.remove('active');
            });

            // Add active class to clicked item
            this.classList.add('active');

            // Pan and zoom map to beach location
            if (map) {
                map.flyTo([lat, lng], 14, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });

                // Open marker popup after animation
                setTimeout(() => {
                    if (beachMarkers[beachId]) {
                        beachMarkers[beachId].openPopup();
                    }
                }, 500);
            }
        });
    });

    // CTA Button
    const ctaButton = document.querySelector('.hero .cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const mapSection = document.getElementById('map');
            mapSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize map when page loads
window.addEventListener('load', function() {
    // Wait a bit for the DOM to fully render
    setTimeout(() => {
        if (document.getElementById('leaflet-map')) {
            initMap();
        }
    }, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
    if (map) {
        map.invalidateSize();
    }
});

// Button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const joinButtons = document.querySelectorAll('.join-button');

    joinButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const eventCard = this.closest('.event-card');
            const eventTitle = eventCard.querySelector('h3').textContent;
            console.log('Joined event: ' + eventTitle);
            alert('Thanks for joining ' + eventTitle + '! 🎉');
        });
    });

    const secondaryBtn = document.querySelector('.secondary-button');
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('impact').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

console.log('✅ ShoreSquad app initialized with interactive Google Maps style!');