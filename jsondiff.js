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

    patch = patch.concat(atd.json.diffObject_(orig, update, parentPath));

  } else {
    if (orig === update) {
      return patch;
    } else if (orig == null || !atd.isDef(orig)) {

      patchEntry['op'] = 'add';
      patchEntry['path'] = parentPath;
      patchEntry['value'] = update;
      patch.push(patchEntry);

    } else if (update == null || !atd.isDef(update)) {
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
 * Perform a diff on an Object.
 *
 * @param {Object} orig The Object in its original state.
 * @param {Object} update The Object in its updated state.
 * @param {string=} opt_parentPath The parent path, used for recursive calls.
 *
 * @return {Array.<Object>}
 * @private
 */
atd.json.diffObject_ = function(orig, update, opt_parentPath) {
  var patch = new Array();
  if (update) {
    for (k in update) {

        if (!update.hasOwnProperty(k)) {
          continue;
        }
        var ov = orig ? orig[k] : null;
        var uv = update[k];

        patch = patch.concat(atd.json.diff(ov, uv,
          opt_parentPath + '/' + k));
    }
  }
  if (orig) {
    for (k in orig) {
      if (!orig.hasOwnProperty(k) || atd.isDef(update[k])) {
        continue;
      }
      var ov = orig[k];
      patch = patch.concat(atd.json.diff(ov, null,
        opt_parentPath + '/' + k));
    }
  }
  return patch;
};

/**
 * Perform a diff on an array. The performance of this method is likely
 * to be less than optimal.
 *
 * @param {Array} origArray The Array in its original state.
 * @param {Array} updateArray The Array in its updated state.
 * @param {string=} opt_parentPath The parent path, used for recursive calls.
 *
 * @return {Array.<Object>}
 * @private
 */
atd.json.diffArray_ = function(origArray, updateArray, opt_parentPath) {
  var patch = new Array();
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

  var currState = new Array();
  for (var i = 0; i < origArray.length; i++) {
    currState[i] = i;
  }
  currState.getCurrLoc = function(origLoc) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === origLoc) {
        return i;
      }
    }
    return -1;
  };

  var delCount = 0;
  for (var i = 0; i < origLength; i++) {
    var newLoc = newLocLookup[i];
    if (!atd.isDef(newLoc)) {
      if (!(atd.isDef(updateArray[i]) && !atd.isDef(origLocLookup[i]))) {
        //remove the element
        patch = patch.concat(atd.json.diff(origArray[i], null,
            opt_parentPath + '/' + i));
        currState.splice(i - delCount, 1);
      }
    }
  }


  for (var i = 0; i < updateLength; i++) {
    var origLoc = origLocLookup[i];
    var newLoc = newLocLookup[origLoc];
    if (atd.isDef(origLoc)) {
      var currLoc = currState.getCurrLoc(origLoc);
      if (currLoc == i) {
        continue;
      }
      var patchEntry = {};
      patchEntry['op'] = 'move';
      patchEntry['from'] = opt_parentPath + '/' + currLoc;
      patchEntry['path'] = opt_parentPath + '/' + i;
      patch.push(patchEntry);

      currState.splice(currLoc, 1);
      currState.splice(i, 0, origLoc);
    } else {
      if (origArray[i] && !atd.isDef(newLocLookup[i])) {
        continue;
      } else {
        //add the element
        patch = patch.concat(atd.json.diff(null, updateArray[i],
            opt_parentPath + '/' + i));
        currState.splice(i, 0, 'added');
      }
    }
  }



  for (var i = 0; i < origLength; i++) {
    var newLoc = newLocLookup[i];
    if (!atd.isDef(newLoc)) {
      if (atd.isDef(updateArray[i]) && !atd.isDef(origLocLookup[i])) {
        // there's an element at the same index in the updated arr
        // and the updated element is not an element that was moved.
        // Update the element at i
        patch = patch.concat(atd.json.diff(origArray[i], updateArray[i],
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
};


/**
 * Copied from the closure library.  goog.isDef.  Copyright the closure authors.
 *
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
atd.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};
