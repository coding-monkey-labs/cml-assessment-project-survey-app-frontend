import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * LinkHive App Component
 * Main entry point for the application
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Navigation Bar -->
      <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/">
            <div class="brand-icon">
              <i class="bi bi-hexagon-fill"></i>
            </div>
            <span class="brand-text">Link<span class="brand-accent">Hive</span></span>
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
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <i class="bi bi-house me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/links"
                  routerLinkActive="active"
                >
                  <i class="bi bi-collection me-1"></i>All Links
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/categories"
                  routerLinkActive="active"
                >
                  <i class="bi bi-folder me-1"></i>Categories
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/favorites"
                  routerLinkActive="active"
                >
                  <i class="bi bi-star me-1"></i>Favorites
                </a>
              </li>
            </ul>

            <div class="navbar-actions">
              <a routerLink="/add" class="btn btn-add">
                <i class="bi bi-plus-lg me-1"></i>
                <span>Add Link</span>
              </a>
            </div>
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
          <div class="footer-content">
            <div class="footer-brand">
              <i class="bi bi-hexagon-fill me-2"></i>
              <span>LinkHive</span>
            </div>
            <p class="footer-text">
              Smart bookmark & link management with AI-powered organization
            </p>
            <div class="footer-links">
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
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
      background: linear-gradient(135deg, #fef9c3 0%, #fef3c7 50%, #fed7aa 100%);
    }

    /* Navbar */
    .navbar {
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      padding: 0.75rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: transform 0.2s;
    }

    .navbar-brand:hover {
      transform: scale(1.02);
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .brand-accent {
      color: #f59e0b;
    }

    .navbar-toggler {
      border: none;
      padding: 0.5rem;
    }

    .navbar-toggler:focus {
      box-shadow: none;
    }

    .navbar-toggler-icon {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2831, 41, 55, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    .nav-link {
      color: #4b5563 !important;
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      margin: 0 0.125rem;
      border-radius: 8px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }

    .nav-link:hover {
      color: #f59e0b !important;
      background: #fef3c7;
    }

    .nav-link.active {
      color: #d97706 !important;
      background: #fef3c7;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-add {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-add:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 0;
    }

    /* Footer */
    .app-footer {
      background: white;
      padding: 2rem 0;
      margin-top: auto;
      border-top: 1px solid #e5e7eb;
    }

    .footer-content {
      text-align: center;
    }

    .footer-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f59e0b;
      margin-bottom: 0.5rem;
    }

    .footer-text {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }

    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #f59e0b;
    }

    /* Responsive */
    @media (max-width: 991px) {
      .navbar-collapse {
        padding: 1rem 0;
      }

      .navbar-nav {
        margin-bottom: 1rem;
      }

      .nav-link {
        padding: 0.75rem 1rem !important;
      }

      .navbar-actions {
        padding-top: 0.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .btn-add {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'LinkHive';
}
