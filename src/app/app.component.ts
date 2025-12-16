import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Root App Component
 * Main entry point for the application
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/">
            <i class="bi bi-clipboard-check me-2"></i>Survey App
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/surveys"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: false }"
                >
                  <i class="bi bi-list-ul me-1"></i>Survey List
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/survey-builder"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <i class="bi bi-plus-circle me-1"></i>Create Survey
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="container">
          <div class="text-center">
            <p class="mb-0">
              <i class="bi bi-clipboard-check me-2"></i>
              Survey App &copy; 2024 | Built with Angular & Bootstrap
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .navbar {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1rem 0;
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: 700;
      color: white !important;
      transition: transform 0.2s;
    }

    .navbar-brand:hover {
      transform: scale(1.05);
    }

    .navbar-brand i {
      font-size: 1.75rem;
      vertical-align: middle;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.85) !important;
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      margin: 0 0.25rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: white !important;
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      color: white !important;
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .app-footer {
      background: white;
      padding: 1.5rem 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
      margin-top: auto;
    }

    .app-footer p {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .app-footer i {
      color: #3498db;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem 0;
      }

      .navbar-nav {
        margin-top: 1rem;
      }

      .nav-link {
        margin: 0.25rem 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'Survey App';
}
