import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'
import { copyFileSync, cpSync, mkdirSync, existsSync, renameSync, rmSync } from 'fs'

const browser = process.env.BROWSER || 'chrome'
const isFirefox = browser === 'firefox'
const isProd = process.env.NODE_ENV === 'production'
const apiBaseUrl = isProd ? 'https://resume-studio.io' : 'http://localhost:5000'

const entry = process.env.ENTRY || 'popup'

const aliases = {
  '@shared': resolve(__dirname, 'src/shared'),
  '@extractors': resolve(__dirname, 'src/extractors'),
}

const defines = {
  __API_BASE_URL__: JSON.stringify(apiBaseUrl),
  __BROWSER__: JSON.stringify(browser),
}

// Popup build: HTML entry with ESM
const popupConfig = defineConfig({
  plugins: [
    preact(),
    {
      name: 'copy-extension-assets',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist', browser)

        // Copy manifest
        const manifestSrc = isFirefox
          ? resolve(__dirname, 'manifests/firefox.json')
          : resolve(__dirname, 'manifests/chrome.json')
        copyFileSync(manifestSrc, resolve(outDir, 'manifest.json'))

        // Copy icons
        const iconsDir = resolve(outDir, 'icons')
        if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })
        cpSync(resolve(__dirname, 'icons'), iconsDir, { recursive: true })

        // Copy content styles.css
        const contentDir = resolve(outDir, 'content')
        if (!existsSync(contentDir)) mkdirSync(contentDir, { recursive: true })
        copyFileSync(
          resolve(__dirname, 'src/content/styles.css'),
          resolve(contentDir, 'styles.css')
        )

        // Move popup HTML from src/popup/ to popup/
        const srcPopupDir = resolve(outDir, 'src/popup')
        const destPopupDir = resolve(outDir, 'popup')
        if (existsSync(resolve(srcPopupDir, 'index.html'))) {
          if (!existsSync(destPopupDir)) mkdirSync(destPopupDir, { recursive: true })
          renameSync(resolve(srcPopupDir, 'index.html'), resolve(destPopupDir, 'index.html'))
          try { rmSync(resolve(outDir, 'src'), { recursive: true }) } catch {}
        }
      },
    },
  ],
  define: defines,
  resolve: { alias: aliases },
  base: '/',
  build: {
    outDir: resolve(__dirname, 'dist', browser),
    emptyOutDir: true,
    minify: isFirefox ? false : 'esbuild',
    sourcemap: isFirefox ? 'inline' : false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: 'popup/main.js',
        chunkFileNames: 'popup/chunks/[name]-[hash].js',
        assetFileNames: 'popup/[name][extname]',
      },
    },
  },
})

// Content script build: IIFE, self-contained, no imports
const contentConfig = defineConfig({
  define: defines,
  resolve: { alias: aliases },
  build: {
    outDir: resolve(__dirname, 'dist', browser),
    emptyOutDir: false,
    minify: isFirefox ? false : 'esbuild',
    sourcemap: isFirefox ? 'inline' : false,
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      formats: ['iife'],
      name: 'ResumeStudioContent',
      fileName: () => 'content/content.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})

// Service worker build: IIFE, self-contained
const swConfig = defineConfig({
  define: defines,
  resolve: { alias: aliases },
  build: {
    outDir: resolve(__dirname, 'dist', browser),
    emptyOutDir: false,
    minify: isFirefox ? false : 'esbuild',
    sourcemap: isFirefox ? 'inline' : false,
    lib: {
      entry: resolve(__dirname, 'src/background/service-worker.ts'),
      formats: ['iife'],
      name: 'ResumeStudioSW',
      fileName: () => 'background/service-worker.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})

const configs: Record<string, ReturnType<typeof defineConfig>> = {
  popup: popupConfig,
  content: contentConfig,
  'service-worker': swConfig,
}

export default configs[entry] || popupConfig
