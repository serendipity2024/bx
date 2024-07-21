module.exports = function (topicOffsets) {
  let highestOffset = 0;

  topicOffsets.forEach((topicOffset) => {
    if (topicOffset.high > highestOffset) {
      highestOffset = topicOffset.high;
    }
  });

  return highestOffset;
};
