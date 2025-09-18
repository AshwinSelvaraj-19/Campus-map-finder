// Chanakya University Campus Map Application
// Interactive mapping with Leaflet, pathfinding, and route visualization

class CampusMap {
    constructor() {
        this.map = null;
        this.overlay = null;
        this.markers = {};
        this.currentRoute = null;
        this.graph = null;
        this.isAdminMode = false;
        this.searchIndex = [];
        
        // Default bounds for overlay (approximate Bangalore coordinates)
        this.defaultBounds = {
            nw: [13.1980, 77.7050],
            se: [13.1950, 77.7080]
        };
        
        this.init();
    }
    
    async init() {
        this.showLoading();
        try {
            await this.loadGraphData();
            this.initMap();
            this.initUI();
            this.buildSearchIndex();
            this.populateSelects();
            this.showToast('Campus map loaded successfully!', 'success');
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showToast('Error loading campus data', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
    
    async loadGraphData() {
        try {
            const response = await fetch('./data/distances.json');
            this.graph = await response.json();
        } catch (error) {
            console.error('Error loading graph data:', error);
            // Fallback to embedded data if file doesn't exist
            this.graph = this.getDefaultGraphData();
        }
    }
    
    getDefaultGraphData() {
        return {
            "nodes": [
                {"id":"main_gate","name":"Main Gate","lat":13.1950,"lng":77.7060},
                {"id":"entrance_junction","name":"Entrance Junction","lat":13.1955,"lng":77.7065},
                {"id":"admin_block1","name":"Admin Block 1","lat":13.1960,"lng":77.7070},
                {"id":"hostel1","name":"Hostel 1","lat":13.1965,"lng":77.7075},
                {"id":"academic_block1","name":"Academic Block 1","lat":13.1970,"lng":77.7070},
                {"id":"academic_block2","name":"Academic Block 2","lat":13.1970,"lng":77.7065},
                {"id":"library","name":"Library","lat":13.1970,"lng":77.7060},
                {"id":"cafeteria","name":"Cafeteria","lat":13.1965,"lng":77.7055},
                {"id":"sports_complex","name":"Sports Complex","lat":13.1975,"lng":77.7067},
                {"id":"auditorium","name":"Auditorium","lat":13.1962,"lng":77.7062},
                {"id":"parking_area","name":"Parking Area","lat":13.1952,"lng":77.7062},
                {"id":"north_junction","name":"North Junction","lat":13.1972,"lng":77.7067},
                {"id":"east_junction","name":"East Junction","lat":13.1967,"lng":77.7072},
                {"id":"south_junction","name":"South Junction","lat":13.1962,"lng":77.7067},
                {"id":"west_junction","name":"West Junction","lat":13.1967,"lng":77.7062},
                {"id":"center_junction","name":"Center Junction","lat":13.1967,"lng":77.7067}
            ],
            "edges": [
                {"a":"main_gate","b":"entrance_junction","dist":120},
                {"a":"entrance_junction","b":"parking_area","dist":80},
                {"a":"entrance_junction","b":"south_junction","dist":150},
                {"a":"south_junction","b":"west_junction","dist":180},
                {"a":"west_junction","b":"north_junction","dist":180},
                {"a":"north_junction","b":"east_junction","dist":180},
                {"a":"east_junction","b":"south_junction","dist":180},
                {"a":"south_junction","b":"center_junction","dist":90},
                {"a":"west_junction","b":"center_junction","dist":90},
                {"a":"north_junction","b":"center_junction","dist":90},
                {"a":"east_junction","b":"center_junction","dist":90},
                {"a":"south_junction","b":"admin_block1","dist":100},
                {"a":"south_junction","b":"auditorium","dist":80},
                {"a":"east_junction","b":"hostel1","dist":120},
                {"a":"east_junction","b":"academic_block1","dist":100},
                {"a":"north_junction","b":"academic_block1","dist":80},
                {"a":"north_junction","b":"academic_block2","dist":100},
                {"a":"north_junction","b":"sports_complex","dist":150},
                {"a":"west_junction","b":"library","dist":100},
                {"a":"west_junction","b":"cafeteria","dist":120},
                {"a":"admin_block1","b":"auditorium","dist":90},
                {"a":"hostel1","b":"academic_block1","dist":140},
                {"a":"academic_block1","b":"academic_block2","dist":80},
                {"a":"academic_block2","b":"library","dist":80},
                {"a":"library","b":"cafeteria","dist":120},
                {"a":"cafeteria","b":"parking_area","dist":160},
                {"a":"center_junction","b":"auditorium","dist":70},
                {"a":"sports_complex","b":"academic_block1","dist":120},
                {"a":"sports_complex","b":"academic_block2","dist":100}
            ],
            "metadata": {
                "source":"updated-circular-layout",
                "centerApprox":[13.1967,77.7067],
                "lastUpdated":"2025-01-27",
                "description":"Chanakya University campus with circular road design and central junction system",
                "layout":"circular_road_with_center_hub"
            }
        };
    }
    
    initMap() {
        // Initialize map centered on campus
        const center = this.graph.metadata?.centerApprox || [12.9507, 77.6682];
        this.map = L.map('map').setView(center, 17);
        
        // Add satellite/street tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 20
        }).addTo(this.map);
        
        // Try to add blueprint overlay
        this.initOverlay();
        
        // Add markers for each node
        this.addMarkers();
        
        // Map click handler for admin mode
        this.map.on('click', (e) => {
            if (this.isAdminMode) {
                this.handleMapClick(e);
            }
        });
    }
    
    initOverlay() {
        // Check if blueprint image exists and add overlay
        const overlayBounds = [
            [this.defaultBounds.nw[0], this.defaultBounds.nw[1]],
            [this.defaultBounds.se[0], this.defaultBounds.se[1]]
        ];
        
        // Try to load blueprint overlay
        this.overlay = L.imageOverlay('./assets/blueprint.jpg', overlayBounds, {
            opacity: 0.8,
            interactive: false,
            errorOverlayUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+'
        }).addTo(this.map);
        
        this.overlay.on('load', () => {
            this.showToast('Blueprint overlay loaded', 'success');
        });
        
        this.overlay.on('error', () => {
            console.warn('Blueprint image not found. Please add ./assets/blueprint.jpg');
        });
    }
    
    addMarkers() {
        this.graph.nodes.forEach(node => {
            const marker = L.marker([node.lat, node.lng], {
                draggable: false,
                title: node.name
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div class="popup-content">
                    <h3>${node.name}</h3>
                    <p>ID: ${node.id}</p>
                    <p>Coordinates: ${node.lat.toFixed(6)}, ${node.lng.toFixed(6)}</p>
                </div>
            `);
            
            // Enable dragging in admin mode
            marker.on('dragend', (e) => {
                if (this.isAdminMode) {
                    const pos = e.target.getLatLng();
                    node.lat = pos.lat;
                    node.lng = pos.lng;
                    this.showToast(`${node.name} position updated`, 'success');
                }
            });
            
            this.markers[node.id] = marker;
        });
    }
    
    buildSearchIndex() {
        this.searchIndex = this.graph.nodes.map(node => ({
            id: node.id,
            name: node.name,
            searchText: node.name.toLowerCase()
        }));
    }
    
    populateSelects() {
        const startSelect = document.getElementById('startSelect');
        const endSelect = document.getElementById('endSelect');
        
        // Clear existing options
        startSelect.innerHTML = '<option value="">Select starting point...</option>';
        endSelect.innerHTML = '<option value="">Select destination...</option>';
        
        // Add options for each node
        this.graph.nodes.forEach(node => {
            const startOption = new Option(node.name, node.id);
            const endOption = new Option(node.name, node.id);
            startSelect.add(startOption);
            endSelect.add(endOption);
        });
    }
    
    initUI() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value, searchResults);
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
        
        // Route finder controls
        document.getElementById('findRouteBtn').addEventListener('click', () => {
            this.findRoute();
        });
        
        document.getElementById('clearRouteBtn').addEventListener('click', () => {
            this.clearRoute();
        });
        
        // Admin mode toggle
        document.getElementById('adminToggle').addEventListener('click', () => {
            this.toggleAdminMode();
        });
        
        // Calibration modal
        document.getElementById('calibrateBtn').addEventListener('click', () => {
            this.showCalibrationModal();
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideCalibrationModal();
        });
        
        document.getElementById('applyCalibration').addEventListener('click', () => {
            this.applyCalibration();
        });
        
        document.getElementById('resetCalibration').addEventListener('click', () => {
            this.resetCalibration();
        });
        
        // Opacity slider
        document.getElementById('overlayOpacity').addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            document.getElementById('opacityValue').textContent = `${Math.round(opacity * 100)}%`;
            if (this.overlay) {
                this.overlay.setOpacity(opacity);
            }
        });
        
        // Import/Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportGraph();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importGraph(e.target.files[0]);
        });
    }
    
    handleSearch(query, resultsElement) {
        if (!query.trim()) {
            resultsElement.style.display = 'none';
            return;
        }
        
        const matches = this.searchIndex.filter(item =>
            item.searchText.includes(query.toLowerCase())
        ).slice(0, 5);
        
        if (matches.length === 0) {
            resultsElement.style.display = 'none';
            return;
        }
        
        resultsElement.innerHTML = matches.map(match => `
            <div class="search-result-item" data-id="${match.id}">
                ${match.name}
            </div>
        `).join('');
        
        // Add click handlers
        resultsElement.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const nodeId = item.dataset.id;
                this.goToLocation(nodeId);
                resultsElement.style.display = 'none';
                document.getElementById('searchInput').value = item.textContent;
            });
        });
        
        resultsElement.style.display = 'block';
    }
    
    goToLocation(nodeId) {
        const node = this.graph.nodes.find(n => n.id === nodeId);
        if (node && this.markers[nodeId]) {
            this.map.setView([node.lat, node.lng], 19);
            this.markers[nodeId].openPopup();
        }
    }
    
    findRoute() {
        const startId = document.getElementById('startSelect').value;
        const endId = document.getElementById('endSelect').value;
        
        if (!startId || !endId) {
            this.showToast('Please select both start and end locations', 'warning');
            return;
        }
        
        if (startId === endId) {
            this.showToast('Start and end locations cannot be the same', 'warning');
            return;
        }
        
        // Clear previous route
        this.clearRoute();
        
        // Find shortest path using Dijkstra's algorithm
        const path = this.dijkstra(startId, endId);
        
        if (!path) {
            this.showToast('No route found between selected locations', 'error');
            return;
        }
        
        this.displayRoute(path);
        this.showToast(`Route found! Distance: ${path.distance}m`, 'success');
    }
    
    dijkstra(startId, endId) {
        // Build adjacency list
        const graph = {};
        this.graph.nodes.forEach(node => {
            graph[node.id] = [];
        });
        
        this.graph.edges.forEach(edge => {
            graph[edge.a].push({ node: edge.b, distance: edge.dist });
            graph[edge.b].push({ node: edge.a, distance: edge.dist });
        });
        
        // Dijkstra's algorithm
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        
        // Initialize
        this.graph.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        distances[startId] = 0;
        
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    current = node;
                    minDistance = distances[node];
                }
            }
            
            if (current === null || distances[current] === Infinity) break;
            
            unvisited.delete(current);
            
            // Check neighbors
            if (graph[current]) {
                graph[current].forEach(neighbor => {
                    const alt = distances[current] + neighbor.distance;
                    if (alt < distances[neighbor.node]) {
                        distances[neighbor.node] = alt;
                        previous[neighbor.node] = current;
                    }
                });
            }
        }
        
        // Reconstruct path
        if (distances[endId] === Infinity) return null;
        
        const path = [];
        let current = endId;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        return {
            path: path,
            distance: Math.round(distances[endId]),
            steps: this.generateSteps(path)
        };
    }
    
    generateSteps(path) {
        const steps = [];
        for (let i = 0; i < path.length - 1; i++) {
            const from = this.graph.nodes.find(n => n.id === path[i]);
            const to = this.graph.nodes.find(n => n.id === path[i + 1]);
            const edge = this.graph.edges.find(e => 
                (e.a === from.id && e.b === to.id) || 
                (e.b === from.id && e.a === to.id)
            );
            
            steps.push({
                from: from.name,
                to: to.name,
                distance: edge ? edge.dist : 0,
                description: `Head towards ${to.name}`
            });
        }
        return steps;
    }
    
    displayRoute(routeData) {
        // Create route polyline
        const routeCoords = routeData.path.map(nodeId => {
            const node = this.graph.nodes.find(n => n.id === nodeId);
            return [node.lat, node.lng];
        });
        
        this.currentRoute = L.polyline(routeCoords, {
            color: '#2563eb',
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(this.map);
        
        // Add start and end markers
        const startNode = this.graph.nodes.find(n => n.id === routeData.path[0]);
        const endNode = this.graph.nodes.find(n => n.id === routeData.path[routeData.path.length - 1]);
        
        const startMarker = L.marker([startNode.lat, startNode.lng], {
            icon: this.createCustomIcon('🚩', '#059669')
        }).addTo(this.map);
        
        const endMarker = L.marker([endNode.lat, endNode.lng], {
            icon: this.createCustomIcon('🏁', '#dc2626')
        }).addTo(this.map);
        
        // Store markers for cleanup
        this.currentRoute.startMarker = startMarker;
        this.currentRoute.endMarker = endMarker;
        
        // Fit map to route
        this.map.fitBounds(this.currentRoute.getBounds(), { padding: [20, 20] });
        
        // Display route information
        this.displayRouteInfo(routeData);
    }
    
    displayRouteInfo(routeData) {
        const routeOutput = document.getElementById('routeOutput');
        
        const routeHtml = `
            <div class="route-info">
                <div class="route-summary">
                    <span>📍 ${this.graph.nodes.find(n => n.id === routeData.path[0]).name}</span>
                    <span class="route-distance">${routeData.distance}m</span>
                    <span>🎯 ${this.graph.nodes.find(n => n.id === routeData.path[routeData.path.length - 1]).name}</span>
                </div>
                <ul class="route-steps">
                    ${routeData.steps.map((step, index) => `
                        <li class="route-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-content">
                                <div class="step-description">${step.description}</div>
                                <div class="step-distance">${step.distance}m</div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        routeOutput.innerHTML = routeHtml;
    }
    
    createCustomIcon(emoji, color) {
        return L.divIcon({
            html: `<div style="background: ${color}; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            className: 'custom-marker'
        });
    }
    
    clearRoute() {
        if (this.currentRoute) {
            this.map.removeLayer(this.currentRoute);
            if (this.currentRoute.startMarker) this.map.removeLayer(this.currentRoute.startMarker);
            if (this.currentRoute.endMarker) this.map.removeLayer(this.currentRoute.endMarker);
            this.currentRoute = null;
        }
        
        // Clear route output
        document.getElementById('routeOutput').innerHTML = `
            <div class="output-placeholder">
                Select start and end locations to find the optimal route
            </div>
        `;
        
        // Reset selects
        document.getElementById('startSelect').value = '';
        document.getElementById('endSelect').value = '';
    }
    
    toggleAdminMode() {
        this.isAdminMode = !this.isAdminMode;
        const btn = document.getElementById('adminToggle');
        
        if (this.isAdminMode) {
            btn.textContent = '🔧 Exit Admin';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-secondary');
            document.body.classList.add('admin-mode');
            
            // Enable marker dragging
            Object.values(this.markers).forEach(marker => {
                marker.dragging.enable();
            });
            
            this.showToast('Admin mode enabled. You can now drag markers to adjust positions.', 'warning');
        } else {
            btn.textContent = '⚙️ Admin';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            document.body.classList.remove('admin-mode');
            
            // Disable marker dragging
            Object.values(this.markers).forEach(marker => {
                marker.dragging.disable();
            });
            
            this.showToast('Admin mode disabled', 'success');
        }
    }
    
    showCalibrationModal() {
        const modal = document.getElementById('calibrationModal');
        modal.classList.add('active');
        
        // Populate current bounds
        document.getElementById('nwLat').value = this.defaultBounds.nw[0];
        document.getElementById('nwLng').value = this.defaultBounds.nw[1];
        document.getElementById('seLat').value = this.defaultBounds.se[0];
        document.getElementById('seLng').value = this.defaultBounds.se[1];
    }
    
    hideCalibrationModal() {
        document.getElementById('calibrationModal').classList.remove('active');
    }
    
    applyCalibration() {
        const nwLat = parseFloat(document.getElementById('nwLat').value);
        const nwLng = parseFloat(document.getElementById('nwLng').value);
        const seLat = parseFloat(document.getElementById('seLat').value);
        const seLng = parseFloat(document.getElementById('seLng').value);
        
        if (isNaN(nwLat) || isNaN(nwLng) || isNaN(seLat) || isNaN(seLng)) {
            this.showToast('Please enter valid coordinates', 'error');
            return;
        }
        
        // Update bounds
        this.defaultBounds = {
            nw: [nwLat, nwLng],
            se: [seLat, seLng]
        };
        
        // Update overlay
        if (this.overlay) {
            this.map.removeLayer(this.overlay);
            this.initOverlay();
        }
        
        this.hideCalibrationModal();
        this.showToast('Overlay calibration applied', 'success');
    }
    
    resetCalibration() {
        this.defaultBounds = {
            nw: [12.9520, 77.6670],
            se: [12.9490, 77.6700]
        };
        
        document.getElementById('nwLat').value = this.defaultBounds.nw[0];
        document.getElementById('nwLng').value = this.defaultBounds.nw[1];
        document.getElementById('seLat').value = this.defaultBounds.se[0];
        document.getElementById('seLng').value = this.defaultBounds.se[1];
    }
    
    exportGraph() {
        const dataStr = JSON.stringify(this.graph, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'campus-graph.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Graph data exported successfully', 'success');
    }
    
    async importGraph(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const newGraph = JSON.parse(text);
            
            // Validate structure
            if (!newGraph.nodes || !newGraph.edges) {
                throw new Error('Invalid graph structure');
            }
            
            this.graph = newGraph;
            
            // Refresh map
            this.clearRoute();
            Object.values(this.markers).forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = {};
            
            this.addMarkers();
            this.buildSearchIndex();
            this.populateSelects();
            
            this.showToast('Graph data imported successfully', 'success');
        } catch (error) {
            console.error('Error importing graph:', error);
            this.showToast('Error importing graph data', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    handleMapClick(e) {
        if (this.isAdminMode) {
            console.log('Map clicked at:', e.latlng);
            // Future: Allow adding new nodes by clicking
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.campusMap = new CampusMap();
});