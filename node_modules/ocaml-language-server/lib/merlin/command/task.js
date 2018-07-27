"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(task, token = null, enqueuedAt = new Date()) {
        this.task = task;
        this.token = token;
        this.enqueuedAt = enqueuedAt;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.js.map