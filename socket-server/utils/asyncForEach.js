module.exports = async function asyncForEach(array, callback) {
  if (!array) {
    return;
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
