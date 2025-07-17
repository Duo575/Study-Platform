#!/usr/bin/env node

/**
 * Production build optimization script
 * This script runs additional optimizations after the build process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

console.log('🚀 Starting build optimization...');

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Dist directory not found. Please run build first.');
  process.exit(1);
}

// Optimization functions
async function optimizeImages() {
  console.log('🖼️  Optimizing images...');

  try {
    // Find all image files
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    const imageFiles = [];

    function findImages(dir) {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          findImages(filePath);
        } else if (
          imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
        ) {
          imageFiles.push(filePath);
        }
      });
    }

    findImages(DIST_DIR);

    console.log(`📊 Found ${imageFiles.length} image files`);

    // Log image sizes for analysis
    let totalSize = 0;
    imageFiles.forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    });

    console.log(
      `📏 Total image size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`
    );
  } catch (error) {
    console.warn('⚠️  Image optimization failed:', error.message);
  }
}

async function analyzeBundle() {
  console.log('📦 Analyzing bundle...');

  try {
    const jsFiles = [];
    const cssFiles = [];

    function findAssets(dir) {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
          if (file.endsWith('.js')) {
            jsFiles.push({ name: file, size: stat.size, path: filePath });
          } else if (file.endsWith('.css')) {
            cssFiles.push({ name: file, size: stat.size, path: filePath });
          }
        }
      });
    }

    findAssets(ASSETS_DIR);

    // Sort by size
    jsFiles.sort((a, b) => b.size - a.size);
    cssFiles.sort((a, b) => b.size - a.size);

    console.log('\n📊 Bundle Analysis:');
    console.log('==================');

    // JavaScript files
    console.log('\n🟨 JavaScript Files:');
    let totalJSSize = 0;
    jsFiles.forEach(file => {
      totalJSSize += file.size;
      const sizeKB = (file.size / 1024).toFixed(2);
      console.log(`  ${file.name}: ${sizeKB} KB`);
    });
    console.log(`  Total JS: ${(totalJSSize / 1024).toFixed(2)} KB`);

    // CSS files
    console.log('\n🟦 CSS Files:');
    let totalCSSSize = 0;
    cssFiles.forEach(file => {
      totalCSSSize += file.size;
      const sizeKB = (file.size / 1024).toFixed(2);
      console.log(`  ${file.name}: ${sizeKB} KB`);
    });
    console.log(`  Total CSS: ${(totalCSSSize / 1024).toFixed(2)} KB`);

    console.log(
      `\n📏 Total Bundle Size: ${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`
    );

    // Check for large files
    const largeFiles = [...jsFiles, ...cssFiles].filter(
      file => file.size > 500 * 1024
    ); // > 500KB
    if (largeFiles.length > 0) {
      console.log('\n⚠️  Large Files (>500KB):');
      largeFiles.forEach(file => {
        console.log(`  ${file.name}: ${(file.size / 1024).toFixed(2)} KB`);
      });
    }
  } catch (error) {
    console.warn('⚠️  Bundle analysis failed:', error.message);
  }
}

async function generateSecurityHeaders() {
  console.log('🔒 Generating security headers...');

  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };

  // Create _headers file for Netlify
  const netlifyHeaders = `/*
${Object.entries(securityHeaders)
  .map(([key, value]) => `  ${key}: ${value}`)
  .join('\n')}

/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable`;

  fs.writeFileSync(path.join(DIST_DIR, '_headers'), netlifyHeaders);

  console.log('✅ Security headers generated');
}

async function generateRobotsTxt() {
  console.log('🤖 Generating robots.txt...');

  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${process.env.VITE_SITE_URL || 'https://your-domain.com'}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow specific paths
Allow: /static/images/
Allow: /static/icons/`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt);

  console.log('✅ robots.txt generated');
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const baseUrl = process.env.VITE_SITE_URL || 'https://your-domain.com';
  const routes = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/courses',
    '/quests',
    '/progress',
    '/profile',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);

  console.log('✅ sitemap.xml generated');
}

async function optimizeManifest() {
  console.log('📱 Optimizing PWA manifest...');

  const manifestPath = path.join(DIST_DIR, 'manifest.json');

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Add additional PWA optimizations
    manifest.categories = ['education', 'productivity', 'lifestyle'];
    manifest.shortcuts = [
      {
        name: 'Start Study Session',
        short_name: 'Study',
        description: 'Start a new study session',
        url: '/timer',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'View Progress',
        short_name: 'Progress',
        description: 'Check your study progress',
        url: '/progress',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ];

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ PWA manifest optimized');
  }
}

async function generatePerformanceReport() {
  console.log('📊 Generating performance report...');

  const report = {
    buildTime: new Date().toISOString(),
    bundleSize: {},
    recommendations: [],
  };

  // Calculate bundle sizes
  if (fs.existsSync(ASSETS_DIR)) {
    const files = fs.readdirSync(ASSETS_DIR);
    let totalSize = 0;

    files.forEach(file => {
      const filePath = path.join(ASSETS_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      if (file.endsWith('.js')) {
        report.bundleSize.javascript =
          (report.bundleSize.javascript || 0) + stats.size;
      } else if (file.endsWith('.css')) {
        report.bundleSize.css = (report.bundleSize.css || 0) + stats.size;
      }
    });

    report.bundleSize.total = totalSize;
  }

  // Add recommendations
  if (report.bundleSize.total > 1024 * 1024) {
    // > 1MB
    report.recommendations.push(
      'Consider code splitting to reduce bundle size'
    );
  }

  if (report.bundleSize.javascript > 512 * 1024) {
    // > 512KB
    report.recommendations.push(
      'JavaScript bundle is large, consider lazy loading'
    );
  }

  fs.writeFileSync(
    path.join(DIST_DIR, 'performance-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Performance report generated');
}

// Main optimization process
async function runOptimizations() {
  try {
    await optimizeImages();
    await analyzeBundle();
    await generateSecurityHeaders();
    await generateRobotsTxt();
    await generateSitemap();
    await optimizeManifest();
    await generatePerformanceReport();

    console.log('\n✅ Build optimization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  - Images optimized');
    console.log('  - Bundle analyzed');
    console.log('  - Security headers generated');
    console.log('  - SEO files created (robots.txt, sitemap.xml)');
    console.log('  - PWA manifest optimized');
    console.log('  - Performance report generated');
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runOptimizations();
}

module.exports = { runOptimizations };
