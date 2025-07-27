const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Build optimization script
console.log('🚀 Running build optimization...');

const distPath = path.join(__dirname, '../dist');
const statsPath = path.join(distPath, 'build-stats.json');

// Analyze bundle sizes
function analyzeBundleSizes() {
  const jsDir = path.join(distPath, 'js');
  const cssDir = path.join(distPath, 'assets');
  const stats = {
    timestamp: new Date().toISOString(),
    bundles: {},
    totalSize: 0,
    gzippedSize: 0,
    recommendations: [],
  };

  // Analyze JS bundles
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));

    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const content = fs.readFileSync(filePath);
      const size = content.length;
      const gzippedSize = gzipSync(content).length;

      stats.bundles[file] = {
        size: Math.round((size / 1024) * 100) / 100, // KB
        gzippedSize: Math.round((gzippedSize / 1024) * 100) / 100, // KB
        compressionRatio: Math.round((1 - gzippedSize / size) * 100),
      };

      stats.totalSize += size;
      stats.gzippedSize += gzippedSize;
    });
  }

  // Analyze CSS files
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs
      .readdirSync(cssDir)
      .filter(file => file.endsWith('.css'));

    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const content = fs.readFileSync(filePath);
      const size = content.length;
      const gzippedSize = gzipSync(content).length;

      stats.bundles[file] = {
        size: Math.round((size / 1024) * 100) / 100, // KB
        gzippedSize: Math.round((gzippedSize / 1024) * 100) / 100, // KB
        compressionRatio: Math.round((1 - gzippedSize / size) * 100),
      };

      stats.totalSize += size;
      stats.gzippedSize += gzippedSize;
    });
  }

  // Convert to KB
  stats.totalSize = Math.round((stats.totalSize / 1024) * 100) / 100;
  stats.gzippedSize = Math.round((stats.gzippedSize / 1024) * 100) / 100;

  // Generate recommendations
  Object.entries(stats.bundles).forEach(([filename, data]) => {
    if (data.size > 500) {
      // > 500KB
      stats.recommendations.push(
        `⚠️  ${filename} is large (${data.size}KB). Consider code splitting.`
      );
    }
    if (data.compressionRatio < 60) {
      // < 60% compression
      stats.recommendations.push(
        `📦 ${filename} has poor compression (${data.compressionRatio}%). Check for duplicate code.`
      );
    }
  });

  if (stats.totalSize > 2000) {
    // > 2MB total
    stats.recommendations.push(
      '🎯 Total bundle size is large. Consider lazy loading non-critical features.'
    );
  }

  return stats;
}

// Optimize images (placeholder for future implementation)
function optimizeImages() {
  const imagesDir = path.join(distPath, 'images');
  if (!fs.existsSync(imagesDir)) return;

  console.log('📸 Image optimization would run here...');
  // Future: Implement image compression, WebP conversion, etc.
}

// Generate service worker for caching
function generateServiceWorker() {
  const swPath = path.join(distPath, 'sw.js');
  const swContent = `
// Auto-generated service worker for asset caching
const CACHE_NAME = 'gamified-study-v${Date.now()}';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // Add other critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
`;

  fs.writeFileSync(swPath, swContent);
  console.log('🔧 Service worker generated');
}

// Main optimization process
async function optimize() {
  try {
    console.log('📊 Analyzing bundle sizes...');
    const stats = analyzeBundleSizes();

    console.log('\n📈 Build Statistics:');
    console.log(`Total Size: ${stats.totalSize}KB`);
    console.log(`Gzipped Size: ${stats.gzippedSize}KB`);
    console.log(
      `Compression: ${Math.round((1 - stats.gzippedSize / stats.totalSize) * 100)}%`
    );

    console.log('\n📦 Bundle Breakdown:');
    Object.entries(stats.bundles).forEach(([filename, data]) => {
      console.log(
        `  ${filename}: ${data.size}KB (${data.gzippedSize}KB gzipped)`
      );
    });

    if (stats.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      stats.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // Save stats
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 Stats saved to ${statsPath}`);

    // Run other optimizations
    optimizeImages();
    generateServiceWorker();

    console.log('\n✅ Build optimization complete!');
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  optimize();
}

module.exports = { optimize, analyzeBundleSizes };
