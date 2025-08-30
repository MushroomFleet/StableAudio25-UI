# Release File Structure Guide

This document defines which files should be included in different types of releases for the Stability Audio 2 application.

## 📦 Release Types

### 🔧 Source Code Release
For developers who want to build from source, contribute, or deploy the web application.

### 📱 Binary Release  
For end users who want the desktop application without any setup.

---

## 📋 File Structure with Release Markers

```
stableaudio2-ui/
├── 📄 README.md                           ✅ SOURCE | ✅ BINARY
├── 📄 LICENSE                             ✅ SOURCE | ✅ BINARY (if exists)
├── 📄 RELEASE_FILES.md                    ✅ SOURCE | ❌ BINARY
├── 📄 package.json                        ✅ SOURCE | ❌ BINARY
├── 📄 package-lock.json                   ❌ SOURCE | ❌ BINARY
├── 📄 .env                                ❌ SOURCE | ❌ BINARY (contains secrets)
├── 📄 env.example                         ✅ SOURCE | ❌ BINARY
│
├── 📁 client/                             ✅ SOURCE | ❌ BINARY
│   ├── 📄 package.json                    ✅ SOURCE | ❌ BINARY
│   ├── 📄 package-lock.json               ❌ SOURCE | ❌ BINARY
│   ├── 📄 README.md                       ✅ SOURCE | ❌ BINARY
│   ├── 📄 .gitignore                      ✅ SOURCE | ❌ BINARY
│   ├── 📄 eslint.config.js                ✅ SOURCE | ❌ BINARY
│   ├── 📄 index.html                      ✅ SOURCE | ❌ BINARY
│   ├── 📄 tailwind.config.js              ✅ SOURCE | ❌ BINARY
│   ├── 📄 vite.config.js                  ✅ SOURCE | ❌ BINARY
│   ├── 📁 dist/                           ❌ SOURCE | ❌ BINARY (build artifact)
│   ├── 📁 node_modules/                   ❌ SOURCE | ❌ BINARY (dependencies)
│   ├── 📁 public/                         ✅ SOURCE | ❌ BINARY
│   │   └── 📄 vite.svg                    ✅ SOURCE | ❌ BINARY
│   └── 📁 src/                            ✅ SOURCE | ❌ BINARY
│       ├── 📄 App.css                     ✅ SOURCE | ❌ BINARY
│       ├── 📄 App.jsx                     ✅ SOURCE | ❌ BINARY
│       ├── 📄 index.css                   ✅ SOURCE | ❌ BINARY
│       ├── 📄 main.jsx                    ✅ SOURCE | ❌ BINARY
│       └── 📁 assets/                     ✅ SOURCE | ❌ BINARY
│           └── 📄 react.svg               ✅ SOURCE | ❌ BINARY
│
├── 📁 server/                             ✅ SOURCE | ❌ BINARY
│   ├── 📄 package.json                    ✅ SOURCE | ❌ BINARY
│   ├── 📄 package-lock.json               ❌ SOURCE | ❌ BINARY
│   ├── 📁 node_modules/                   ❌ SOURCE | ❌ BINARY (dependencies)
│   ├── 📁 src/                            ✅ SOURCE | ❌ BINARY
│   │   ├── 📄 server.js                   ✅ SOURCE | ❌ BINARY
│   │   └── 📁 routes/                     ✅ SOURCE | ❌ BINARY
│   │       └── 📄 audio.js                ✅ SOURCE | ❌ BINARY
│   ├── 📁 temp-uploads/                   ❌ SOURCE | ❌ BINARY (runtime data)
│   └── 📁 uploads/                        ❌ SOURCE | ❌ BINARY (user data)
│       └── 📄 *.mp3, *.wav, *.txt         ❌ SOURCE | ❌ BINARY (user-generated)
│
├── 📁 SA25-desktop/                       ✅ SOURCE | 🔽 PARTIAL BINARY
│   ├── 📄 package.json                    ✅ SOURCE | ❌ BINARY
│   ├── 📄 package-lock.json               ❌ SOURCE | ❌ BINARY
│   ├── 📄 .env                            ❌ SOURCE | ❌ BINARY (contains secrets)
│   ├── 📁 electron/                       ✅ SOURCE | ❌ BINARY
│   │   ├── 📄 main.js                     ✅ SOURCE | ❌ BINARY
│   │   ├── 📄 preload.js                  ✅ SOURCE | ❌ BINARY
│   │   └── 📁 server/                     ✅ SOURCE | ❌ BINARY
│   │       └── 📁 src/                    ✅ SOURCE | ❌ BINARY
│   │           ├── 📄 server.js           ✅ SOURCE | ❌ BINARY
│   │           └── 📁 routes/             ✅ SOURCE | ❌ BINARY
│   │               └── 📄 audio.js        ✅ SOURCE | ❌ BINARY
│   ├── 📁 build/                          ❌ SOURCE | 🔽 PARTIAL BINARY
│   │   ├── 📄 Stability Audio 2.5 Setup 1.0.0.exe  ❌ SOURCE | ✅ BINARY
│   │   ├── 📄 *.exe.blockmap              ❌ SOURCE | ✅ BINARY (for updates)
│   │   ├── 📄 builder-debug.yml           ❌ SOURCE | ❌ BINARY (debug info)
│   │   ├── 📄 builder-effective-config.yaml ❌ SOURCE | ❌ BINARY (debug info)
│   │   └── 📁 win-unpacked/               ❌ SOURCE | ❌ BINARY (dev artifact)
│   ├── 📁 dist/                           ❌ SOURCE | ❌ BINARY (copied from client)
│   ├── 📁 node_modules/                   ❌ SOURCE | ❌ BINARY (dependencies)
│   ├── 📁 resources/                      ❓ SOURCE | ❌ BINARY (if has custom icons)
│   ├── 📁 scripts/                        ✅ SOURCE | ❌ BINARY
│   │   └── 📄 copy-dist.js                ✅ SOURCE | ❌ BINARY
│   ├── 📁 temp-uploads/                   ❌ SOURCE | ❌ BINARY (runtime data)
│   └── 📁 uploads/                        ❌ SOURCE | ❌ BINARY (runtime data)
│
└── 📁 plan/                               ❓ SOURCE | ❌ BINARY (development docs)
    └── 📄 sa2-ui-plan.md                  ❓ SOURCE | ❌ BINARY (development docs)
```

