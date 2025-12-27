import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JugadoresListComponent } from './jugadores-list.component';

describe('JugadoresListComponent', () => {
  let component: JugadoresListComponent;
  let fixture: ComponentFixture<JugadoresListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JugadoresListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JugadoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
