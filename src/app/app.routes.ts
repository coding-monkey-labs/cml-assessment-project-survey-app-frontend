import { Routes } from '@angular/router';
import { SurveyListComponent } from './components/survey-list/survey-list.component';
import { SurveyBuilderComponent } from './components/survey-builder/survey-builder.component';

/**
 * Application Routes Configuration
 *
 * AssessmentToDo #4: ROUTING BUG
 * 
 * Issue: Clicking "Edit" on a survey doesn't load the survey data.
 * The edit page opens but shows a blank form instead of the survey details.
 * 
 * Fix: Ensure the route properly passes the survey ID to the component.
 * 
 * Hint: Check the edit route configuration - is it capturing the ID parameter?
 * Expected: Editing should load the survey with all its questions and details.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/surveys',
    pathMatch: 'full'
  },
  {
    path: 'surveys',
    component: SurveyListComponent,
    title: 'Survey List | Survey App'
  },
  {
    path: 'survey-builder',
    component: SurveyBuilderComponent,
    title: 'Create Survey | Survey App'
  },
  // BUG: Missing route parameter! Edit mode won't receive the survey ID.
  {
    path: 'survey-builder',  // Should be 'survey-builder/:id'
    component: SurveyBuilderComponent,
    title: 'Edit Survey | Survey App'
  },
  {
    path: '**',
    redirectTo: '/surveys'
  }
];
