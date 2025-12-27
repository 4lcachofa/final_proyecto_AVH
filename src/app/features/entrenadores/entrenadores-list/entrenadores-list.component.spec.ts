import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenadoresListComponent } from './entrenadores-list.component';

describe('EntrenadoresListComponent', () => {
  let component: EntrenadoresListComponent;
  let fixture: ComponentFixture<EntrenadoresListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenadoresListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntrenadoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
