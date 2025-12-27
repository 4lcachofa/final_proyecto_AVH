import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LigasListComponent } from './ligas-list.component';

describe('LigasListComponent', () => {
  let component: LigasListComponent;
  let fixture: ComponentFixture<LigasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LigasListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LigasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
