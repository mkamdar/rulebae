# Dynamic Form Builder

A Laravel + React Vite application for building dynamic forms with drag-and-drop field arrangement and conditional rules.

## Features

- **Form Designer**: Create forms with drag-and-drop field arrangement
- **Field Types**: Support for text, email, number, select, radio, checkbox, textarea, and date fields
- **Conditional Rules**: Define rules like "if dropdown 1 equals value X, then show/hide/enable/disable/set options for dropdown 2"
- **Dynamic Form Rendering**: End users see forms with all rules applied in real-time
- **Validation**: Both frontend and backend validation

## Requirements

- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL >= 5.7

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dynamic-form-builder
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Update `.env` file with your database credentials**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dynamic_form_builder
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

## Development

1. **Start Laravel development server**
   ```bash
   php artisan serve
   ```

2. **Start Vite development server** (in another terminal)
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open http://localhost:8000 in your browser

## Usage

### Creating a Form

1. Navigate to the Designer page
2. Enter form name and description
3. Click "Create Form"
4. Add fields using the "Add Field" button
5. Configure each field (label, type, options, validation)
6. Drag and drop fields to reorder them
7. Add rules using the "Add Rule" button
8. Configure conditional logic (e.g., "If Field A equals 'X', then show Field B")
9. Save the form

### Viewing/Submitting a Form

1. Navigate to the Forms list
2. Click "View" on any form
3. Fill out the form - rules will be applied automatically
4. Submit the form

## API Endpoints

- `GET /api/forms` - List all forms
- `POST /api/forms` - Create a new form
- `GET /api/forms/{id}` - Get form details
- `PUT /api/forms/{id}` - Update form
- `DELETE /api/forms/{id}` - Delete form
- `POST /api/forms/{id}/fields` - Add field to form
- `PUT /api/forms/{id}/fields/{fieldId}` - Update field
- `DELETE /api/forms/{id}/fields/{fieldId}` - Delete field
- `POST /api/forms/{id}/fields/reorder` - Reorder fields
- `POST /api/forms/{id}/rules` - Add rule to form
- `PUT /api/forms/{id}/rules/{ruleId}` - Update rule
- `DELETE /api/forms/{id}/rules/{ruleId}` - Delete rule
- `POST /api/forms/{id}/submissions` - Submit form data

## Database Schema

- **forms**: Stores form metadata
- **form_fields**: Stores form field definitions
- **form_rules**: Stores conditional rules
- **form_submissions**: Stores form submissions

## Technologies Used

- **Backend**: Laravel 10
- **Frontend**: React 18, Vite
- **UI**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Database**: MySQL

## License

MIT
