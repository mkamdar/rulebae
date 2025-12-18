# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Update Database Configuration**
   Edit `.env` file:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dynamic_form_builder
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

4. **Create Database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE dynamic_form_builder;"
   ```

5. **Run Migrations**
   ```bash
   php artisan migrate
   ```

6. **Build Assets (Production)**
   ```bash
   npm run build
   ```

7. **Start Development Servers**
   
   Terminal 1 (Laravel):
   ```bash
   php artisan serve
   ```
   
   Terminal 2 (Vite):
   ```bash
   npm run dev
   ```

8. **Access Application**
   - Open http://localhost:8000 in your browser

## Development Workflow

- **Backend API**: Laravel runs on http://localhost:8000
- **Frontend Dev Server**: Vite runs on http://localhost:5173 (or configured port)
- **API Endpoints**: All API routes are prefixed with `/api`

## Project Structure

```
/workspace
├── app/
│   ├── Http/
│   │   ├── Controllers/     # API controllers
│   │   └── Middleware/      # CORS middleware
│   └── Models/              # Eloquent models
├── database/
│   └── migrations/          # Database migrations
├── resources/
│   ├── js/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   └── app.jsx          # Entry point
│   └── views/               # Blade templates
├── routes/
│   ├── api.php              # API routes
│   └── web.php              # Web routes
└── public/                  # Public assets
```

## Key Features

1. **Form Designer** (`/designer`)
   - Drag and drop fields
   - Configure field types and options
   - Define conditional rules

2. **Form List** (`/`)
   - View all created forms
   - Edit or view forms

3. **Form Viewer** (`/form/:id`)
   - Dynamic form rendering
   - Real-time rule application
   - Form submission

## Troubleshooting

- **CORS Issues**: Ensure CORS middleware is registered in `bootstrap/app.php`
- **Vite Not Loading**: Make sure Vite dev server is running
- **Database Connection**: Verify MySQL credentials in `.env`
- **Migration Errors**: Ensure database exists and user has proper permissions
