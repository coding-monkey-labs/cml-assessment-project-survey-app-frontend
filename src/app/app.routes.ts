import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LinkListComponent } from './components/link-list/link-list.component';
import { LinkFormComponent } from './components/link-form/link-form.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ArchiveComponent } from './components/archive/archive.component';

/**
 * LinkHive Application Routes
 */
export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard | LinkHive'
  },
  {
    path: 'links',
    component: LinkListComponent,
    title: 'All Links | LinkHive'
  },
  {
    path: 'add',
    component: LinkFormComponent,
    title: 'Add Link | LinkHive'
  },
  {
    path: 'edit/:id',
    component: LinkFormComponent,
    title: 'Edit Link | LinkHive'
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    title: 'Categories | LinkHive'
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    title: 'Favorites | LinkHive'
  },
  {
    path: 'archive',
    component: ArchiveComponent,
    title: 'Archive | LinkHive'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
