import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private userId: string;
  private dateNow: number = Date.now();

  setUserId(id: string) {
    this.userId = id;
  }

  getUserId() {
    return this.userId;
  }

  getDateNow() {
    return this.dateNow;
  }
}
