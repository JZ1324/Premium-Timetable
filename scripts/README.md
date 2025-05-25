# Scripts Directory

This directory contains all development, build, and maintenance scripts organized by purpose.

## 📁 Directory Structure

### Build Scripts (`build/`)
- `fix-html-on-build.js` - Post-build HTML processing
- Production build optimizations
- Asset processing scripts

### Deployment Scripts (`deployment/`)
- `deploy-to-vercel.sh` - Vercel deployment automation
- `github-to-vercel.sh` - GitHub to Vercel migration
- `migrate-to-new-repo.sh` - Repository migration
- Firebase deployment scripts
- Production promotion scripts

### Testing Scripts (`testing/`)
- `test-*.js` - Various test suites
- `verify-*.js` - Build verification scripts
- API testing utilities
- Parser validation scripts

### Maintenance Scripts (`maintenance/`)
- `cleanup-*.sh` - Project cleanup utilities
- `manual-fix-*.sh` - Manual fix applications
- File organization scripts
- Documentation generators

### Configuration (`configs/`)
- `vercel-build.js` - Vercel build configuration
- `vercel.json` - Vercel deployment settings
- Environment configuration files

## 🚀 Common Tasks

### Building the Project
```bash
npm run build
```
Uses: `build/fix-html-on-build.js`

### Testing
```bash
npm test
```
Uses scripts from: `testing/`

### Deployment
```bash
# Vercel
./scripts/deployment/deploy-to-vercel.sh

# GitHub Pages
npm run deploy:github
```

### Maintenance
```bash
# Cleanup project
./scripts/maintenance/cleanup-workspace.sh
```

## 📝 Script Guidelines

When adding new scripts:
1. Choose appropriate directory based on purpose
2. Make scripts executable with `chmod +x`
3. Add proper error handling
4. Document usage in script comments
5. Update package.json if needed

## 🔗 Dependencies

Scripts may depend on:
- Node.js packages listed in `package.json`
- System tools (git, bash, etc.)
- Environment variables
- Build outputs in `build/` directory
