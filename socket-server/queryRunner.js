// TODO: one queue per socket connection Or project
class QueryQueue {
  constructor() {
    this.queue = [];
  }

  addToQueue(queryObj) {
    this.queue.push(queryObj);
  }

  async removeFirstQuery() {
    this.queue.shift();

    await this.runNextQuery();
  }

  async runNextQuery() {
    const queryObj = this.queue[0];
    if (!queryObj) {
      return;
    }

    try {
      const createdInstance = await queryObj.Model.create({
        patch_batch: queryObj.data.patch_batch,
        project_id: queryObj.data.projectId,
      });
      if (queryObj.callback) {
        queryObj.callback(null, createdInstance);
      }
    } catch (err) {
      console.error(err);
      if (queryObj.callback) {
        queryObj.callback(err, null);
      }
    }

    await this.removeFirstQuery();
  }
}

const queryQueue = new QueryQueue();

module.exports = function executeQuery(Model, data, callback) {
  queryQueue.addToQueue({ Model, data, callback });

  if (queryQueue.queue.length === 1) {
    queryQueue.runNextQuery();
  }
};
