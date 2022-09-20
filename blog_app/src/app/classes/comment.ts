export class Comment {
  'title': string;
  'author': string;
  'content': string;
  'id': string;
  'userId': string;
  'createdAt': string;
  'updatedAt': string;
  'allowEdit': boolean;
  'allowDelete': boolean;
  'upvoterIds': [];
  'downvoterIds': [];
  'parent': string;
  'level': number;
}
