# Chanakya University Interactive Campus Map

A comprehensive web-based campus navigation system featuring interactive mapping, route finding, and real-time location search capabilities.

## 🌟 Features

- **Interactive Leaflet Map**: Fully interactive campus map with satellite imagery
- **Blueprint Overlay**: Georeferenced campus blueprint overlay on satellite tiles
- **Smart Route Finding**: Dijkstra's algorithm for optimal pathfinding between locations
- **Real-time Search**: Typeahead search functionality for quick location lookup
- **Admin Mode**: Drag-and-drop marker positioning with live coordinate updates
- **Calibration Tools**: Precise overlay alignment controls
- **Data Management**: Import/export campus graph data
- **Mobile Responsive**: Optimized for all device sizes
- **Modern UI**: Google Maps-inspired clean interface design

## 🚀 Quick Start

1. **Clone/Download** this project to your web server directory

2. **Add Campus Images**:
   - Place your campus blueprint image as `assets/blueprint.jpg`
   - Place your satellite reference image as `assets/satellite.jpg`

3. **Serve the Files**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or use any web server (Apache, Nginx, etc.)
   ```

4. **Open in Browser**: Navigate to `http://localhost:8000`

## 📁 Project Structure

```
├── index.html              # Main application page
├── style.css              # Modern, responsive styling
├── script.js              # Core mapping and pathfinding logic
├── data/
│   └── distances.json     # Campus graph data (nodes + edges)
├── assets/
│   ├── blueprint.jpg      # Campus blueprint overlay (add your image)
│   └── satellite.jpg      # Satellite reference image (add your image)
└── README.md              # This file
```

## 🎯 Usage Guide

### Basic Navigation
- **Search**: Type location names in the top search bar for instant results
- **Route Finding**: Select start/end points and click "Find Route"
- **Map Controls**: Standard zoom, pan, and marker interactions

### Advanced Features

#### Calibration Mode
1. Click **📐 Calibrate** button
2. Adjust overlay bounds using lat/lng coordinates
3. Fine-tune opacity and positioning
4. Click **Apply** to update the overlay

#### Admin Mode
1. Click **⚙️ Admin** button to enter admin mode
2. Drag markers to adjust positions
3. Updated coordinates are automatically saved
4. Export updated graph when finished

#### Data Management
- **Export**: Download current graph as JSON
- **Import**: Upload modified graph data
- **Reset**: Restore default calibration settings

## ⚙️ Configuration

### Updating Campus Data

Edit `data/distances.json` to modify campus locations and connections:

```json
{
  "nodes": [
    {"id":"gate1","name":"Gate 1","lat":12.9510,"lng":77.6679}
  ],
  "edges": [
    {"a":"gate1","b":"gate2","dist":180}
  ]
}
```

### Adding New Locations

1. Add node entry with unique ID, name, and coordinates
2. Add edge entries connecting to existing nodes with distances in meters
3. Refresh the application or use import functionality

### Image Setup

**Blueprint Image (`assets/blueprint.jpg`)**:
- High-resolution campus layout/architectural drawing
- Should align roughly with satellite imagery
- Supported formats: JPG, PNG, SVG

**Satellite Image (`assets/satellite.jpg`)**:
- Recent satellite or aerial view of campus
- Used as reference for overlay alignment
- High resolution recommended for better calibration

## 🛠️ Customization

### Styling
- Modify `style.css` for visual customization
- CSS variables in `:root` for easy color scheme changes
- Responsive breakpoints already configured

### Functionality
- `script.js` contains all mapping logic
- Pathfinding algorithm can be swapped (currently Dijkstra)
- Search functionality supports fuzzy matching
- Toast notifications for user feedback

### Map Configuration
- Change base tile layer (OpenStreetMap, satellite, etc.)
- Adjust default zoom levels and center coordinates
- Modify marker styles and popup content

## 📱 Mobile Support

The application is fully responsive with:
- Collapsible search panel on mobile
- Touch-optimized controls
- Adaptive layout for different screen sizes
- Gesture support for map navigation

## 🔧 Technical Details

**Dependencies**:
- Leaflet 1.9.4 (mapping library)
- Pure HTML5, CSS3, and ES6+ JavaScript
- No build process required

**Browser Compatibility**:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers supported

**Performance**:
- Optimized marker rendering
- Efficient pathfinding algorithms
- Minimal DOM manipulation
- Progressive image loading

## 🚀 Deployment Options

### Static Hosting
- GitHub Pages
- Netlify
- Vercel
- Any static file server

### Web Server
- Apache with mod_rewrite
- Nginx with proper mime types
- IIS with static content serving

### CDN Integration
- CloudFlare for global distribution
- AWS S3 + CloudFront
- Azure Static Web Apps

## 🐛 Troubleshooting

**Images Not Loading**:
- Verify `assets/blueprint.jpg` exists
- Check file permissions
- Ensure web server serves image files

**Pathfinding Issues**:
- Verify all nodes are connected in `distances.json`
- Check for disconnected graph segments
- Validate distance values are positive numbers

**Calibration Problems**:
- Use high-precision GPS coordinates
- Reference known landmarks for accuracy
- Test overlay alignment at different zoom levels

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Test thoroughly with your campus data
4. Submit pull request with detailed description

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For issues, questions, or feature requests:
1. Check existing documentation
2. Create GitHub issue with detailed description
3. Include browser console logs for technical problems

---

**Made for Chanakya University** 🏛️ | Interactive Campus Navigation System