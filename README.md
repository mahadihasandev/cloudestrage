# Mini Cloud Storage Backend

A small backend service that simulates a cloud file storage system with per-user quota enforcement.

---

## ✅ What this project includes (step-by-step development story)

1. **Project scaffold**
   - Created folder structure for controllers, services, models, and routes.
   - Added environment configuration (`.env`) and `knex` Postgres wiring.

2. **Database setup**
   - Created `users` table (simple user registry).
   - Created `files` table to store file metadata per user.

3. **User registration / login (basic)**
   - Added `POST /users/register` to create a user with `username`, `email`, and `password`.
   - Added `POST /users/login` to authenticate with `email` and `password`.

4. **File upload + quota enforcement**
   - Added `POST /users/:user_id/files` to register a file.
   - Enforced 500 MB per-user quota.
   - Prevented duplicate active file names per user.

5. **Delete & listing**
   - Added `DELETE /users/:user_id/files/:file_id`.
   - Added `GET /users/:user_id/files` to list active files.

6. **Storage summary**
   - Added `GET /users/:user_id/storage-summary` returning used bytes, remaining bytes, and active file count.

---

## 🧩 Folder structure

```
src/
  controllers/       # route handlers
  models/            # DB query helpers
  routes/            # Express route definitions
  services/          # business logic + transactions
  db.js              # knex/Postgres connection
  index.js           # express app entry
.env
README.md
```

---

## 📦 Tech Stack

- Node.js + Express
- PostgreSQL
- Knex (query builder)

---

## 🚀 Setup (copy/paste)

### 1) Install dependencies

```bash
npm install
```

### 2) Create the database + user

```bash
psql -U postgres -c "CREATE DATABASE cloudstorage;"
psql -U postgres -c "CREATE USER clouduser WITH PASSWORD 'cloudpass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cloudstorage TO clouduser;"
```

### 3) Create tables + sample users

```bash
psql -U postgres -d cloudstorage -c "\
CREATE TABLE users (\
  id SERIAL PRIMARY KEY,\
  username TEXT NOT NULL UNIQUE,\
  email TEXT NOT NULL UNIQUE,\
  password_hash TEXT NOT NULL,\
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()\
);\
"

psql -U postgres -d cloudstorage -c "\
CREATE TABLE files (\
  id SERIAL PRIMARY KEY,\
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\
  file_name TEXT NOT NULL,\
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),\
  file_hash TEXT NOT NULL,\
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\
  deleted_at TIMESTAMP WITH TIME ZONE NULL,\
  UNIQUE (user_id, file_name, deleted_at)\
);\
"

psql -U postgres -d cloudstorage -c "INSERT INTO users (username, email, password_hash) VALUES ('User 1', 'user1@example.com', '$2b$10$S8apK48QjnwPUWApl/Pi3ez/epDIQ2mpWtW2xxSCJ45kbMisAZzo6'), ('User 2', 'user2@example.com', '$2b$10$S8apK48QjnwPUWApl/Pi3ez/epDIQ2mpWtW2xxSCJ45kbMisAZzo6'), ('User 3', 'user3@example.com', '$2b$10$S8apK48QjnwPUWApl/Pi3ez/epDIQ2mpWtW2xxSCJ45kbMisAZzo6');"
```

### 4) Set environment variables

Create a `.env` file with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloudstorage
DB_USER=clouduser
DB_PASS=cloudpass
PORT=3000
```

### 5) Start the server

```bash
npm run dev
```

---

## 🧪 API Endpoints

### User registration

```
POST /users/register
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "supersecret"
}
```

### User login

```
POST /users/login
{
  "email": "user1@example.com",
  "password": "supersecret"
}
```

You can also use the simple HTML forms at `/register.html` and `/login.html` when running the server.

### Upload File

```
POST /users/:user_id/files
{
  "file_name": "photo.jpg",
  "file_size_bytes": 102400,
  "file_hash": "abc123"
}
```

### List Files

```
GET /users/:user_id/files
```

### Delete File

```
DELETE /users/:user_id/files/:file_id
```

### Storage Summary

```
GET /users/:user_id/storage-summary
```

---

## 🧠 Concurrency Handling

Uploads run inside a single DB transaction and validate quota with locked reads, so multiple simultaneous uploads cannot exceed the 500 MB limit.

---

## 📈 Scaling Notes

- Run multiple instances behind a load balancer (stateless service)
- Use a DB connection pool
- Cache storage summaries in Redis if needed
- Partition/shard large tables if the file table grows very large
