import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authHomeLoginGuard } from './auth-home-login.guard';

describe('authHomeLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authHomeLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
