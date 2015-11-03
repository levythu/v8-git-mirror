// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax

"use strict";


function checkPrototypeChain(object, constructors) {
  var proto = object.__proto__;
  for (var i = 0; i < constructors.length; i++) {
    assertEquals(constructors[i].prototype, proto);
    assertEquals(constructors[i], proto.constructor);
    proto = proto.__proto__;
  }
}


(function() {
  class A extends Boolean {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A(true);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof Boolean);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, Boolean]);
  assertTrue(o.valueOf());
  assertEquals(42, o.a);

  var o1 = new A(false);
  assertTrue(%HaveSameMap(o, o1));
})();


function TestErrorSubclassing(error) {
  class A extends error {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A("message");
  assertTrue(o instanceof Object);
  assertTrue(o instanceof error);
  assertTrue(o instanceof Error);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  if (error == Error) {
    checkPrototypeChain(o, [A, Error, Object]);
  } else {
    checkPrototypeChain(o, [A, error, Error, Object]);
  }
  assertEquals("message", o.message);
  assertEquals(error.name + ": message", o.toString());
  assertEquals(42, o.a);

  var o1 = new A("achtung!");
  assertTrue(%HaveSameMap(o, o1));
}


(function() {
  TestErrorSubclassing(Error);
  TestErrorSubclassing(EvalError);
  TestErrorSubclassing(RangeError);
  TestErrorSubclassing(ReferenceError);
  TestErrorSubclassing(SyntaxError);
  TestErrorSubclassing(TypeError);
  TestErrorSubclassing(URIError);
})();


(function() {
  class A extends Number {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A(153);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof Number);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, Number, Object]);
  assertEquals(153, o.valueOf());
  assertEquals(42, o.a);

  var o1 = new A(312);
  assertTrue(%HaveSameMap(o, o1));
})();


(function() {
  class A extends Date {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A(1234567890);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof Date);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, Date, Object]);
  assertEquals(1234567890, o.getTime());
  assertEquals(42, o.a);

  var o1 = new A(2015, 10, 29);
  assertEquals(2015, o1.getFullYear());
  assertEquals(10, o1.getMonth());
  assertEquals(29, o1.getDate());
  assertTrue(%HaveSameMap(o, o1));
})();


(function() {
  class A extends String {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A("foo");
  assertTrue(o instanceof Object);
  assertTrue(o instanceof String);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, String, Object]);

  assertEquals("foo", o.valueOf());
  assertEquals(42, o.a);

  var o1 = new A("bar");
  assertTrue(%HaveSameMap(o, o1));
})();


(function() {
  class A extends RegExp {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A("o..h");
  assertTrue(o instanceof Object);
  assertTrue(o instanceof RegExp);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, RegExp, Object]);
  assertTrue(o.test("ouch"));
  assertEquals(42, o.a);

  var o1 = new A(7);
  assertTrue(%HaveSameMap(o, o1));
})();


function TestArraySubclassing(array) {
  class A extends array {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new array(13);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof array);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [array, Object]);
  assertEquals(13, o.length);

  var o = new A(10);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof array);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, array, Object]);
  assertEquals(10, o.length);
  assertEquals(42, o.a);

  var o1 = new A(7);
  assertTrue(%HaveSameMap(o, o1));
}


(function() {
  TestArraySubclassing(Array);
  TestArraySubclassing(Int8Array);
  TestArraySubclassing(Uint8Array);
  TestArraySubclassing(Uint8ClampedArray);
  TestArraySubclassing(Int16Array);
  TestArraySubclassing(Uint16Array);
  TestArraySubclassing(Int32Array);
  TestArraySubclassing(Uint32Array);
  TestArraySubclassing(Float32Array);
  TestArraySubclassing(Float64Array);
})();


