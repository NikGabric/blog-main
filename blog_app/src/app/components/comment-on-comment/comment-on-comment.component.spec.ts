import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentOnCommentComponent } from './comment-on-comment.component';

describe('CommentOnCommentComponent', () => {
  let component: CommentOnCommentComponent;
  let fixture: ComponentFixture<CommentOnCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentOnCommentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentOnCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
