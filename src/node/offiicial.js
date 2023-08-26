const TaskQueue = class {
  constructor() { this.queue = new Map(); }
  /**
* @param {function} func function, an async function must return a promise
* @param {function} then for async function
* @param {boolean} wait whether an async function should wait for execution to complete
* @param {args} ...args additional parameters for your function
*/
  add({ func, then, wait = false }, ...args) {
    if (typeof func != 'function') {
      console.error("The 'func' must be a function.");
      return;
    }
    this.queue.set(this.queue.size + 1, { func, wait, then, args });
  }

  async execute() {
    if (this.queue.size == 0) {
      console.log("RenderQueue is empty!");
      return;
    }

    const taskToRemove = [];

    for (const [key, task] of this.queue.entries()) {
      const { func, wait, then, args } = task;
      if (wait == true) {
        await func.apply(null, args).then(then);
        console.log("RenderQueue exec with await")
      } else {
        func.apply(null, args);
        console.log("RenderQueue exec");
      }
      taskToRemove.push(key);
    }

    for (const key of taskToRemove) {
      this.queue.delete(key);
    }

    return Promise.resolve("Tasks execution cmplete!")
  }

  delete(key) { this.queue.delete(key); }
  clear() { this.queue.clear(); }
}

module.exports = {
  TaskQueue: TaskQueue
};