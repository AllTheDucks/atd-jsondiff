goog.provide('atd.json');



/**
 * Produce a JSON diff between two javascript objects that conforms to the
 * RFC9602 specification.
 *
 * @param {*} orig The data in its original state.
 * @param {*} update The data in its modified state.
 * @param {string=} opt_parentPath The parent path, used for recursive calls.
 *
 * @return {Array.<Object>}
 */
atd.json.diff = function(orig, update, opt_parentPath) {
  var parentPath = opt_parentPath ? opt_parentPath : '';
  var patch = new Array();

  var patchEntry = {};

  if (Array.isArray(orig) && Array.isArray(update)) {
    patch = patch.concat(atd.json.diffArray_(orig, update,
      parentPath));
  } else if (orig !== null && typeof orig === 'object' &&
    update !== null && typeof update === 'object') {
    for (k in update) {

      if (!update.hasOwnProperty(k)) {
        continue;
      }
      var ov = orig[k];
      var uv = update[k];

      patch = patch.concat(atd.json.diff(ov, uv,
        parentPath + '/' + k));
    }
    for (k in orig) {
      if (!orig.hasOwnProperty(k) || update[k]) {
        continue;
      }
      var ov = orig[k];
      patch = patch.concat(atd.json.diff(ov, null,
        parentPath + '/' + k));
    }

  } else {
    if (orig === update) {
      return patch;
    } else if (orig == null || typeof orig === 'undefined') {
      patchEntry['op'] = 'add';
      patchEntry['path'] = parentPath;
      patchEntry['value'] = update;
      patch.push(patchEntry);
    } else if (update == null || typeof update === 'undefined') {
      patchEntry['op'] = 'remove';
      patchEntry['path'] = parentPath;
      patch.push(patchEntry);
    } else {
      patchEntry['op'] = 'replace';
      patchEntry['path'] = parentPath;
      patchEntry['value'] = update;
      patch.push(patchEntry);
    }
  }



  return patch;
};


/**
 * Perform a diff on an array.
 * @private
 *
 * @param {Array} origArray The Array in its original state.
 * @param {Array} updateArray The Array in its updated state.
 * @param {string=} opt_parentPath The parent path, used for recursive calls.
 *
 * @return {Array.<Object>}
 */
atd.json.diffArray_ = function(origArray, updateArray, opt_parentPath) {
  var patch = [];
  var origLength = origArray.length;
  var updateLength = updateArray.length;

  var origLocLookup = new Array();
  var newLocLookup = new Array();
  for (var i = 0; i < origLength; i++) {
    var newIdx = atd.json.findInArray_(origArray[i], updateArray);
    if (newIdx !== -1) {
      origLocLookup[newIdx] = i;
      newLocLookup[i] = newIdx;
    }
  }
  for (var i = 0; i < origLength; i++) {
    var newLoc = newLocLookup[i];
    if (typeof newLoc === 'undefined') {
      if (updateArray[i] && !origLocLookup[i]) {
        patch = patch.concat(atd.json.diff(origArray[i], updateArray[i],
            opt_parentPath + '/' + i));
      } else {
        patch = patch.concat(atd.json.diff(origArray[i], null,
            opt_parentPath + '/' + i));
      }
    }
  }
  for (var i = 0; i < updateLength; i++) {
    var origLoc = origLocLookup[i];
    if (typeof origLoc === 'undefined') {
      if (origArray[i] && !newLocLookup[i]) {
        continue;
      } else {
        patch = patch.concat(atd.json.diff(null, updateArray[i],
            opt_parentPath + '/' + i));
      }
    }
  }

  return patch;
};


/**
 * get the index of a value in an array
 *
 * @param {*} val the value to search for.
 * @param {Array} array the array to search in.
 * @param {number=} opt_start the index to start at
 *
 * @return {number}
 * @private
 */
atd.json.findInArray_ = function(val, array, opt_start) {
  var start = opt_start ? opt_start : 0;
  for (var i = start; i < array.length; i++) {
    if (atd.json.subtreesEqual_(val, array[i])) {
      return i;
    }
  }
  return -1;
};


/**
 * Compare two subtrees.
 * @param {*} valOne First value.
 * @param {*} valTwo Second Value.
 * @return {boolean}
 * @private
 */
atd.json.subtreesEqual_ = function(valOne, valTwo) {
  if (valOne !== null && typeof valOne === 'object' &&
    valTwo !== null && typeof valTwo === 'object') {
    var keysone = Object.keys(valOne);
    var keystwo = Object.keys(valTwo);
    if (keysone.length !== keystwo.length) {
      return false;
    }
    for (var i = 0; i < keysone.length; i++) {
      var k = keysone[i];
      if (!atd.json.subtreesEqual_(valOne[k], valTwo[k])) {
        return false;
      }
    }
    return true;
  } else if (Array.isArray(valOne) && Array.isArray(valTwo)) {
    if (valOne.length !== valTwo.length) {
      return false;
    }
    for (var i = 0; i < valOne.length; i++) {
      if (!atd.json.subtreesEqual_(valOne[i], valTwo[i])) {
        return false;
      }
    }
    return true;
  }
  return valOne === valTwo;

}
