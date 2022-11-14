import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { FeatureComponent } from './feature.component';
import { feature } from './feature.state';
import { FeatureService } from './feature.service';
import * as featureEffects from './feature.effects';
import * as appEffects from '../app.effects';

export const routes: Routes = [
  {
    path: '',
    component: FeatureComponent,
    providers: [
      FeatureService,
      provideState(feature),
      // make sure that already registered effects will not be registered again
      provideEffects(featureEffects, featureEffects, appEffects),
    ],
  },
];