---

## 🏷️ Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | **INCLUDE** - Essential for this release type |
| ❌ | **EXCLUDE** - Should not be included |
| ❓ | **OPTIONAL** - Include based on specific requirements |
| 🔽 | **PARTIAL** - Only specific files from this directory |

---

## 📋 Release Checklists

### 🔧 Source Code Release Checklist

**Core Application Files:**
- [ ] `README.md` - Updated with latest features and instructions
- [ ] `RELEASE_FILES.md` - This guide for future releases
- [ ] `package.json` - Root project configuration
- [ ] `env.example` - Environment template (no secrets)

**Client Application:**
- [ ] `client/src/` - All React source code
- [ ] `client/public/` - Static assets
- [ ] `client/package.json` - Client dependencies
- [ ] `client/*.config.js` - Build configurations
- [ ] `client/index.html` - Entry point

**Server Application:**
- [ ] `server/src/` - Express server source code
- [ ] `server/package.json` - Server dependencies

**Desktop Application:**
- [ ] `SA25-desktop/electron/` - Electron main process files
- [ ] `SA25-desktop/scripts/` - Build utilities
- [ ] `SA25-desktop/package.json` - Desktop app configuration

**Exclusions Verified:**
- [ ] No `node_modules/` directories
- [ ] No `.env` files with secrets
- [ ] No `uploads/` or user-generated content
- [ ] No build artifacts (`dist/`, `build/win-unpacked/`)
- [ ] No `package-lock.json` files

### 📱 Binary Release Checklist

**Essential Files:**
- [ ] `SA25-desktop/build/Stability Audio 2.5 Setup 1.0.0.exe` - Main installer
- [ ] `SA25-desktop/build/Stability Audio 2.5 Setup 1.0.0.exe.blockmap` - Update metadata
- [ ] `README.md` - Installation and usage instructions
- [ ] `LICENSE` - Legal requirements (if applicable)

**Optional Files:**
- [ ] Release notes document
- [ ] Installation troubleshooting guide
- [ ] System requirements document

