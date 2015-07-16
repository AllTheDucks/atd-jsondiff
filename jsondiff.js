goog.provide('atd.json');



atd.json.diff = function(orig, update) {
    var patch = new Array();
    for (k in update) {
        if (!update.hasOwnProperty(k)) {
            continue;
        }
        var patchEntry = {};
        if (!(typeof orig[k] === "undefined")) {
            var ov = orig[k];
            var uv = update[k];
            if (ov === uv) {
                continue;
            } else if (Array.isArray(ov) && Array.isArray(uv)) {
                patch = patch.concat(atd.json.diffArray_('/' + k, ov, uv));
                continue;
            } else {
                patchEntry['op'] = 'replace';
                patchEntry['path'] = '/' + k;
                patchEntry['value'] = update[k];
            }
            patch.push(patchEntry);
        } else { 
            patchEntry['op'] = 'add';
            patchEntry['path'] = '/' + k;
            patchEntry['value'] = update[k];
            patch.push(patchEntry);
        } 
    }
    for (k in orig) {
        if (!orig.hasOwnProperty(k)) {
            continue;
        }
        var patchEntry = {};
        if (typeof update[k] === "undefined") {
            patchEntry['op'] = 'remove';
            patchEntry['path'] = '/' + k;
            patch.push(patchEntry);
        }
    }
    return patch;
}

atd.json.diffArray_ = function(parentPath, origArray, updateArray) {
    var patch = [];
    for (var i = 0; i < origArray; i++) {
        var patchEntry = {};
        if (updateArray.length >= i) {
            var ov = origArray[i];
            var uv = updateArray[i];
            if (ov === uv) {
                continue;
            } else {
                patchEntry['op'] = 'replace';
                patchEntry['path'] = parentPath + '/' + i;
                patchEntry['value'] = update[i];
                patch.push(patchEntry);
            }
        }
    }
    if (origArray.length < updateArray.length) {
        for (var i = updateArray.length - origArray.length; i < updateArray.length; i++) {
            patchEntry = {};
            patchEntry['op'] = 'add';
            patchEntry['path'] = parentPath + '/' + i;
            patchEntry['value'] = updateArray[i];
            patch.push(patchEntry);
        }
    }
    if (origArray.length > updateArray.length) {
        for (var i = origArray.length - updateArray.length; i < origArray.length; i++) {
            patchEntry = {};
            patchEntry['op'] = 'remove';
            patchEntry['path'] = parentPath + '/' + i;
            patch.push(patchEntry);
        }
    }
    return patch;
}