import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntennaListingComponent } from './antenna-listing.component';

describe('AntennaListingComponent', () => {
  let component: AntennaListingComponent;
  let fixture: ComponentFixture<AntennaListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AntennaListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntennaListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
