import { Injectable } from '@angular/core';
import { timer } from 'rxjs';

@Injectable()
export class FeatureService {
  obs$ = timer(2000);
}