(function() {
  class A extends ArrayBuffer {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var o = new A(16);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof ArrayBuffer);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, ArrayBuffer, Object]);

  assertEquals(16, o.byteLength);
  assertEquals(42, o.a);

  var o1 = new A("bar");
  assertTrue(%HaveSameMap(o, o1));


  class MyInt32Array extends Int32Array {
    constructor(v, name) {
      super(v);
      this.name = name;
    }
  }

  class MyUint32Array extends Uint32Array {
    constructor(v, name) {
      super(v);
      this.name = name;
    }
  }

  var int32view = new MyInt32Array(o, "cats");
  var uint32view = new MyUint32Array(o, "dogs");

  int32view[0] = -2;
  uint32view[1] = 0xffffffff;

  assertEquals("cats", int32view.name);
  assertEquals("dogs", uint32view.name);
  assertEquals(-2, int32view[0]);
  assertEquals(-1, int32view[1]);
  assertEquals(0xfffffffe, uint32view[0]);
  assertEquals(0xffffffff, uint32view[1]);
})();


(function() {
  class A extends DataView {
    constructor(...args) {
      assertTrue(%IsConstructCall());
      super(...args);
      this.a = 42;
    }
  }

  var buffer = new ArrayBuffer(16);
  var o = new A(buffer);
  assertTrue(o instanceof Object);
  assertTrue(o instanceof DataView);
  assertTrue(o instanceof A);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [A, DataView, Object]);

  o.setUint32(0, 0xcafebabe, false);
  assertEquals(0xcafebabe, o.getUint32(0, false));
  assertEquals(0xbebafeca, o.getUint32(0, true));
  assertEquals(42, o.a);

  var o1 = new A(buffer);
  assertTrue(%HaveSameMap(o, o1));

})();


(function() {
  class A extends Boolean {
    constructor() {
      assertTrue(%IsConstructCall());
      super(true);
      this.a00 = 0
      this.a01 = 0
      this.a02 = 0
      this.a03 = 0
      this.a04 = 0
      this.a05 = 0
      this.a06 = 0
      this.a07 = 0
      this.a08 = 0
      this.a09 = 0
      this.a10 = 0
      this.a11 = 0
      this.a12 = 0
      this.a13 = 0
      this.a14 = 0
      this.a15 = 0
      this.a16 = 0
      this.a17 = 0
      this.a18 = 0
      this.a19 = 0
    }
  }

  class B extends A {
    constructor() {
      assertTrue(%IsConstructCall());
      super();
      this.b00 = 0
      this.b01 = 0
      this.b02 = 0
      this.b03 = 0
      this.b04 = 0
      this.b05 = 0
      this.b06 = 0
      this.b07 = 0
      this.b08 = 0
      this.b09 = 0
      this.b10 = 0
      this.b11 = 0
      this.b12 = 0
      this.b13 = 0
      this.b14 = 0
      this.b15 = 0
      this.b16 = 0
      this.b17 = 0
      this.b18 = 0
      this.b19 = 0
    }
  }

  class C extends B {
    constructor() {
      assertTrue(%IsConstructCall());
      super();
      this.c00 = 0
      this.c01 = 0
      this.c02 = 0
      this.c03 = 0
      this.c04 = 0
      this.c05 = 0
      this.c06 = 0
      this.c07 = 0
      this.c08 = 0
      this.c09 = 0
      this.c10 = 0
      this.c11 = 0
      this.c12 = 0
      this.c13 = 0
      this.c14 = 0
      this.c15 = 0
      this.c16 = 0
      this.c17 = 0
      this.c18 = 0
      this.c19 = 0
    }
  }

  var o = new C();
  assertTrue(o instanceof Object);
  assertTrue(o instanceof Boolean);
  assertTrue(o instanceof A);
  assertTrue(o instanceof B);
  assertTrue(o instanceof C);
  assertEquals("object", typeof o);
  checkPrototypeChain(o, [C, B, A, Boolean, Object]);
})();


(function() {
  assertThrows("class A extends undefined {}");
  assertThrows("class B extends NaN {}");
  assertThrows("class C extends Infinity {}");
})();


(function() {
  class A extends null {}
  assertThrows("new A");
})();


(function() {
  class A extends Symbol {}
  assertThrows("new A");
})();