**Verification Steps:**
- [ ] Installer runs without errors
- [ ] Application launches successfully
- [ ] Audio generation works with valid API key
- [ ] Download functionality works
- [ ] No missing dependencies

---

## 🚀 Release Preparation Commands

### Source Code Release
```bash
# 1. Clean the project
npm run clean  # (if available)
rm -rf node_modules client/node_modules server/node_modules SA25-desktop/node_modules
rm -rf client/dist SA25-desktop/dist SA25-desktop/build/win-unpacked
rm -rf */temp-uploads */uploads

# 2. Verify source files
ls -la client/src server/src SA25-desktop/electron

# 3. Create archive
zip -r stableaudio2-ui-source-v1.0.0.zip . \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/build/*" \
  -x "*/uploads/*" \
  -x "*/temp-uploads/*" \
  -x ".env" \
  -x "*/.env" \
  -x "package-lock.json" \
  -x "*/package-lock.json"
```

### Binary Release
```bash
# 1. Build desktop application
cd SA25-desktop
npm run build

# 2. Verify installer
ls -la build/Stability\ Audio\ 2.5\ Setup\ 1.0.0.exe

# 3. Test installer (optional)
# Run installer in VM or test environment

# 4. Create release package
mkdir stableaudio2-ui-binary-v1.0.0
cp build/Stability\ Audio\ 2.5\ Setup\ 1.0.0.exe stableaudio2-ui-binary-v1.0.0/
cp build/Stability\ Audio\ 2.5\ Setup\ 1.0.0.exe.blockmap stableaudio2-ui-binary-v1.0.0/
cp ../README.md stableaudio2-ui-binary-v1.0.0/
zip -r stableaudio2-ui-binary-v1.0.0.zip stableaudio2-ui-binary-v1.0.0/
```

---

## 🔄 Cross-Platform Considerations

### Building for Multiple Platforms
```bash
# Windows (current)
npm run build  # Produces .exe installer

# macOS (requires macOS or CI/CD)
npm run build:mac  # Would produce .dmg

# Linux (cross-platform possible)
npm run build:linux  # Would produce .AppImage or .deb
```

### Platform-Specific Files
- **Windows**: `.exe`, `.exe.blockmap`
- **macOS**: `.dmg`, `.dmg.blockmap`, possibly `.zip` for auto-updater
- **Linux**: `.AppImage`, `.deb`, `.rpm` depending on target distribution

---

## 📝 Release Notes Template

```markdown
# Stability Audio 2 - Release v1.0.0

## 🚀 What's New
- Desktop application with native OS integration
- Electron-based architecture for cross-platform support
- Enhanced download functionality with native file dialogs
- [Other new features...]

## 💾 Downloads
- **Desktop Application**: `Stability Audio 2.5 Setup 1.0.0.exe` (Windows)
- **Source Code**: `stableaudio2-ui-source-v1.0.0.zip`

## 📋 System Requirements
- Windows 10 or newer (64-bit)
- ~200MB disk space
- Internet connection for audio generation

## 🛠️ Installation
1. Download the installer
2. Run as administrator
3. Follow setup wizard
4. Launch from desktop shortcut

## 🐛 Known Issues
- [List any known issues]

## 🔄 Upgrade Notes
- [Migration instructions if applicable]
```

---

## 🔐 Security Considerations

### Files to Never Include:
- `.env` files containing API keys
- `node_modules/` (potential security vulnerabilities)
- User-generated uploads
- Development certificates or keys
- Debug symbols and source maps (unless intentional)

### Pre-Release Security Checks:
- [ ] Scan for hardcoded secrets
- [ ] Verify no personal data in uploads
- [ ] Check for exposed development endpoints
- [ ] Validate installer is code-signed (for production)

---

## 📊 Release Size Estimates

| Release Type | Estimated Size | Components |
|--------------|----------------|------------|
| **Source Code** | ~2-5 MB | Source files, configs, docs |
| **Binary (Windows)** | ~150-200 MB | Electron runtime + app |
| **Binary (macOS)** | ~180-250 MB | macOS-specific binaries |
| **Binary (Linux)** | ~170-220 MB | Linux-specific binaries |

---

*This guide should be updated with each release to reflect any new files or changes in the project structure.*
