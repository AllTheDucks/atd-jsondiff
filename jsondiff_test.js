
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
    assertPatchMatches([{ "op": "replace", "path": "/foo/0", "value": "bar" }], patch);
}

function testReplaceArrayObjectElement() {
    var orig = { "foo": [{"bar":"fug"}]};
    var update = {"foo": [{"bar":"goo"}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/foo/0/bar", "value": "goo" }], patch);
}
function testReplaceSubArrayElement() {
    var orig = { "foo": [{"bar":"fug","num":["one"]}]};
    var update = {"foo": [{"bar":"fug", "num":["one","two"]}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/foo/0/num/1", "value": "two" }], patch);
}

function testRemoveArrayObjectElement() {
    var orig = { "foo": [{"bar":"fug","num":["one"]}]};
    var update = {"foo": []};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/0"}], patch);
}

function testRemoveMiddleArrayElement() {
    var orig = { "foo": ["bar","fug","num","one"]};
    var update = {"foo": ["bar","num","one"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/1"}], patch);
}

function testRemoveFirstArrayElement() {
    var orig = { "foo": ["bar","fug","num","one"]};
    var update = {"foo": ["fug","num","one"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/0"}], patch);
}
function testRemoveLastArrayElement() {
    var orig = { "foo": ["bar","fug","num","one"]};
    var update = {"foo": ["bar","fug","num"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/foo/3"}], patch);
}

function testSwapArrayElements() {
    var orig = { "foo": ["bar","fug"]};
    var update = { "foo": ["fug","bar"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "move", "from": "/foo/1", "path": "/foo/0"}], patch);
}
function testSwapArrayObjects() {
    var orig = { "people": [{"firstName":"Joe", "lastName":"Cool"},{"firstName":"Jane", "lastName":"Doe"}]};
    var update = { "people": [{"firstName":"Jane", "lastName":"Doe"},{"firstName":"Joe", "lastName":"Cool"}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "move", "from": "/people/1", "path": "/people/0"}], patch);
}

function testSwapAndInsertArrayElements() {
    var orig = { "foo": ["bar","fug"]};
    var update = { "foo": ["fug", "qug","bar"]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 2 operations', 2, patch.length);
    assertPatchMatches([{ "op": "move", "from": "/foo/1", "path": "/foo/0"},
      { "op": "add", "path": "/foo/1", "value": "qug" }], patch);
}

function testMoveAndDeleteArrayElements() {
    var orig = {"foo": ["a","b","c","d","e","f","g","h"]};
    var update = {"foo": ["b","e","d","f","a","g","h"]};

    var patch = atd.json.diff(orig, update);

    assertPatchMatches([{"op":"remove","path":"/foo/2"},
      {"op":"move","from":"/foo/1","path":"/foo/0"},
      {"op":"move","from":"/foo/3","path":"/foo/1"},
      {"op":"move","from":"/foo/3","path":"/foo/2"},
      {"op":"move","from":"/foo/4","path":"/foo/3"}], patch);    
}

function testMoveAddAndDeleteArrayElements() {
    var orig = {"foo":   ["a","b","c","d", "e","f","g","h"]};
    var update = {"foo": ["b","e","d","f", "l", "p","a","g","h"]};

    var patch = atd.json.diff(orig, update);

    assertPatchMatches([{"op":"remove","path":"/foo/2"},
      {"op":"move","from":"/foo/1","path":"/foo/0"},
      {"op":"move","from":"/foo/3","path":"/foo/1"},
      {"op":"move","from":"/foo/3","path":"/foo/2"},
      {"op":"move","from":"/foo/4","path":"/foo/3"},
      {"op":"add","path":"/foo/4","value":"l"},
      {"op":"add","path":"/foo/5","value":"p"}], patch);    

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
    assertPatchMatches([{ "op": "remove", "path": "/foo/zug"}], patch);
}

function testModifyArrayObject() {
    var orig = { "assessments": [{"id":"A1", "name":"Assignment One"}]};
    var update = { "assessments": [{"id":"A1", "name":"Assignment Two"}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/assessments/0/name", "value": "Assignment Two" }], patch);
}
function testAddArrayObject() {
    var orig = { "assessments": [{"id":"A1", "name":"Assignment One"}]};
    var update = { "assessments": [{"id":"A1", "name":"Assignment One"},{"id":"A2", "name":"Assignment Two"}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/assessments/1", 
      "value": {"id":"A2","name":"Assignment Two"}}], patch);
}
function testRemoveArrayObject() {
    var orig = { "assessments": [{"id":"A1", "name":"Assignment One"},{"id":"A2", "name":"Assignment Two"}]};
    var update = { "assessments": [{"id":"A1", "name":"Assignment One"}]};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/assessments/1"}], patch);
}

function testAddChildObject() {
    var orig = { };
    var update = { "person": {"firstName":"Joe", "lastName":"Cool"}};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "add", "path": "/person", 
      "value": {"firstName":"Joe","lastName":"Cool"} }], patch);
}
function testModifyChildObject() {
    var orig = { "person": {"firstName":"Joe", "lastName":"Bloggs"}};
    var update = { "person": {"firstName":"Joe", "lastName":"Cool"}};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "replace", "path": "/person/lastName", "value": "Cool" }], patch);
}
function testRemoveChildObject() {
    var orig = { "person": {"firstName":"Joe", "lastName":"Bloggs"}};
    var update = {};

    var patch = atd.json.diff(orig, update);

    assertEquals('Patch should have 1 operation', 1, patch.length);
    assertPatchMatches([{ "op": "remove", "path": "/person"}], patch);
}

function testReplaceStringWithObject() {
    var orig = {"name":"Joe Bloggs"};
    var update = { "name": {"first":"Joe", "last":"Bloggs"}};

    var patch = atd.json.diff(orig, update);

    var expectedPatch = [{ "op": "replace", "path": "/name", "value":{"first":"Joe","last":"Bloggs"}}];
    assertEquals('Patch should have '+expectedPatch.length+' operations', expectedPatch.length, patch.length);
    assertPatchMatches(expectedPatch, patch);
}

function testReplaceStringWithArray() {
    var orig = {"name":"Joe Bloggs"};
    var update = { "name": ["Joe", "Bloggs"]};

    var patch = atd.json.diff(orig, update);

    var expectedPatch = [{ "op": "replace", "path": "/name", "value":["Joe","Bloggs"]}];

    assertEquals('Patch should have '+expectedPatch.length+' operations', expectedPatch.length, patch.length);
    assertPatchMatches(expectedPatch, patch);
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
    assertEquals("from doesn't match", currExpected.from, currActual.from);
    if (typeof currExpected.value === 'object' || typeof currExpected.value === 'array') {
      assertTrue("value doesn't match", atd.json.subtreesEqual_(currExpected.value, currActual.value));
    } else {
      assertEquals("value doesn't match", currExpected.value, currActual.value);
    }
  }
}