
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

function testRemoveArrayElementLast() {
    var orig = { "foo": ["bar", "qux"]};
    var update = {"foo": ["bar"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/1" }], patch);
}
function testRemoveArrayElementFirst() {
    var orig = { "foo": ["bar", "qux"]};
    var update = {"foo": ["qux"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/0" }], patch);
}

function testReplaceArrayElement() {
    var orig = { "foo": ["fug"]};
    var update = {"foo": ["bar"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/foo/0", "value": "fug" }], patch);
}


function testAddObjectProperty() {
    var orig = { "foo": {"bar": "qux"}};
    var update = {"foo": {"bar":"qux", "zug":"fizz"}};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/foo/zug", "value": "fizz" }], patch);
}

function testReplaceObjectProperty() {
    var orig = { "foo": {"bar": "qux"}};
    var update = {"foo": {"bar":"fizz"}};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/foo/bar", "value": "fizz" }], patch);
}

function testRemoveObjectProperty() {
    var orig = { "foo": {"bar": "fizz", "zug": "qux"}};
    var update = {"foo": {"bar":"fizz"}};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/zug", "value": "fizz" }], patch);
}


function testSimpleSubtreesEqual() {
    var a = { "foo": {"bar": "fizz"}};
    var b = {"foo": {"bar":"fizz"}};

    assertTrue(atd.json.subtreesEqual_(a, b));
}

function testSimpleSubtreesNotEqual() {
    var a = { "foo": {"bar": "zug"}};
    var b = {"foo": {"bar":"fizz"}};

    assertFalse(atd.json.subtreesEqual_(a, b));
}

function testArraySubtreesEqual() {
    var a = { "foo": [{"bar": "fizz"}]};
    var b = {"foo": [{"bar":"fizz"}]};

    assertTrue(atd.json.subtreesEqual_(a, b));
}

function testArraySubtreesNotEqual() {
    var a = { "foo": [{"foo": "fizz"}]};
    var b = {"foo": [{"bar":"fizz"}]};

    assertFalse(atd.json.subtreesEqual_(a, b));
}

function testArraySubtreesNotEqualNull() {
    var a = { "foo": [{"foo": null}]};
    var b = {"foo": [{"bar":"fizz"}]};

    assertFalse(atd.json.subtreesEqual_(a, b));
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