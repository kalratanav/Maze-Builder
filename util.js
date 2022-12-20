window.util = {
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },

  popRandom: function(array) {
    var index = Math.floor(Math.random() * array.length);
    return util.popIndex(array, index);
  },

  popIndex: function(array, index) {
    var lastIndex = array.length - 1;
    var tmp = array[index];
    array[index] = array[lastIndex];
    array[lastIndex] = tmp;
    return array.pop();
  },

  randomInt: function(lessThanThis) {
    return Math.floor(Math.random() * lessThanThis);
  },

  euclideanMod: function(numerator, denominator) {
    var result = numerator % denominator;
    if (result < 0) result += denominator;
    return result;
  },

  range: function(length) {
    var result = new Array(length);
    for (var i = 0; i < length; i++) {
      result[i] = i;
    }
    return result;
  },
};
