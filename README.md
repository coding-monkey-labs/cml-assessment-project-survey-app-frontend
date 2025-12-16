# Survey App - Angular Assessment

> ⚠️ **ASSESSMENT VERSION** - This application contains **5 intentional bugs** for developer evaluation.
>
> **For Candidates:** See [ASSESSMENT_INSTRUCTIONS.md](ASSESSMENT_INSTRUCTIONS.md) to get started.
>

---

A modern Angular-based survey application with survey builder and listing functionality.

## Features

- **Survey List**: View all available surveys
- **Survey Builder**: Create and edit surveys with various field types
  - Text Input fields
  - Multiple Choice questions
  - Radio Button options
- **In-Memory Database**: Mock backend for development

## Tech Stack

- Angular 18+
- Bootstrap 5
- TypeScript
- RxJS

## Architecture

### Modular Component Structure
- Self-sufficient, reusable components
- Clean separation of concerns
- Service-based data management

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── survey-list/          # Survey listing component
│   │   ├── survey-builder/       # Survey builder component
│   │   └── form-fields/          # Reusable form field components
│   ├── services/
│   │   ├── survey.service.ts     # Survey data operations
│   │   └── in-memory-data.service.ts  # Mock database
│   ├── models/
│   │   └── survey.model.ts       # Data models and interfaces
│   └── app.component.ts
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm start
   ```

3. Navigate to `http://localhost:4200/`

## Usage

- **View Surveys**: Click on "Survey List" to see all surveys
- **Create Survey**: Click on "Survey Builder" to create a new survey
- **Edit Survey**: Click edit button on any survey in the list
- **Delete Survey**: Click delete button to remove a survey

## Component Architecture

Each component is designed to be:
- **Self-sufficient**: Contains its own logic and styling
- **Reusable**: Can be used in multiple contexts
- **Testable**: Isolated and easy to unit test
- **Maintainable**: Clear structure and documentation
