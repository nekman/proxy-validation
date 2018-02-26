module.exports = class StringUtils {
  /**
   * @param {any} input
   * @return {boolean}
   */
  static isEmpty(input) {
    if (typeof input !== 'string') {
      return true;
    }

    return input.length === 0;
  }
};

