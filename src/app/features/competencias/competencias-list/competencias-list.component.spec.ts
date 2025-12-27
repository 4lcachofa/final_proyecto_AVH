import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenciasListComponent } from './competencias-list.component';

describe('CompetenciasListComponent', () => {
  let component: CompetenciasListComponent;
  let fixture: ComponentFixture<CompetenciasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetenciasListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompetenciasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
