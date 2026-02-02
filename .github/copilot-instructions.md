# agadmator-library

A Vue 3 + TypeScript web application that catalogs chess videos from the agadmator YouTube channel. The project includes automated data collection via YouTube API, chess game analysis using Stockfish, and a searchable/filterable video library interface.

## Build, Test, and Lint

### First Time Setup
**Important**: Run `npm run build` before using other commands. This compiles TypeScript build scripts and generates required data files.

### Development
```bash
npm run dev              # Start Vite dev server
npm run build            # Type-check, generate data, and build for production
npm run build-only       # Build without type checking
npm run preview          # Preview production build
npm run type-check       # Run Vue type checking
```

### Data Management Scripts
```bash
npm run loadNewVideos         # Fetch new videos from YouTube API
npm run refreshVideo          # Refresh data for specific video
npm run loadMissingData       # Fetch missing video metadata
npm run retryDataRetrieval    # Retry failed data fetches
npm run extractGames          # Extract PGN data from videos
npm run generate              # Generate aggregated data files
npm run removeVideo           # Remove video from database
```

Most data scripts compile TypeScript first (`tsc --project ./tsconfig.generate.json`) then execute the generated JavaScript in `build_scripts/nodeActions/`. However, `loadNewVideos` requires build scripts to be pre-compiled.

No test suite is currently configured.

## High-Level Architecture

### Dual Build System
The project has two distinct TypeScript configurations:
- **Frontend** (`tsconfig.app.json`): Vue 3 SPA built with Vite
- **Build Scripts** (`tsconfig.generate.json`): Node.js scripts for data collection and processing

### Data Flow
1. **Collection**: YouTube API → `build_scripts/loadNewMovies.ts` → `db/` (JSON files)
2. **Enrichment**: Chess engines (Stockfish, chess.com, lichess) extract game data → `db/` updates
3. **Generation**: `build_scripts/nodeActions/generate.js` creates aggregated data → `generated/` directory
4. **Frontend**: Vue stores (`stores/`) load from `generated/` → filter/display to users

### State Management
Uses Pinia with four main stores:
- `videosStore`: Manages video metadata (fetches from `generated/videos.json`)
- `openingsStore`: Chess opening database
- `pgnsStore`: PGN (chess notation) data
- `positionsStore`: Board position analysis

### Video Database Structure
Each video stored as `db/{videoId}.json` containing:
- YouTube metadata (title, description, duration)
- Extracted chess games (PGN format)
- Player information
- Opening classifications
- Stockfish evaluations

### Chess Data Integration
Multiple chess platforms are integrated via separate modules in `build_scripts/`:
- `chessCom/`: Chess.com game lookup
- `lichess/`: Lichess game database
- `lichessMasters/`: Lichess masters database
- `chess365/`: Chess365 integration
- `chesstempo/`: Chesstempo integration
- `stockfish/`: Local Stockfish engine analysis

## Key Conventions

### File Naming
- TypeScript model files: PascalCase (e.g., `Video.ts`, `Opening.ts`)
- Component files: PascalCase (e.g., `VideoTable.vue`, `VideosFiltersSelectors.vue`)
- Build scripts: camelCase (e.g., `loadNewMovies.ts`, `extractPGN.ts`)
- Database files: YouTube video IDs as filenames (e.g., `{videoId}.json`)

### Type Safety
- Strict TypeScript mode enabled
- No implicit any
- All models defined in `src/model/` with explicit types
- Build scripts have separate strict configuration

### Data Overrides
Manual corrections for extracted data:
- `build_scripts/dateOverrides.ts`: Corrects video publish dates
- `build_scripts/pgnOverrides.ts`: Manual PGN corrections
- `build_scripts/players/`: Player name normalization

### Environment Variables
YouTube API key required for data collection scripts:
- Set `YOUTUBE_API_KEY` environment variable
- Used by `build_scripts/loadNewMovies.ts`

### Generated Files
The `generated/` directory is created during build and copied to `dist/`:
- Not committed to git
- Created by `npm run generate`
- Contains aggregated JSON for frontend consumption

### Component Organization
- `src/components/`: Main UI components
- `src/components/filters/`: Filter selector components
- `src/event/`: Custom event classes
- `src/util/`: Shared utilities

### PGN Extraction Strategy
Videos are scraped for chess games using multiple strategies:
1. Try lichess links in description
2. Try chess.com links
3. Use Stockfish to validate extracted PGNs
4. Apply manual overrides from `pgnOverrides.ts`

The extraction is resumable - if interrupted, it can continue from the last processed video.
