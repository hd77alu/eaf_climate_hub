# PostgreSQL to SQLite Migration Guide

## Changes Made

### 1. Updated Dependencies
- **Removed**: `pg` (PostgreSQL driver)
- **Added**: `sqlite3` (SQLite driver)

### 2. Modified Files

#### `package.json`
- Changed dependency from `"pg": "^8.11.3"` to `"sqlite3": "^5.1.7"`

#### `backend/db.js`
- Replaced PostgreSQL Pool connection with SQLite database connection
- Added promisified wrapper functions: `runAsync`, `getAsync`, `allAsync`
- Updated `query()` function to convert PostgreSQL syntax ($1, $2) to SQLite syntax (?)
- Modified `buildWhereClause()` to use SQLite syntax:
  - Changed `ANY($n)` to `IN (?, ?, ...)`
  - Changed `ILIKE` to `LIKE` (SQLite is case-insensitive by default)
- Simplified `getClient()` since SQLite doesn't use connection pooling

#### `backend/database-setup.js`
- Complete rewrite using SQLite3 API
- Database file created at: `data/eaf_climate_hub.db`
- Changed data types:
  - `SERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `TIMESTAMP` → `DATETIME`
  - `JSONB` → `TEXT` (for raw_data field)
- Removed CASCADE from DROP statements (SQLite handles this differently)
- Used `db.serialize()` to ensure sequential execution

#### `backend/seed-data.js`
- Replaced PostgreSQL client with SQLite connection
- Added `runAsync()` helper function
- Changed query parameters from `$1, $2, ...` to `?, ?, ...`
- Removed sequence reset commands (SQLite handles autoincrement automatically)
- Updated function signatures to not require client parameter

#### `.gitignore`
- Added SQLite database file extensions: `*.db`, `*.sqlite`, `*.sqlite3`

#### `README.md`
- Removed PostgreSQL prerequisite
- Simplified installation steps (no need for .env configuration for database)
- Updated Technology Stack section
- Database file location documented

### 3. Key Differences: PostgreSQL vs SQLite

| Feature | PostgreSQL | SQLite |
|---------|-----------|--------|
| Connection | Connection pooling | Single file, no pooling |
| Parameters | `$1, $2, $3` | `?, ?, ?` |
| Auto Increment | `SERIAL` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| Timestamp | `TIMESTAMP` | `DATETIME` |
| JSON | `JSONB` | `TEXT` (store as JSON string) |
| Case-insensitive | `ILIKE` | `LIKE` (default) |
| Array ops | `ANY()` | `IN()` with expanded params |

## Installation Steps

1. **Remove old node_modules and package-lock.json**:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup database**:
   ```bash
   npm run setup-db
   ```
   This creates `data/eaf_climate_hub.db`

4. **Seed data**:
   ```bash
   npm run seed
   ```

5. **Start server**:
   ```bash
   npm start
   ```

## Benefits of SQLite

1. **No Database Server**: SQLite is serverless - no installation or configuration needed
2. **Portable**: Single database file can be easily backed up or moved
3. **Simple Setup**: No user credentials, no server management
4. **Perfect for Small to Medium Projects**: Great for development and projects with moderate traffic
5. **Zero Configuration**: Works out of the box
6. **Cross-Platform**: Database file works on any platform

## Limitations to Consider

1. **Concurrency**: SQLite uses file-level locking - not ideal for high write concurrency
2. **Scalability**: Best for applications with < 100K hits/day
3. **Network Access**: Not designed for network/distributed access
4. **User Management**: No built-in user/permission system

## Database Location

The SQLite database file is created at: `./data/eaf_climate_hub.db`

Make sure the `data` directory exists (it's created automatically during setup).

## Rollback to PostgreSQL

If you need to switch back to PostgreSQL:
1. Keep a copy of the original files
2. Reinstall `pg` package: `npm install pg`
3. Restore the original `db.js`, `database-setup.js`, and `seed-data.js` files
4. Update `package.json` dependencies
5. Update `.env` with PostgreSQL credentials
