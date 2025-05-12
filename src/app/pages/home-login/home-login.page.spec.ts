import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeLoginPage } from './home-login.page';

describe('HomeLoginPage', () => {
  let component: HomeLoginPage;
  let fixture: ComponentFixture<HomeLoginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
