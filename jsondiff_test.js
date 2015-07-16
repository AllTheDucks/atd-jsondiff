
goog.provide('atd.json.diffTest');
goog.setTestOnly('atd.json.diffTest');

goog.require('atd.json');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');


var expectedFailures;


function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();
}


/**
 * Unit test for atd.json.diff
 */
function testSimpleAdd() {
    var orig = { "foo": "bar"};
    var update = {"baz": "qux", "foo": "bar"};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/baz", "value": "qux" }], patch);
}
function testSimpleReplace() {
    var orig = { "foo": "bar", "baz": "zug"};
    var update = {"baz": "qux", "foo": "bar"};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/baz", "value": "qux" }], patch);
}

function testSimpleRemove() {
    var orig = { "foo": "bar", "baz": "zug"};
    var update = {"baz": "zug"};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo"}], patch);
}



function testAddArrayElement() {
    var orig = { "foo": ["bar"]};
    var update = {"foo": ["bar","qux"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/foo/1", "value": "qux" }], patch);
}

function assertPatchMatches(expected, actual) {
  for (var i = 0; i < expected.length; i++) {
    var currExpected = expected[i];
    var currActual = actual[i];
    assertEquals("op doesn't match", currExpected.op, currActual.op);
    assertEquals("path doesn't match", currExpected.path, currActual.path);
    assertEquals("value doesn't match", currExpected.path, currActual.path);
  }
}