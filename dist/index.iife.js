var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function() {
  "use strict";
  /**
  * @vue/shared v3.5.27
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **/
  // @__NO_SIDE_EFFECTS__
  function makeMap(str) {
    const map = /* @__PURE__ */ Object.create(null);
    for (const key of str.split(","))
      map[key] = 1;
    return (val) => val in map;
  }
  const EMPTY_OBJ = {};
  const EMPTY_ARR = [];
  const NOOP = () => {
  };
  const NO = () => false;
  const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
  (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
  const isModelListener = (key) => key.startsWith("onUpdate:");
  const extend = Object.assign;
  const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
      arr.splice(i, 1);
    }
  };
  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
  const isArray = Array.isArray;
  const isMap = (val) => toTypeString(val) === "[object Map]";
  const isSet = (val) => toTypeString(val) === "[object Set]";
  const isFunction = (val) => typeof val === "function";
  const isString = (val) => typeof val === "string";
  const isSymbol = (val) => typeof val === "symbol";
  const isObject = (val) => val !== null && typeof val === "object";
  const isPromise = (val) => {
    return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
  };
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  const isPlainObject = (val) => toTypeString(val) === "[object Object]";
  const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  const isReservedProp = /* @__PURE__ */ makeMap(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  );
  const cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  const camelizeRE = /-\w/g;
  const camelize = cacheStringFunction(
    (str) => {
      return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
    }
  );
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = cacheStringFunction(
    (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
  );
  const capitalize = cacheStringFunction((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  const toHandlerKey = cacheStringFunction(
    (str) => {
      const s = str ? `on${capitalize(str)}` : ``;
      return s;
    }
  );
  const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
  const invokeArrayFns = (fns, ...arg) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i](...arg);
    }
  };
  const def = (obj, key, value, writable = false) => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      writable,
      value
    });
  };
  const looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  };
  let _globalThis;
  const getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  };
  function normalizeStyle(value) {
    if (isArray(value)) {
      const res = {};
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
        if (normalized) {
          for (const key in normalized) {
            res[key] = normalized[key];
          }
        }
      }
      return res;
    } else if (isString(value) || isObject(value)) {
      return value;
    }
  }
  const listDelimiterRE = /;(?![^(]*\))/g;
  const propertyDelimiterRE = /:([^]+)/;
  const styleCommentRE = /\/\*[^]*?\*\//g;
  function parseStringStyle(cssText) {
    const ret = {};
    cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }
  function normalizeClass(value) {
    let res = "";
    if (isString(value)) {
      res = value;
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const normalized = normalizeClass(value[i]);
        if (normalized) {
          res += normalized + " ";
        }
      }
    } else if (isObject(value)) {
      for (const name in value) {
        if (value[name]) {
          res += name + " ";
        }
      }
    }
    return res.trim();
  }
  const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
  function includeBooleanAttr(value) {
    return !!value || value === "";
  }
  const isRef$1 = (val) => {
    return !!(val && val["__v_isRef"] === true);
  };
  const toDisplayString = (val) => {
    return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
  };
  const replacer = (_key, val) => {
    if (isRef$1(val)) {
      return replacer(_key, val.value);
    } else if (isMap(val)) {
      return {
        [`Map(${val.size})`]: [...val.entries()].reduce(
          (entries, [key, val2], i) => {
            entries[stringifySymbol(key, i) + " =>"] = val2;
            return entries;
          },
          {}
        )
      };
    } else if (isSet(val)) {
      return {
        [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
      };
    } else if (isSymbol(val)) {
      return stringifySymbol(val);
    } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
      return String(val);
    }
    return val;
  };
  const stringifySymbol = (v, i = "") => {
    var _a;
    return (
      // Symbol.description in es2019+ so we need to cast here to pass
      // the lib: es2016 check
      isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
    );
  };
  /**
  * @vue/reactivity v3.5.27
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **/
  let activeEffectScope;
  class EffectScope {
    constructor(detached = false) {
      this.detached = detached;
      this._active = true;
      this._on = 0;
      this.effects = [];
      this.cleanups = [];
      this._isPaused = false;
      this.parent = activeEffectScope;
      if (!detached && activeEffectScope) {
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      }
    }
    get active() {
      return this._active;
    }
    pause() {
      if (this._active) {
        this._isPaused = true;
        let i, l;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].pause();
          }
        }
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].pause();
        }
      }
    }
    /**
     * Resumes the effect scope, including all child scopes and effects.
     */
    resume() {
      if (this._active) {
        if (this._isPaused) {
          this._isPaused = false;
          let i, l;
          if (this.scopes) {
            for (i = 0, l = this.scopes.length; i < l; i++) {
              this.scopes[i].resume();
            }
          }
          for (i = 0, l = this.effects.length; i < l; i++) {
            this.effects[i].resume();
          }
        }
      }
    }
    run(fn) {
      if (this._active) {
        const currentEffectScope = activeEffectScope;
        try {
          activeEffectScope = this;
          return fn();
        } finally {
          activeEffectScope = currentEffectScope;
        }
      }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
      if (++this._on === 1) {
        this.prevScope = activeEffectScope;
        activeEffectScope = this;
      }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
      if (this._on > 0 && --this._on === 0) {
        activeEffectScope = this.prevScope;
        this.prevScope = void 0;
      }
    }
    stop(fromParent) {
      if (this._active) {
        this._active = false;
        let i, l;
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].stop();
        }
        this.effects.length = 0;
        for (i = 0, l = this.cleanups.length; i < l; i++) {
          this.cleanups[i]();
        }
        this.cleanups.length = 0;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].stop(true);
          }
          this.scopes.length = 0;
        }
        if (!this.detached && this.parent && !fromParent) {
          const last = this.parent.scopes.pop();
          if (last && last !== this) {
            this.parent.scopes[this.index] = last;
            last.index = this.index;
          }
        }
        this.parent = void 0;
      }
    }
  }
  function getCurrentScope() {
    return activeEffectScope;
  }
  let activeSub;
  const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
  class ReactiveEffect {
    constructor(fn) {
      this.fn = fn;
      this.deps = void 0;
      this.depsTail = void 0;
      this.flags = 1 | 4;
      this.next = void 0;
      this.cleanup = void 0;
      this.scheduler = void 0;
      if (activeEffectScope && activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      }
    }
    pause() {
      this.flags |= 64;
    }
    resume() {
      if (this.flags & 64) {
        this.flags &= -65;
        if (pausedQueueEffects.has(this)) {
          pausedQueueEffects.delete(this);
          this.trigger();
        }
      }
    }
    /**
     * @internal
     */
    notify() {
      if (this.flags & 2 && !(this.flags & 32)) {
        return;
      }
      if (!(this.flags & 8)) {
        batch(this);
      }
    }
    run() {
      if (!(this.flags & 1)) {
        return this.fn();
      }
      this.flags |= 2;
      cleanupEffect(this);
      prepareDeps(this);
      const prevEffect = activeSub;
      const prevShouldTrack = shouldTrack;
      activeSub = this;
      shouldTrack = true;
      try {
        return this.fn();
      } finally {
        cleanupDeps(this);
        activeSub = prevEffect;
        shouldTrack = prevShouldTrack;
        this.flags &= -3;
      }
    }
    stop() {
      if (this.flags & 1) {
        for (let link = this.deps; link; link = link.nextDep) {
          removeSub(link);
        }
        this.deps = this.depsTail = void 0;
        cleanupEffect(this);
        this.onStop && this.onStop();
        this.flags &= -2;
      }
    }
    trigger() {
      if (this.flags & 64) {
        pausedQueueEffects.add(this);
      } else if (this.scheduler) {
        this.scheduler();
      } else {
        this.runIfDirty();
      }
    }
    /**
     * @internal
     */
    runIfDirty() {
      if (isDirty(this)) {
        this.run();
      }
    }
    get dirty() {
      return isDirty(this);
    }
  }
  let batchDepth = 0;
  let batchedSub;
  let batchedComputed;
  function batch(sub, isComputed = false) {
    sub.flags |= 8;
    if (isComputed) {
      sub.next = batchedComputed;
      batchedComputed = sub;
      return;
    }
    sub.next = batchedSub;
    batchedSub = sub;
  }
  function startBatch() {
    batchDepth++;
  }
  function endBatch() {
    if (--batchDepth > 0) {
      return;
    }
    if (batchedComputed) {
      let e = batchedComputed;
      batchedComputed = void 0;
      while (e) {
        const next = e.next;
        e.next = void 0;
        e.flags &= -9;
        e = next;
      }
    }
    let error;
    while (batchedSub) {
      let e = batchedSub;
      batchedSub = void 0;
      while (e) {
        const next = e.next;
        e.next = void 0;
        e.flags &= -9;
        if (e.flags & 1) {
          try {
            ;
            e.trigger();
          } catch (err) {
            if (!error)
              error = err;
          }
        }
        e = next;
      }
    }
    if (error)
      throw error;
  }
  function prepareDeps(sub) {
    for (let link = sub.deps; link; link = link.nextDep) {
      link.version = -1;
      link.prevActiveLink = link.dep.activeLink;
      link.dep.activeLink = link;
    }
  }
  function cleanupDeps(sub) {
    let head;
    let tail = sub.depsTail;
    let link = tail;
    while (link) {
      const prev = link.prevDep;
      if (link.version === -1) {
        if (link === tail)
          tail = prev;
        removeSub(link);
        removeDep(link);
      } else {
        head = link;
      }
      link.dep.activeLink = link.prevActiveLink;
      link.prevActiveLink = void 0;
      link = prev;
    }
    sub.deps = head;
    sub.depsTail = tail;
  }
  function isDirty(sub) {
    for (let link = sub.deps; link; link = link.nextDep) {
      if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
        return true;
      }
    }
    if (sub._dirty) {
      return true;
    }
    return false;
  }
  function refreshComputed(computed2) {
    if (computed2.flags & 4 && !(computed2.flags & 16)) {
      return;
    }
    computed2.flags &= -17;
    if (computed2.globalVersion === globalVersion) {
      return;
    }
    computed2.globalVersion = globalVersion;
    if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
      return;
    }
    computed2.flags |= 2;
    const dep = computed2.dep;
    const prevSub = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = computed2;
    shouldTrack = true;
    try {
      prepareDeps(computed2);
      const value = computed2.fn(computed2._value);
      if (dep.version === 0 || hasChanged(value, computed2._value)) {
        computed2.flags |= 128;
        computed2._value = value;
        dep.version++;
      }
    } catch (err) {
      dep.version++;
      throw err;
    } finally {
      activeSub = prevSub;
      shouldTrack = prevShouldTrack;
      cleanupDeps(computed2);
      computed2.flags &= -3;
    }
  }
  function removeSub(link, soft = false) {
    const { dep, prevSub, nextSub } = link;
    if (prevSub) {
      prevSub.nextSub = nextSub;
      link.prevSub = void 0;
    }
    if (nextSub) {
      nextSub.prevSub = prevSub;
      link.nextSub = void 0;
    }
    if (dep.subs === link) {
      dep.subs = prevSub;
      if (!prevSub && dep.computed) {
        dep.computed.flags &= -5;
        for (let l = dep.computed.deps; l; l = l.nextDep) {
          removeSub(l, true);
        }
      }
    }
    if (!soft && !--dep.sc && dep.map) {
      dep.map.delete(dep.key);
    }
  }
  function removeDep(link) {
    const { prevDep, nextDep } = link;
    if (prevDep) {
      prevDep.nextDep = nextDep;
      link.prevDep = void 0;
    }
    if (nextDep) {
      nextDep.prevDep = prevDep;
      link.nextDep = void 0;
    }
  }
  let shouldTrack = true;
  const trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function cleanupEffect(e) {
    const { cleanup } = e;
    e.cleanup = void 0;
    if (cleanup) {
      const prevSub = activeSub;
      activeSub = void 0;
      try {
        cleanup();
      } finally {
        activeSub = prevSub;
      }
    }
  }
  let globalVersion = 0;
  class Link {
    constructor(sub, dep) {
      this.sub = sub;
      this.dep = dep;
      this.version = dep.version;
      this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
    }
  }
  class Dep {
    // TODO isolatedDeclarations "__v_skip"
    constructor(computed2) {
      this.computed = computed2;
      this.version = 0;
      this.activeLink = void 0;
      this.subs = void 0;
      this.map = void 0;
      this.key = void 0;
      this.sc = 0;
      this.__v_skip = true;
    }
    track(debugInfo) {
      if (!activeSub || !shouldTrack || activeSub === this.computed) {
        return;
      }
      let link = this.activeLink;
      if (link === void 0 || link.sub !== activeSub) {
        link = this.activeLink = new Link(activeSub, this);
        if (!activeSub.deps) {
          activeSub.deps = activeSub.depsTail = link;
        } else {
          link.prevDep = activeSub.depsTail;
          activeSub.depsTail.nextDep = link;
          activeSub.depsTail = link;
        }
        addSub(link);
      } else if (link.version === -1) {
        link.version = this.version;
        if (link.nextDep) {
          const next = link.nextDep;
          next.prevDep = link.prevDep;
          if (link.prevDep) {
            link.prevDep.nextDep = next;
          }
          link.prevDep = activeSub.depsTail;
          link.nextDep = void 0;
          activeSub.depsTail.nextDep = link;
          activeSub.depsTail = link;
          if (activeSub.deps === link) {
            activeSub.deps = next;
          }
        }
      }
      return link;
    }
    trigger(debugInfo) {
      this.version++;
      globalVersion++;
      this.notify(debugInfo);
    }
    notify(debugInfo) {
      startBatch();
      try {
        if (false)
          ;
        for (let link = this.subs; link; link = link.prevSub) {
          if (link.sub.notify()) {
            ;
            link.sub.dep.notify();
          }
        }
      } finally {
        endBatch();
      }
    }
  }
  function addSub(link) {
    link.dep.sc++;
    if (link.sub.flags & 4) {
      const computed2 = link.dep.computed;
      if (computed2 && !link.dep.subs) {
        computed2.flags |= 4 | 16;
        for (let l = computed2.deps; l; l = l.nextDep) {
          addSub(l);
        }
      }
      const currentTail = link.dep.subs;
      if (currentTail !== link) {
        link.prevSub = currentTail;
        if (currentTail)
          currentTail.nextSub = link;
      }
      link.dep.subs = link;
    }
  }
  const targetMap$1 = /* @__PURE__ */ new WeakMap();
  const ITERATE_KEY = /* @__PURE__ */ Symbol(
    ""
  );
  const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
    ""
  );
  const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
    ""
  );
  function track(target, type, key) {
    if (shouldTrack && activeSub) {
      let depsMap = targetMap$1.get(target);
      if (!depsMap) {
        targetMap$1.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let dep = depsMap.get(key);
      if (!dep) {
        depsMap.set(key, dep = new Dep());
        dep.map = depsMap;
        dep.key = key;
      }
      {
        dep.track();
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap$1.get(target);
    if (!depsMap) {
      globalVersion++;
      return;
    }
    const run2 = (dep) => {
      if (dep) {
        {
          dep.trigger();
        }
      }
    };
    startBatch();
    if (type === "clear") {
      depsMap.forEach(run2);
    } else {
      const targetIsArray = isArray(target);
      const isArrayIndex = targetIsArray && isIntegerKey(key);
      if (targetIsArray && key === "length") {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key2) => {
          if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
            run2(dep);
          }
        });
      } else {
        if (key !== void 0 || depsMap.has(void 0)) {
          run2(depsMap.get(key));
        }
        if (isArrayIndex) {
          run2(depsMap.get(ARRAY_ITERATE_KEY));
        }
        switch (type) {
          case "add":
            if (!targetIsArray) {
              run2(depsMap.get(ITERATE_KEY));
              if (isMap(target)) {
                run2(depsMap.get(MAP_KEY_ITERATE_KEY));
              }
            } else if (isArrayIndex) {
              run2(depsMap.get("length"));
            }
            break;
          case "delete":
            if (!targetIsArray) {
              run2(depsMap.get(ITERATE_KEY));
              if (isMap(target)) {
                run2(depsMap.get(MAP_KEY_ITERATE_KEY));
              }
            }
            break;
          case "set":
            if (isMap(target)) {
              run2(depsMap.get(ITERATE_KEY));
            }
            break;
        }
      }
    }
    endBatch();
  }
  function reactiveReadArray(array) {
    const raw = /* @__PURE__ */ toRaw(array);
    if (raw === array)
      return raw;
    track(raw, "iterate", ARRAY_ITERATE_KEY);
    return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
  }
  function shallowReadArray(arr) {
    track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
    return arr;
  }
  function toWrapped(target, item) {
    if (/* @__PURE__ */ isReadonly(target)) {
      return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
    }
    return toReactive(item);
  }
  const arrayInstrumentations = {
    __proto__: null,
    [Symbol.iterator]() {
      return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
    },
    concat(...args) {
      return reactiveReadArray(this).concat(
        ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
      );
    },
    entries() {
      return iterator(this, "entries", (value) => {
        value[1] = toWrapped(this, value[1]);
        return value;
      });
    },
    every(fn, thisArg) {
      return apply(this, "every", fn, thisArg, void 0, arguments);
    },
    filter(fn, thisArg) {
      return apply(
        this,
        "filter",
        fn,
        thisArg,
        (v) => v.map((item) => toWrapped(this, item)),
        arguments
      );
    },
    find(fn, thisArg) {
      return apply(
        this,
        "find",
        fn,
        thisArg,
        (item) => toWrapped(this, item),
        arguments
      );
    },
    findIndex(fn, thisArg) {
      return apply(this, "findIndex", fn, thisArg, void 0, arguments);
    },
    findLast(fn, thisArg) {
      return apply(
        this,
        "findLast",
        fn,
        thisArg,
        (item) => toWrapped(this, item),
        arguments
      );
    },
    findLastIndex(fn, thisArg) {
      return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
    },
    // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
    forEach(fn, thisArg) {
      return apply(this, "forEach", fn, thisArg, void 0, arguments);
    },
    includes(...args) {
      return searchProxy(this, "includes", args);
    },
    indexOf(...args) {
      return searchProxy(this, "indexOf", args);
    },
    join(separator) {
      return reactiveReadArray(this).join(separator);
    },
    // keys() iterator only reads `length`, no optimization required
    lastIndexOf(...args) {
      return searchProxy(this, "lastIndexOf", args);
    },
    map(fn, thisArg) {
      return apply(this, "map", fn, thisArg, void 0, arguments);
    },
    pop() {
      return noTracking(this, "pop");
    },
    push(...args) {
      return noTracking(this, "push", args);
    },
    reduce(fn, ...args) {
      return reduce(this, "reduce", fn, args);
    },
    reduceRight(fn, ...args) {
      return reduce(this, "reduceRight", fn, args);
    },
    shift() {
      return noTracking(this, "shift");
    },
    // slice could use ARRAY_ITERATE but also seems to beg for range tracking
    some(fn, thisArg) {
      return apply(this, "some", fn, thisArg, void 0, arguments);
    },
    splice(...args) {
      return noTracking(this, "splice", args);
    },
    toReversed() {
      return reactiveReadArray(this).toReversed();
    },
    toSorted(comparer) {
      return reactiveReadArray(this).toSorted(comparer);
    },
    toSpliced(...args) {
      return reactiveReadArray(this).toSpliced(...args);
    },
    unshift(...args) {
      return noTracking(this, "unshift", args);
    },
    values() {
      return iterator(this, "values", (item) => toWrapped(this, item));
    }
  };
  function iterator(self2, method, wrapValue) {
    const arr = shallowReadArray(self2);
    const iter = arr[method]();
    if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
      iter._next = iter.next;
      iter.next = () => {
        const result = iter._next();
        if (!result.done) {
          result.value = wrapValue(result.value);
        }
        return result;
      };
    }
    return iter;
  }
  const arrayProto = Array.prototype;
  function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
    const arr = shallowReadArray(self2);
    const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
    const methodFn = arr[method];
    if (methodFn !== arrayProto[method]) {
      const result2 = methodFn.apply(self2, args);
      return needsWrap ? toReactive(result2) : result2;
    }
    let wrappedFn = fn;
    if (arr !== self2) {
      if (needsWrap) {
        wrappedFn = function(item, index) {
          return fn.call(this, toWrapped(self2, item), index, self2);
        };
      } else if (fn.length > 2) {
        wrappedFn = function(item, index) {
          return fn.call(this, item, index, self2);
        };
      }
    }
    const result = methodFn.call(arr, wrappedFn, thisArg);
    return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
  }
  function reduce(self2, method, fn, args) {
    const arr = shallowReadArray(self2);
    let wrappedFn = fn;
    if (arr !== self2) {
      if (!/* @__PURE__ */ isShallow(self2)) {
        wrappedFn = function(acc, item, index) {
          return fn.call(this, acc, toWrapped(self2, item), index, self2);
        };
      } else if (fn.length > 3) {
        wrappedFn = function(acc, item, index) {
          return fn.call(this, acc, item, index, self2);
        };
      }
    }
    return arr[method](wrappedFn, ...args);
  }
  function searchProxy(self2, method, args) {
    const arr = /* @__PURE__ */ toRaw(self2);
    track(arr, "iterate", ARRAY_ITERATE_KEY);
    const res = arr[method](...args);
    if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
      args[0] = /* @__PURE__ */ toRaw(args[0]);
      return arr[method](...args);
    }
    return res;
  }
  function noTracking(self2, method, args = []) {
    pauseTracking();
    startBatch();
    const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
    endBatch();
    resetTracking();
    return res;
  }
  const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  const builtInSymbols = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
  );
  function hasOwnProperty(key) {
    if (!isSymbol(key))
      key = String(key);
    const obj = /* @__PURE__ */ toRaw(this);
    track(obj, "has", key);
    return obj.hasOwnProperty(key);
  }
  class BaseReactiveHandler {
    constructor(_isReadonly = false, _isShallow = false) {
      this._isReadonly = _isReadonly;
      this._isShallow = _isShallow;
    }
    get(target, key, receiver) {
      if (key === "__v_skip")
        return target["__v_skip"];
      const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_isShallow") {
        return isShallow2;
      } else if (key === "__v_raw") {
        if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
        // this means the receiver is a user proxy of the reactive proxy
        Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
          return target;
        }
        return;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly2) {
        let fn;
        if (targetIsArray && (fn = arrayInstrumentations[key])) {
          return fn;
        }
        if (key === "hasOwnProperty") {
          return hasOwnProperty;
        }
      }
      const res = Reflect.get(
        target,
        key,
        // if this is a proxy wrapping a ref, return methods using the raw ref
        // as receiver so that we don't have to call `toRaw` on the ref in all
        // its class methods
        /* @__PURE__ */ isRef(target) ? target : receiver
      );
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly2) {
        track(target, "get", key);
      }
      if (isShallow2) {
        return res;
      }
      if (/* @__PURE__ */ isRef(res)) {
        const value = targetIsArray && isIntegerKey(key) ? res : res.value;
        return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
      }
      if (isObject(res)) {
        return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
      }
      return res;
    }
  }
  class MutableReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(false, isShallow2);
    }
    set(target, key, value, receiver) {
      let oldValue = target[key];
      const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
      if (!this._isShallow) {
        const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
        if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          oldValue = /* @__PURE__ */ toRaw(oldValue);
          value = /* @__PURE__ */ toRaw(value);
        }
        if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
          if (isOldValueReadonly) {
            return true;
          } else {
            oldValue.value = value;
            return true;
          }
        }
      }
      const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(
        target,
        key,
        value,
        /* @__PURE__ */ isRef(target) ? target : receiver
      );
      if (target === /* @__PURE__ */ toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
      }
      return result;
    }
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      target[key];
      const result = Reflect.deleteProperty(target, key);
      if (result && hadKey) {
        trigger(target, "delete", key, void 0);
      }
      return result;
    }
    has(target, key) {
      const result = Reflect.has(target, key);
      if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has", key);
      }
      return result;
    }
    ownKeys(target) {
      track(
        target,
        "iterate",
        isArray(target) ? "length" : ITERATE_KEY
      );
      return Reflect.ownKeys(target);
    }
  }
  class ReadonlyReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(true, isShallow2);
    }
    set(target, key) {
      return true;
    }
    deleteProperty(target, key) {
      return true;
    }
  }
  const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
  const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
  const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
  const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
  const toShallow = (value) => value;
  const getProto = (v) => Reflect.getPrototypeOf(v);
  function createIterableMethod(method, isReadonly2, isShallow2) {
    return function(...args) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(
        rawTarget,
        "iterate",
        isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
      );
      return extend(
        // inheriting all iterator properties
        Object.create(innerIterator),
        {
          // iterator protocol
          next() {
            const { value, done } = innerIterator.next();
            return done ? { value, done } : {
              value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
              done
            };
          }
        }
      );
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      return type === "delete" ? false : type === "clear" ? void 0 : this;
    };
  }
  function createInstrumentations(readonly2, shallow) {
    const instrumentations = {
      get(key) {
        const target = this["__v_raw"];
        const rawTarget = /* @__PURE__ */ toRaw(target);
        const rawKey = /* @__PURE__ */ toRaw(key);
        if (!readonly2) {
          if (hasChanged(key, rawKey)) {
            track(rawTarget, "get", key);
          }
          track(rawTarget, "get", rawKey);
        }
        const { has } = getProto(rawTarget);
        const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
        if (has.call(rawTarget, key)) {
          return wrap(target.get(key));
        } else if (has.call(rawTarget, rawKey)) {
          return wrap(target.get(rawKey));
        } else if (target !== rawTarget) {
          target.get(key);
        }
      },
      get size() {
        const target = this["__v_raw"];
        !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
        return target.size;
      },
      has(key) {
        const target = this["__v_raw"];
        const rawTarget = /* @__PURE__ */ toRaw(target);
        const rawKey = /* @__PURE__ */ toRaw(key);
        if (!readonly2) {
          if (hasChanged(key, rawKey)) {
            track(rawTarget, "has", key);
          }
          track(rawTarget, "has", rawKey);
        }
        return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
      },
      forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw"];
        const rawTarget = /* @__PURE__ */ toRaw(target);
        const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
        !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
        return target.forEach((value, key) => {
          return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
      }
    };
    extend(
      instrumentations,
      readonly2 ? {
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear")
      } : {
        add(value) {
          if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
            value = /* @__PURE__ */ toRaw(value);
          }
          const target = /* @__PURE__ */ toRaw(this);
          const proto = getProto(target);
          const hadKey = proto.has.call(target, value);
          if (!hadKey) {
            target.add(value);
            trigger(target, "add", value, value);
          }
          return this;
        },
        set(key, value) {
          if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
            value = /* @__PURE__ */ toRaw(value);
          }
          const target = /* @__PURE__ */ toRaw(this);
          const { has, get: get2 } = getProto(target);
          let hadKey = has.call(target, key);
          if (!hadKey) {
            key = /* @__PURE__ */ toRaw(key);
            hadKey = has.call(target, key);
          }
          const oldValue = get2.call(target, key);
          target.set(key, value);
          if (!hadKey) {
            trigger(target, "add", key, value);
          } else if (hasChanged(value, oldValue)) {
            trigger(target, "set", key, value);
          }
          return this;
        },
        delete(key) {
          const target = /* @__PURE__ */ toRaw(this);
          const { has, get: get2 } = getProto(target);
          let hadKey = has.call(target, key);
          if (!hadKey) {
            key = /* @__PURE__ */ toRaw(key);
            hadKey = has.call(target, key);
          }
          get2 ? get2.call(target, key) : void 0;
          const result = target.delete(key);
          if (hadKey) {
            trigger(target, "delete", key, void 0);
          }
          return result;
        },
        clear() {
          const target = /* @__PURE__ */ toRaw(this);
          const hadItems = target.size !== 0;
          const result = target.clear();
          if (hadItems) {
            trigger(
              target,
              "clear",
              void 0,
              void 0
            );
          }
          return result;
        }
      }
    );
    const iteratorMethods = [
      "keys",
      "values",
      "entries",
      Symbol.iterator
    ];
    iteratorMethods.forEach((method) => {
      instrumentations[method] = createIterableMethod(method, readonly2, shallow);
    });
    return instrumentations;
  }
  function createInstrumentationGetter(isReadonly2, shallow) {
    const instrumentations = createInstrumentations(isReadonly2, shallow);
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(
        hasOwn(instrumentations, key) && key in target ? instrumentations : target,
        key,
        receiver
      );
    };
  }
  const mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
  };
  const shallowCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, true)
  };
  const readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
  };
  const shallowReadonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, true)
  };
  const reactiveMap = /* @__PURE__ */ new WeakMap();
  const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  const readonlyMap = /* @__PURE__ */ new WeakMap();
  const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  // @__NO_SIDE_EFFECTS__
  function reactive(target) {
    if (/* @__PURE__ */ isReadonly(target)) {
      return target;
    }
    return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }
  // @__NO_SIDE_EFFECTS__
  function shallowReactive(target) {
    return createReactiveObject(
      target,
      false,
      shallowReactiveHandlers,
      shallowCollectionHandlers,
      shallowReactiveMap
    );
  }
  // @__NO_SIDE_EFFECTS__
  function readonly(target) {
    return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap
    );
  }
  // @__NO_SIDE_EFFECTS__
  function shallowReadonly(target) {
    return createReactiveObject(
      target,
      true,
      shallowReadonlyHandlers,
      shallowReadonlyCollectionHandlers,
      shallowReadonlyMap
    );
  }
  function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      return target;
    }
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
      return target;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const proxy = new Proxy(
      target,
      targetType === 2 ? collectionHandlers : baseHandlers
    );
    proxyMap.set(target, proxy);
    return proxy;
  }
  // @__NO_SIDE_EFFECTS__
  function isReactive(value) {
    if (/* @__PURE__ */ isReadonly(value)) {
      return /* @__PURE__ */ isReactive(value["__v_raw"]);
    }
    return !!(value && value["__v_isReactive"]);
  }
  // @__NO_SIDE_EFFECTS__
  function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
  }
  // @__NO_SIDE_EFFECTS__
  function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
  }
  // @__NO_SIDE_EFFECTS__
  function isProxy(value) {
    return value ? !!value["__v_raw"] : false;
  }
  // @__NO_SIDE_EFFECTS__
  function toRaw(observed) {
    const raw = observed && observed["__v_raw"];
    return raw ? /* @__PURE__ */ toRaw(raw) : observed;
  }
  function markRaw(value) {
    if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
      def(value, "__v_skip", true);
    }
    return value;
  }
  const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
  const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
  // @__NO_SIDE_EFFECTS__
  function isRef(r) {
    return r ? r["__v_isRef"] === true : false;
  }
  // @__NO_SIDE_EFFECTS__
  function ref(value) {
    return createRef(value, false);
  }
  function createRef(rawValue, shallow) {
    if (/* @__PURE__ */ isRef(rawValue)) {
      return rawValue;
    }
    return new RefImpl(rawValue, shallow);
  }
  class RefImpl {
    constructor(value, isShallow2) {
      this.dep = new Dep();
      this["__v_isRef"] = true;
      this["__v_isShallow"] = false;
      this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
      this._value = isShallow2 ? value : toReactive(value);
      this["__v_isShallow"] = isShallow2;
    }
    get value() {
      {
        this.dep.track();
      }
      return this._value;
    }
    set value(newValue) {
      const oldValue = this._rawValue;
      const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
      newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
      if (hasChanged(newValue, oldValue)) {
        this._rawValue = newValue;
        this._value = useDirectValue ? newValue : toReactive(newValue);
        {
          this.dep.trigger();
        }
      }
    }
  }
  function unref(ref2) {
    return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
  }
  const shallowUnwrapHandlers = {
    get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
      const oldValue = target[key];
      if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  };
  function proxyRefs(objectWithRefs) {
    return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
  }
  class ComputedRefImpl {
    constructor(fn, setter, isSSR) {
      this.fn = fn;
      this.setter = setter;
      this._value = void 0;
      this.dep = new Dep(this);
      this.__v_isRef = true;
      this.deps = void 0;
      this.depsTail = void 0;
      this.flags = 16;
      this.globalVersion = globalVersion - 1;
      this.next = void 0;
      this.effect = this;
      this["__v_isReadonly"] = !setter;
      this.isSSR = isSSR;
    }
    /**
     * @internal
     */
    notify() {
      this.flags |= 16;
      if (!(this.flags & 8) && // avoid infinite self recursion
      activeSub !== this) {
        batch(this, true);
        return true;
      }
    }
    get value() {
      const link = this.dep.track();
      refreshComputed(this);
      if (link) {
        link.version = this.dep.version;
      }
      return this._value;
    }
    set value(newValue) {
      if (this.setter) {
        this.setter(newValue);
      }
    }
  }
  // @__NO_SIDE_EFFECTS__
  function computed$1(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
      getter = getterOrOptions;
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, isSSR);
    return cRef;
  }
  const INITIAL_WATCHER_VALUE = {};
  const cleanupMap = /* @__PURE__ */ new WeakMap();
  let activeWatcher = void 0;
  function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
    if (owner) {
      let cleanups = cleanupMap.get(owner);
      if (!cleanups)
        cleanupMap.set(owner, cleanups = []);
      cleanups.push(cleanupFn);
    }
  }
  function watch$1(source, cb, options = EMPTY_OBJ) {
    const { immediate, deep, once, scheduler, augmentJob, call } = options;
    const reactiveGetter = (source2) => {
      if (deep)
        return source2;
      if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
        return traverse(source2, 1);
      return traverse(source2);
    };
    let effect;
    let getter;
    let cleanup;
    let boundCleanup;
    let forceTrigger = false;
    let isMultiSource = false;
    if (/* @__PURE__ */ isRef(source)) {
      getter = () => source.value;
      forceTrigger = /* @__PURE__ */ isShallow(source);
    } else if (/* @__PURE__ */ isReactive(source)) {
      getter = () => reactiveGetter(source);
      forceTrigger = true;
    } else if (isArray(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
      getter = () => source.map((s) => {
        if (/* @__PURE__ */ isRef(s)) {
          return s.value;
        } else if (/* @__PURE__ */ isReactive(s)) {
          return reactiveGetter(s);
        } else if (isFunction(s)) {
          return call ? call(s, 2) : s();
        } else
          ;
      });
    } else if (isFunction(source)) {
      if (cb) {
        getter = call ? () => call(source, 2) : source;
      } else {
        getter = () => {
          if (cleanup) {
            pauseTracking();
            try {
              cleanup();
            } finally {
              resetTracking();
            }
          }
          const currentEffect = activeWatcher;
          activeWatcher = effect;
          try {
            return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
          } finally {
            activeWatcher = currentEffect;
          }
        };
      }
    } else {
      getter = NOOP;
    }
    if (cb && deep) {
      const baseGetter = getter;
      const depth = deep === true ? Infinity : deep;
      getter = () => traverse(baseGetter(), depth);
    }
    const scope = getCurrentScope();
    const watchHandle = () => {
      effect.stop();
      if (scope && scope.active) {
        remove(scope.effects, effect);
      }
    };
    if (once && cb) {
      const _cb = cb;
      cb = (...args) => {
        _cb(...args);
        watchHandle();
      };
    }
    let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    const job = (immediateFirstRun) => {
      if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) {
        return;
      }
      if (cb) {
        const newValue = effect.run();
        if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
          if (cleanup) {
            cleanup();
          }
          const currentWatcher = activeWatcher;
          activeWatcher = effect;
          try {
            const args = [
              newValue,
              // pass undefined as the old value when it's changed for the first time
              oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
              boundCleanup
            ];
            oldValue = newValue;
            call ? call(cb, 3, args) : (
              // @ts-expect-error
              cb(...args)
            );
          } finally {
            activeWatcher = currentWatcher;
          }
        }
      } else {
        effect.run();
      }
    };
    if (augmentJob) {
      augmentJob(job);
    }
    effect = new ReactiveEffect(getter);
    effect.scheduler = scheduler ? () => scheduler(job, false) : job;
    boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
    cleanup = effect.onStop = () => {
      const cleanups = cleanupMap.get(effect);
      if (cleanups) {
        if (call) {
          call(cleanups, 4);
        } else {
          for (const cleanup2 of cleanups)
            cleanup2();
        }
        cleanupMap.delete(effect);
      }
    };
    if (cb) {
      if (immediate) {
        job(true);
      } else {
        oldValue = effect.run();
      }
    } else if (scheduler) {
      scheduler(job.bind(null, true), true);
    } else {
      effect.run();
    }
    watchHandle.pause = effect.pause.bind(effect);
    watchHandle.resume = effect.resume.bind(effect);
    watchHandle.stop = watchHandle;
    return watchHandle;
  }
  function traverse(value, depth = Infinity, seen) {
    if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
      return value;
    }
    seen = seen || /* @__PURE__ */ new Map();
    if ((seen.get(value) || 0) >= depth) {
      return value;
    }
    seen.set(value, depth);
    depth--;
    if (/* @__PURE__ */ isRef(value)) {
      traverse(value.value, depth, seen);
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], depth, seen);
      }
    } else if (isSet(value) || isMap(value)) {
      value.forEach((v) => {
        traverse(v, depth, seen);
      });
    } else if (isPlainObject(value)) {
      for (const key in value) {
        traverse(value[key], depth, seen);
      }
      for (const key of Object.getOwnPropertySymbols(value)) {
        if (Object.prototype.propertyIsEnumerable.call(value, key)) {
          traverse(value[key], depth, seen);
        }
      }
    }
    return value;
  }
  /**
  * @vue/runtime-core v3.5.27
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **/
  const stack = [];
  let isWarning = false;
  function warn$1(msg, ...args) {
    if (isWarning)
      return;
    isWarning = true;
    pauseTracking();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
      callWithErrorHandling(
        appWarnHandler,
        instance,
        11,
        [
          // eslint-disable-next-line no-restricted-syntax
          msg + args.map((a) => {
            var _a, _b;
            return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
          }).join(""),
          instance && instance.proxy,
          trace.map(
            ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
          ).join("\n"),
          trace
        ]
      );
    } else {
      const warnArgs = [`[Vue warn]: ${msg}`, ...args];
      if (trace.length && // avoid spamming console during tests
      true) {
        warnArgs.push(`
`, ...formatTrace(trace));
      }
      console.warn(...warnArgs);
    }
    resetTracking();
    isWarning = false;
  }
  function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
      return [];
    }
    const normalizedStack = [];
    while (currentVNode) {
      const last = normalizedStack[0];
      if (last && last.vnode === currentVNode) {
        last.recurseCount++;
      } else {
        normalizedStack.push({
          vnode: currentVNode,
          recurseCount: 0
        });
      }
      const parentInstance = currentVNode.component && currentVNode.component.parent;
      currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
  }
  function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
      logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
    });
    return logs;
  }
  function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(
      vnode.component,
      vnode.type,
      isRoot
    )}`;
    const close = `>` + postfix;
    return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
  }
  function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach((key) => {
      res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
      res.push(` ...`);
    }
    return res;
  }
  function formatProp(key, value, raw) {
    if (isString(value)) {
      value = JSON.stringify(value);
      return raw ? value : [`${key}=${value}`];
    } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
      return raw ? value : [`${key}=${value}`];
    } else if (/* @__PURE__ */ isRef(value)) {
      value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
      return raw ? value : [`${key}=Ref<`, value, `>`];
    } else if (isFunction(value)) {
      return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    } else {
      value = /* @__PURE__ */ toRaw(value);
      return raw ? value : [`${key}=`, value];
    }
  }
  function callWithErrorHandling(fn, instance, type, args) {
    try {
      return args ? fn(...args) : fn();
    } catch (err) {
      handleError(err, instance, type);
    }
  }
  function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
      const res = callWithErrorHandling(fn, instance, type, args);
      if (res && isPromise(res)) {
        res.catch((err) => {
          handleError(err, instance, type);
        });
      }
      return res;
    }
    if (isArray(fn)) {
      const values = [];
      for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
      }
      return values;
    }
  }
  function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
    if (instance) {
      let cur = instance.parent;
      const exposedInstance = instance.proxy;
      const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
      while (cur) {
        const errorCapturedHooks = cur.ec;
        if (errorCapturedHooks) {
          for (let i = 0; i < errorCapturedHooks.length; i++) {
            if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
              return;
            }
          }
        }
        cur = cur.parent;
      }
      if (errorHandler) {
        pauseTracking();
        callWithErrorHandling(errorHandler, null, 10, [
          err,
          exposedInstance,
          errorInfo
        ]);
        resetTracking();
        return;
      }
    }
    logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
  }
  function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
    if (throwInProd) {
      throw err;
    } else {
      console.error(err);
    }
  }
  const queue = [];
  let flushIndex = -1;
  const pendingPostFlushCbs = [];
  let activePostFlushCbs = null;
  let postFlushIndex = 0;
  const resolvedPromise = /* @__PURE__ */ Promise.resolve();
  let currentFlushPromise = null;
  function nextTick(fn) {
    const p2 = currentFlushPromise || resolvedPromise;
    return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
  }
  function findInsertionIndex(id) {
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
      const middle = start + end >>> 1;
      const middleJob = queue[middle];
      const middleJobId = getId(middleJob);
      if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }
    return start;
  }
  function queueJob(job) {
    if (!(job.flags & 1)) {
      const jobId = getId(job);
      const lastJob = queue[queue.length - 1];
      if (!lastJob || // fast path when the job id is larger than the tail
      !(job.flags & 2) && jobId >= getId(lastJob)) {
        queue.push(job);
      } else {
        queue.splice(findInsertionIndex(jobId), 0, job);
      }
      job.flags |= 1;
      queueFlush();
    }
  }
  function queueFlush() {
    if (!currentFlushPromise) {
      currentFlushPromise = resolvedPromise.then(flushJobs);
    }
  }
  function queuePostFlushCb(cb) {
    if (!isArray(cb)) {
      if (activePostFlushCbs && cb.id === -1) {
        activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
      } else if (!(cb.flags & 1)) {
        pendingPostFlushCbs.push(cb);
        cb.flags |= 1;
      }
    } else {
      pendingPostFlushCbs.push(...cb);
    }
    queueFlush();
  }
  function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
    for (; i < queue.length; i++) {
      const cb = queue[i];
      if (cb && cb.flags & 2) {
        if (instance && cb.id !== instance.uid) {
          continue;
        }
        queue.splice(i, 1);
        i--;
        if (cb.flags & 4) {
          cb.flags &= -2;
        }
        cb();
        if (!(cb.flags & 4)) {
          cb.flags &= -2;
        }
      }
    }
  }
  function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
      const deduped = [...new Set(pendingPostFlushCbs)].sort(
        (a, b) => getId(a) - getId(b)
      );
      pendingPostFlushCbs.length = 0;
      if (activePostFlushCbs) {
        activePostFlushCbs.push(...deduped);
        return;
      }
      activePostFlushCbs = deduped;
      for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
        const cb = activePostFlushCbs[postFlushIndex];
        if (cb.flags & 4) {
          cb.flags &= -2;
        }
        if (!(cb.flags & 8))
          cb();
        cb.flags &= -2;
      }
      activePostFlushCbs = null;
      postFlushIndex = 0;
    }
  }
  const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
  function flushJobs(seen) {
    const check = NOOP;
    try {
      for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
        const job = queue[flushIndex];
        if (job && !(job.flags & 8)) {
          if (false)
            ;
          if (job.flags & 4) {
            job.flags &= ~1;
          }
          callWithErrorHandling(
            job,
            job.i,
            job.i ? 15 : 14
          );
          if (!(job.flags & 4)) {
            job.flags &= ~1;
          }
        }
      }
    } finally {
      for (; flushIndex < queue.length; flushIndex++) {
        const job = queue[flushIndex];
        if (job) {
          job.flags &= -2;
        }
      }
      flushIndex = -1;
      queue.length = 0;
      flushPostFlushCbs();
      currentFlushPromise = null;
      if (queue.length || pendingPostFlushCbs.length) {
        flushJobs();
      }
    }
  }
  let currentRenderingInstance = null;
  let currentScopeId = null;
  function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = instance && instance.type.__scopeId || null;
    return prev;
  }
  function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
    if (!ctx)
      return fn;
    if (fn._n) {
      return fn;
    }
    const renderFnWithContext = (...args) => {
      if (renderFnWithContext._d) {
        setBlockTracking(-1);
      }
      const prevInstance = setCurrentRenderingInstance(ctx);
      let res;
      try {
        res = fn(...args);
      } finally {
        setCurrentRenderingInstance(prevInstance);
        if (renderFnWithContext._d) {
          setBlockTracking(1);
        }
      }
      return res;
    };
    renderFnWithContext._n = true;
    renderFnWithContext._c = true;
    renderFnWithContext._d = true;
    return renderFnWithContext;
  }
  function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      if (oldBindings) {
        binding.oldValue = oldBindings[i].value;
      }
      let hook = binding.dir[name];
      if (hook) {
        pauseTracking();
        callWithAsyncErrorHandling(hook, instance, 8, [
          vnode.el,
          binding,
          vnode,
          prevVNode
        ]);
        resetTracking();
      }
    }
  }
  function provide(key, value) {
    if (currentInstance) {
      let provides = currentInstance.provides;
      const parentProvides = currentInstance.parent && currentInstance.parent.provides;
      if (parentProvides === provides) {
        provides = currentInstance.provides = Object.create(parentProvides);
      }
      provides[key] = value;
    }
  }
  function inject(key, defaultValue, treatDefaultAsFactory = false) {
    const instance = getCurrentInstance();
    if (instance || currentApp) {
      let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
      if (provides && key in provides) {
        return provides[key];
      } else if (arguments.length > 1) {
        return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
      } else
        ;
    }
  }
  const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
  const useSSRContext = () => {
    {
      const ctx = inject(ssrContextKey);
      return ctx;
    }
  };
  function watch(source, cb, options) {
    return doWatch(source, cb, options);
  }
  function doWatch(source, cb, options = EMPTY_OBJ) {
    const { immediate, deep, flush, once } = options;
    const baseWatchOptions = extend({}, options);
    const runsImmediately = cb && immediate || !cb && flush !== "post";
    let ssrCleanup;
    if (isInSSRComponentSetup) {
      if (flush === "sync") {
        const ctx = useSSRContext();
        ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
      } else if (!runsImmediately) {
        const watchStopHandle = () => {
        };
        watchStopHandle.stop = NOOP;
        watchStopHandle.resume = NOOP;
        watchStopHandle.pause = NOOP;
        return watchStopHandle;
      }
    }
    const instance = currentInstance;
    baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
    let isPre = false;
    if (flush === "post") {
      baseWatchOptions.scheduler = (job) => {
        queuePostRenderEffect(job, instance && instance.suspense);
      };
    } else if (flush !== "sync") {
      isPre = true;
      baseWatchOptions.scheduler = (job, isFirstRun) => {
        if (isFirstRun) {
          job();
        } else {
          queueJob(job);
        }
      };
    }
    baseWatchOptions.augmentJob = (job) => {
      if (cb) {
        job.flags |= 4;
      }
      if (isPre) {
        job.flags |= 2;
        if (instance) {
          job.id = instance.uid;
          job.i = instance;
        }
      }
    };
    const watchHandle = watch$1(source, cb, baseWatchOptions);
    if (isInSSRComponentSetup) {
      if (ssrCleanup) {
        ssrCleanup.push(watchHandle);
      } else if (runsImmediately) {
        watchHandle();
      }
    }
    return watchHandle;
  }
  function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
    let cb;
    if (isFunction(value)) {
      cb = value;
    } else {
      cb = value.handler;
      options = value;
    }
    const reset = setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    reset();
    return res;
  }
  function createPathGetter(ctx, path) {
    const segments = path.split(".");
    return () => {
      let cur = ctx;
      for (let i = 0; i < segments.length && cur; i++) {
        cur = cur[segments[i]];
      }
      return cur;
    };
  }
  const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
  const isTeleport = (type) => type.__isTeleport;
  const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
  function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 && vnode.component) {
      vnode.transition = hooks;
      setTransitionHooks(vnode.component.subTree, hooks);
    } else if (vnode.shapeFlag & 128) {
      vnode.ssContent.transition = hooks.clone(vnode.ssContent);
      vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    } else {
      vnode.transition = hooks;
    }
  }
  // @__NO_SIDE_EFFECTS__
  function defineComponent(options, extraOptions) {
    return isFunction(options) ? (
      // #8236: extend call and options.name access are considered side-effects
      // by Rollup, so we have to wrap it in a pure-annotated IIFE.
      /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
    ) : options;
  }
  function markAsyncBoundary(instance) {
    instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
  }
  const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
  function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if (isArray(rawRef)) {
      rawRef.forEach(
        (r, i) => setRef(
          r,
          oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
          parentSuspense,
          vnode,
          isUnmount
        )
      );
      return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
      if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
        setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
      }
      return;
    }
    const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref2 } = rawRef;
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
    const setupState = owner.setupState;
    const rawSetupState = /* @__PURE__ */ toRaw(setupState);
    const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
      return hasOwn(rawSetupState, key);
    };
    if (oldRef != null && oldRef !== ref2) {
      invalidatePendingSetRef(oldRawRef);
      if (isString(oldRef)) {
        refs[oldRef] = null;
        if (canSetSetupRef(oldRef)) {
          setupState[oldRef] = null;
        }
      } else if (/* @__PURE__ */ isRef(oldRef)) {
        {
          oldRef.value = null;
        }
        const oldRawRefAtom = oldRawRef;
        if (oldRawRefAtom.k)
          refs[oldRawRefAtom.k] = null;
      }
    }
    if (isFunction(ref2)) {
      callWithErrorHandling(ref2, owner, 12, [value, refs]);
    } else {
      const _isString = isString(ref2);
      const _isRef = /* @__PURE__ */ isRef(ref2);
      if (_isString || _isRef) {
        const doSet = () => {
          if (rawRef.f) {
            const existing = _isString ? canSetSetupRef(ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
            if (isUnmount) {
              isArray(existing) && remove(existing, refValue);
            } else {
              if (!isArray(existing)) {
                if (_isString) {
                  refs[ref2] = [refValue];
                  if (canSetSetupRef(ref2)) {
                    setupState[ref2] = refs[ref2];
                  }
                } else {
                  const newVal = [refValue];
                  {
                    ref2.value = newVal;
                  }
                  if (rawRef.k)
                    refs[rawRef.k] = newVal;
                }
              } else if (!existing.includes(refValue)) {
                existing.push(refValue);
              }
            }
          } else if (_isString) {
            refs[ref2] = value;
            if (canSetSetupRef(ref2)) {
              setupState[ref2] = value;
            }
          } else if (_isRef) {
            {
              ref2.value = value;
            }
            if (rawRef.k)
              refs[rawRef.k] = value;
          } else
            ;
        };
        if (value) {
          const job = () => {
            doSet();
            pendingSetRefMap.delete(rawRef);
          };
          job.id = -1;
          pendingSetRefMap.set(rawRef, job);
          queuePostRenderEffect(job, parentSuspense);
        } else {
          invalidatePendingSetRef(rawRef);
          doSet();
        }
      }
    }
  }
  function invalidatePendingSetRef(rawRef) {
    const pendingSetRef = pendingSetRefMap.get(rawRef);
    if (pendingSetRef) {
      pendingSetRef.flags |= 8;
      pendingSetRefMap.delete(rawRef);
    }
  }
  getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
  getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
  const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
  const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
  function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a", target);
  }
  function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da", target);
  }
  function registerKeepAliveHook(hook, type, target = currentInstance) {
    const wrappedHook = hook.__wdc || (hook.__wdc = () => {
      let current = target;
      while (current) {
        if (current.isDeactivated) {
          return;
        }
        current = current.parent;
      }
      return hook();
    });
    injectHook(type, wrappedHook, target);
    if (target) {
      let current = target.parent;
      while (current && current.parent) {
        if (isKeepAlive(current.parent.vnode)) {
          injectToKeepAliveRoot(wrappedHook, type, target, current);
        }
        current = current.parent;
      }
    }
  }
  function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    const injected = injectHook(
      type,
      hook,
      keepAliveRoot,
      true
      /* prepend */
    );
    onUnmounted(() => {
      remove(keepAliveRoot[type], injected);
    }, target);
  }
  function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
      const hooks = target[type] || (target[type] = []);
      const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
        pauseTracking();
        const reset = setCurrentInstance(target);
        const res = callWithAsyncErrorHandling(hook, target, type, args);
        reset();
        resetTracking();
        return res;
      });
      if (prepend) {
        hooks.unshift(wrappedHook);
      } else {
        hooks.push(wrappedHook);
      }
      return wrappedHook;
    }
  }
  const createHook = (lifecycle) => (hook, target = currentInstance) => {
    if (!isInSSRComponentSetup || lifecycle === "sp") {
      injectHook(lifecycle, (...args) => hook(...args), target);
    }
  };
  const onBeforeMount = createHook("bm");
  const onMounted = createHook("m");
  const onBeforeUpdate = createHook(
    "bu"
  );
  const onUpdated = createHook("u");
  const onBeforeUnmount = createHook(
    "bum"
  );
  const onUnmounted = createHook("um");
  const onServerPrefetch = createHook(
    "sp"
  );
  const onRenderTriggered = createHook("rtg");
  const onRenderTracked = createHook("rtc");
  function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec", hook, target);
  }
  const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
  function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = cache && cache[index];
    const sourceIsArray = isArray(source);
    if (sourceIsArray || isString(source)) {
      const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
      let needsWrap = false;
      let isReadonlySource = false;
      if (sourceIsReactiveArray) {
        needsWrap = !/* @__PURE__ */ isShallow(source);
        isReadonlySource = /* @__PURE__ */ isReadonly(source);
        source = shallowReadArray(source);
      }
      ret = new Array(source.length);
      for (let i = 0, l = source.length; i < l; i++) {
        ret[i] = renderItem(
          needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
          i,
          void 0,
          cached && cached[i]
        );
      }
    } else if (typeof source === "number") {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
      }
    } else if (isObject(source)) {
      if (source[Symbol.iterator]) {
        ret = Array.from(
          source,
          (item, i) => renderItem(item, i, void 0, cached && cached[i])
        );
      } else {
        const keys = Object.keys(source);
        ret = new Array(keys.length);
        for (let i = 0, l = keys.length; i < l; i++) {
          const key = keys[i];
          ret[i] = renderItem(source[key], key, i, cached && cached[i]);
        }
      }
    } else {
      ret = [];
    }
    if (cache) {
      cache[index] = ret;
    }
    return ret;
  }
  const getPublicInstance = (i) => {
    if (!i)
      return null;
    if (isStatefulComponent(i))
      return getComponentPublicInstance(i);
    return getPublicInstance(i.parent);
  };
  const publicPropertiesMap = (
    // Move PURE marker to new line to workaround compiler discarding it
    // due to type annotation
    /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
      $: (i) => i,
      $el: (i) => i.vnode.el,
      $data: (i) => i.data,
      $props: (i) => i.props,
      $attrs: (i) => i.attrs,
      $slots: (i) => i.slots,
      $refs: (i) => i.refs,
      $parent: (i) => getPublicInstance(i.parent),
      $root: (i) => getPublicInstance(i.root),
      $host: (i) => i.ce,
      $emit: (i) => i.emit,
      $options: (i) => resolveMergedOptions(i),
      $forceUpdate: (i) => i.f || (i.f = () => {
        queueJob(i.update);
      }),
      $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
      $watch: (i) => instanceWatch.bind(i)
    })
  );
  const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
  const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
      if (key === "__v_skip") {
        return true;
      }
      const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
      if (key[0] !== "$") {
        const n = accessCache[key];
        if (n !== void 0) {
          switch (n) {
            case 1:
              return setupState[key];
            case 2:
              return data[key];
            case 4:
              return ctx[key];
            case 3:
              return props[key];
          }
        } else if (hasSetupBinding(setupState, key)) {
          accessCache[key] = 1;
          return setupState[key];
        } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
          accessCache[key] = 2;
          return data[key];
        } else if (hasOwn(props, key)) {
          accessCache[key] = 3;
          return props[key];
        } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
          accessCache[key] = 4;
          return ctx[key];
        } else if (shouldCacheAccess) {
          accessCache[key] = 0;
        }
      }
      const publicGetter = publicPropertiesMap[key];
      let cssModule, globalProperties;
      if (publicGetter) {
        if (key === "$attrs") {
          track(instance.attrs, "get", "");
        }
        return publicGetter(instance);
      } else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) && (cssModule = cssModule[key])
      ) {
        return cssModule;
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (
        // global properties
        globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
      ) {
        {
          return globalProperties[key];
        }
      } else
        ;
    },
    set({ _: instance }, key, value) {
      const { data, setupState, ctx } = instance;
      if (hasSetupBinding(setupState, key)) {
        setupState[key] = value;
        return true;
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (hasOwn(instance.props, key)) {
        return false;
      }
      if (key[0] === "$" && key.slice(1) in instance) {
        return false;
      } else {
        {
          ctx[key] = value;
        }
      }
      return true;
    },
    has({
      _: { data, setupState, accessCache, ctx, appContext, props, type }
    }, key) {
      let cssModules;
      return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
    },
    defineProperty(target, key, descriptor) {
      if (descriptor.get != null) {
        target._.accessCache[key] = 0;
      } else if (hasOwn(descriptor, "value")) {
        this.set(target, key, descriptor.value, null);
      }
      return Reflect.defineProperty(target, key, descriptor);
    }
  };
  function normalizePropsOrEmits(props) {
    return isArray(props) ? props.reduce(
      (normalized, p2) => (normalized[p2] = null, normalized),
      {}
    ) : props;
  }
  let shouldCacheAccess = true;
  function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    shouldCacheAccess = false;
    if (options.beforeCreate) {
      callHook(options.beforeCreate, instance, "bc");
    }
    const {
      // state
      data: dataOptions,
      computed: computedOptions,
      methods,
      watch: watchOptions,
      provide: provideOptions,
      inject: injectOptions,
      // lifecycle
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      activated,
      deactivated,
      beforeDestroy,
      beforeUnmount,
      destroyed,
      unmounted,
      render,
      renderTracked,
      renderTriggered,
      errorCaptured,
      serverPrefetch,
      // public API
      expose,
      inheritAttrs,
      // assets
      components,
      directives,
      filters
    } = options;
    const checkDuplicateProperties = null;
    if (injectOptions) {
      resolveInjections(injectOptions, ctx, checkDuplicateProperties);
    }
    if (methods) {
      for (const key in methods) {
        const methodHandler = methods[key];
        if (isFunction(methodHandler)) {
          {
            ctx[key] = methodHandler.bind(publicThis);
          }
        }
      }
    }
    if (dataOptions) {
      const data = dataOptions.call(publicThis, publicThis);
      if (!isObject(data))
        ;
      else {
        instance.data = /* @__PURE__ */ reactive(data);
      }
    }
    shouldCacheAccess = true;
    if (computedOptions) {
      for (const key in computedOptions) {
        const opt = computedOptions[key];
        const get2 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
        const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
        const c = computed({
          get: get2,
          set: set2
        });
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => c.value,
          set: (v) => c.value = v
        });
      }
    }
    if (watchOptions) {
      for (const key in watchOptions) {
        createWatcher(watchOptions[key], ctx, publicThis, key);
      }
    }
    if (provideOptions) {
      const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key]);
      });
    }
    if (created) {
      callHook(created, instance, "c");
    }
    function registerLifecycleHook(register, hook) {
      if (isArray(hook)) {
        hook.forEach((_hook) => register(_hook.bind(publicThis)));
      } else if (hook) {
        register(hook.bind(publicThis));
      }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if (isArray(expose)) {
      if (expose.length) {
        const exposed = instance.exposed || (instance.exposed = {});
        expose.forEach((key) => {
          Object.defineProperty(exposed, key, {
            get: () => publicThis[key],
            set: (val) => publicThis[key] = val,
            enumerable: true
          });
        });
      } else if (!instance.exposed) {
        instance.exposed = {};
      }
    }
    if (render && instance.render === NOOP) {
      instance.render = render;
    }
    if (inheritAttrs != null) {
      instance.inheritAttrs = inheritAttrs;
    }
    if (components)
      instance.components = components;
    if (directives)
      instance.directives = directives;
    if (serverPrefetch) {
      markAsyncBoundary(instance);
    }
  }
  function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
    if (isArray(injectOptions)) {
      injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
      const opt = injectOptions[key];
      let injected;
      if (isObject(opt)) {
        if ("default" in opt) {
          injected = inject(
            opt.from || key,
            opt.default,
            true
          );
        } else {
          injected = inject(opt.from || key);
        }
      } else {
        injected = inject(opt);
      }
      if (/* @__PURE__ */ isRef(injected)) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
    }
  }
  function callHook(hook, instance, type) {
    callWithAsyncErrorHandling(
      isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy),
      instance,
      type
    );
  }
  function createWatcher(raw, ctx, publicThis, key) {
    let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
    if (isString(raw)) {
      const handler = ctx[raw];
      if (isFunction(handler)) {
        {
          watch(getter, handler);
        }
      }
    } else if (isFunction(raw)) {
      {
        watch(getter, raw.bind(publicThis));
      }
    } else if (isObject(raw)) {
      if (isArray(raw)) {
        raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
      } else {
        const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
        if (isFunction(handler)) {
          watch(getter, handler, raw);
        }
      }
    } else
      ;
  }
  function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const {
      mixins: globalMixins,
      optionsCache: cache,
      config: { optionMergeStrategies }
    } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
      resolved = cached;
    } else if (!globalMixins.length && !mixins && !extendsOptions) {
      {
        resolved = base;
      }
    } else {
      resolved = {};
      if (globalMixins.length) {
        globalMixins.forEach(
          (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
        );
      }
      mergeOptions(resolved, base, optionMergeStrategies);
    }
    if (isObject(base)) {
      cache.set(base, resolved);
    }
    return resolved;
  }
  function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
      mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
      mixins.forEach(
        (m) => mergeOptions(to, m, strats, true)
      );
    }
    for (const key in from) {
      if (asMixin && key === "expose")
        ;
      else {
        const strat = internalOptionMergeStrats[key] || strats && strats[key];
        to[key] = strat ? strat(to[key], from[key]) : from[key];
      }
    }
    return to;
  }
  const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeEmitsOrPropsOptions,
    emits: mergeEmitsOrPropsOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
  };
  function mergeDataFn(to, from) {
    if (!from) {
      return to;
    }
    if (!to) {
      return from;
    }
    return function mergedDataFn() {
      return extend(
        isFunction(to) ? to.call(this, this) : to,
        isFunction(from) ? from.call(this, this) : from
      );
    };
  }
  function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
  }
  function normalizeInject(raw) {
    if (isArray(raw)) {
      const res = {};
      for (let i = 0; i < raw.length; i++) {
        res[raw[i]] = raw[i];
      }
      return res;
    }
    return raw;
  }
  function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
  }
  function mergeObjectOptions(to, from) {
    return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
  }
  function mergeEmitsOrPropsOptions(to, from) {
    if (to) {
      if (isArray(to) && isArray(from)) {
        return [.../* @__PURE__ */ new Set([...to, ...from])];
      }
      return extend(
        /* @__PURE__ */ Object.create(null),
        normalizePropsOrEmits(to),
        normalizePropsOrEmits(from != null ? from : {})
      );
    } else {
      return from;
    }
  }
  function mergeWatchOptions(to, from) {
    if (!to)
      return from;
    if (!from)
      return to;
    const merged = extend(/* @__PURE__ */ Object.create(null), to);
    for (const key in from) {
      merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
  }
  function createAppContext() {
    return {
      app: null,
      config: {
        isNativeTag: NO,
        performance: false,
        globalProperties: {},
        optionMergeStrategies: {},
        errorHandler: void 0,
        warnHandler: void 0,
        compilerOptions: {}
      },
      mixins: [],
      components: {},
      directives: {},
      provides: /* @__PURE__ */ Object.create(null),
      optionsCache: /* @__PURE__ */ new WeakMap(),
      propsCache: /* @__PURE__ */ new WeakMap(),
      emitsCache: /* @__PURE__ */ new WeakMap()
    };
  }
  let uid$1 = 0;
  function createAppAPI(render, hydrate) {
    return function createApp2(rootComponent, rootProps = null) {
      if (!isFunction(rootComponent)) {
        rootComponent = extend({}, rootComponent);
      }
      if (rootProps != null && !isObject(rootProps)) {
        rootProps = null;
      }
      const context = createAppContext();
      const installedPlugins = /* @__PURE__ */ new WeakSet();
      const pluginCleanupFns = [];
      let isMounted = false;
      const app = context.app = {
        _uid: uid$1++,
        _component: rootComponent,
        _props: rootProps,
        _container: null,
        _context: context,
        _instance: null,
        version,
        get config() {
          return context.config;
        },
        set config(v) {
        },
        use(plugin, ...options) {
          if (installedPlugins.has(plugin))
            ;
          else if (plugin && isFunction(plugin.install)) {
            installedPlugins.add(plugin);
            plugin.install(app, ...options);
          } else if (isFunction(plugin)) {
            installedPlugins.add(plugin);
            plugin(app, ...options);
          } else
            ;
          return app;
        },
        mixin(mixin) {
          {
            if (!context.mixins.includes(mixin)) {
              context.mixins.push(mixin);
            }
          }
          return app;
        },
        component(name, component) {
          if (!component) {
            return context.components[name];
          }
          context.components[name] = component;
          return app;
        },
        directive(name, directive) {
          if (!directive) {
            return context.directives[name];
          }
          context.directives[name] = directive;
          return app;
        },
        mount(rootContainer, isHydrate, namespace) {
          if (!isMounted) {
            const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
            vnode.appContext = context;
            if (namespace === true) {
              namespace = "svg";
            } else if (namespace === false) {
              namespace = void 0;
            }
            if (isHydrate && hydrate) {
              hydrate(vnode, rootContainer);
            } else {
              render(vnode, rootContainer, namespace);
            }
            isMounted = true;
            app._container = rootContainer;
            rootContainer.__vue_app__ = app;
            return getComponentPublicInstance(vnode.component);
          }
        },
        onUnmount(cleanupFn) {
          pluginCleanupFns.push(cleanupFn);
        },
        unmount() {
          if (isMounted) {
            callWithAsyncErrorHandling(
              pluginCleanupFns,
              app._instance,
              16
            );
            render(null, app._container);
            delete app._container.__vue_app__;
          }
        },
        provide(key, value) {
          context.provides[key] = value;
          return app;
        },
        runWithContext(fn) {
          const lastApp = currentApp;
          currentApp = app;
          try {
            return fn();
          } finally {
            currentApp = lastApp;
          }
        }
      };
      return app;
    };
  }
  let currentApp = null;
  const getModelModifiers = (props, modelName) => {
    return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
  };
  function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted)
      return;
    const props = instance.vnode.props || EMPTY_OBJ;
    let args = rawArgs;
    const isModelListener2 = event.startsWith("update:");
    const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
    if (modifiers) {
      if (modifiers.trim) {
        args = rawArgs.map((a) => isString(a) ? a.trim() : a);
      }
      if (modifiers.number) {
        args = rawArgs.map(looseToNumber);
      }
    }
    let handlerName;
    let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
    props[handlerName = toHandlerKey(camelize(event))];
    if (!handler && isModelListener2) {
      handler = props[handlerName = toHandlerKey(hyphenate(event))];
    }
    if (handler) {
      callWithAsyncErrorHandling(
        handler,
        instance,
        6,
        args
      );
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
      if (!instance.emitted) {
        instance.emitted = {};
      } else if (instance.emitted[handlerName]) {
        return;
      }
      instance.emitted[handlerName] = true;
      callWithAsyncErrorHandling(
        onceHandler,
        instance,
        6,
        args
      );
    }
  }
  const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
  function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== void 0) {
      return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendEmits = (raw2) => {
        const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
        if (normalizedFromExtend) {
          hasExtends = true;
          extend(normalized, normalizedFromExtend);
        }
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendEmits);
      }
      if (comp.extends) {
        extendEmits(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendEmits);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, null);
      }
      return null;
    }
    if (isArray(raw)) {
      raw.forEach((key) => normalized[key] = null);
    } else {
      extend(normalized, raw);
    }
    if (isObject(comp)) {
      cache.set(comp, normalized);
    }
    return normalized;
  }
  function isEmitListener(options, key) {
    if (!options || !isOn(key)) {
      return false;
    }
    key = key.slice(2).replace(/Once$/, "");
    return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
  }
  function markAttrsAccessed() {
  }
  function renderComponentRoot(instance) {
    const {
      type: Component,
      vnode,
      proxy,
      withProxy,
      propsOptions: [propsOptions],
      slots,
      attrs,
      emit: emit2,
      render,
      renderCache,
      props,
      data,
      setupState,
      ctx,
      inheritAttrs
    } = instance;
    const prev = setCurrentRenderingInstance(instance);
    let result;
    let fallthroughAttrs;
    try {
      if (vnode.shapeFlag & 4) {
        const proxyToUse = withProxy || proxy;
        const thisProxy = false ? new Proxy(proxyToUse, {
          get(target, key, receiver) {
            warn$1(
              `Property '${String(
                key
              )}' was accessed via 'this'. Avoid using 'this' in templates.`
            );
            return Reflect.get(target, key, receiver);
          }
        }) : proxyToUse;
        result = normalizeVNode(
          render.call(
            thisProxy,
            proxyToUse,
            renderCache,
            false ? /* @__PURE__ */ shallowReadonly(props) : props,
            setupState,
            data,
            ctx
          )
        );
        fallthroughAttrs = attrs;
      } else {
        const render2 = Component;
        if (false)
          ;
        result = normalizeVNode(
          render2.length > 1 ? render2(
            false ? /* @__PURE__ */ shallowReadonly(props) : props,
            false ? {
              get attrs() {
                markAttrsAccessed();
                return /* @__PURE__ */ shallowReadonly(attrs);
              },
              slots,
              emit: emit2
            } : { attrs, slots, emit: emit2 }
          ) : render2(
            false ? /* @__PURE__ */ shallowReadonly(props) : props,
            null
          )
        );
        fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
      }
    } catch (err) {
      blockStack.length = 0;
      handleError(err, instance, 1);
      result = createVNode(Comment);
    }
    let root = result;
    if (fallthroughAttrs && inheritAttrs !== false) {
      const keys = Object.keys(fallthroughAttrs);
      const { shapeFlag } = root;
      if (keys.length) {
        if (shapeFlag & (1 | 6)) {
          if (propsOptions && keys.some(isModelListener)) {
            fallthroughAttrs = filterModelListeners(
              fallthroughAttrs,
              propsOptions
            );
          }
          root = cloneVNode(root, fallthroughAttrs, false, true);
        }
      }
    }
    if (vnode.dirs) {
      root = cloneVNode(root, null, false, true);
      root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    if (vnode.transition) {
      setTransitionHooks(root, vnode.transition);
    }
    {
      result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
  }
  const getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
      if (key === "class" || key === "style" || isOn(key)) {
        (res || (res = {}))[key] = attrs[key];
      }
    }
    return res;
  };
  const filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
      if (!isModelListener(key) || !(key.slice(9) in props)) {
        res[key] = attrs[key];
      }
    }
    return res;
  };
  function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    if (nextVNode.dirs || nextVNode.transition) {
      return true;
    }
    if (optimized && patchFlag >= 0) {
      if (patchFlag & 1024) {
        return true;
      }
      if (patchFlag & 16) {
        if (!prevProps) {
          return !!nextProps;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
      } else if (patchFlag & 8) {
        const dynamicProps = nextVNode.dynamicProps;
        for (let i = 0; i < dynamicProps.length; i++) {
          const key = dynamicProps[i];
          if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
            return true;
          }
        }
      }
    } else {
      if (prevChildren || nextChildren) {
        if (!nextChildren || !nextChildren.$stable) {
          return true;
        }
      }
      if (prevProps === nextProps) {
        return false;
      }
      if (!prevProps) {
        return !!nextProps;
      }
      if (!nextProps) {
        return true;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
  }
  function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
        return true;
      }
    }
    return false;
  }
  function updateHOCHostEl({ vnode, parent }, el) {
    while (parent) {
      const root = parent.subTree;
      if (root.suspense && root.suspense.activeBranch === vnode) {
        root.el = vnode.el;
      }
      if (root === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
      } else {
        break;
      }
    }
  }
  const internalObjectProto = {};
  const createInternalObject = () => Object.create(internalObjectProto);
  const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
  function initProps(instance, rawProps, isStateful, isSSR = false) {
    const props = {};
    const attrs = createInternalObject();
    instance.propsDefaults = /* @__PURE__ */ Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    for (const key in instance.propsOptions[0]) {
      if (!(key in props)) {
        props[key] = void 0;
      }
    }
    if (isStateful) {
      instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
    } else {
      if (!instance.type.props) {
        instance.props = attrs;
      } else {
        instance.props = props;
      }
    }
    instance.attrs = attrs;
  }
  function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const {
      props,
      attrs,
      vnode: { patchFlag }
    } = instance;
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (
      // always force full diff in dev
      // - #1942 if hmr is enabled with sfc component
      // - vite#872 non-sfc component used by sfc component
      (optimized || patchFlag > 0) && !(patchFlag & 16)
    ) {
      if (patchFlag & 8) {
        const propsToUpdate = instance.vnode.dynamicProps;
        for (let i = 0; i < propsToUpdate.length; i++) {
          let key = propsToUpdate[i];
          if (isEmitListener(instance.emitsOptions, key)) {
            continue;
          }
          const value = rawProps[key];
          if (options) {
            if (hasOwn(attrs, key)) {
              if (value !== attrs[key]) {
                attrs[key] = value;
                hasAttrsChanged = true;
              }
            } else {
              const camelizedKey = camelize(key);
              props[camelizedKey] = resolvePropValue(
                options,
                rawCurrentProps,
                camelizedKey,
                value,
                instance,
                false
              );
            }
          } else {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          }
        }
      }
    } else {
      if (setFullProps(instance, rawProps, props, attrs)) {
        hasAttrsChanged = true;
      }
      let kebabKey;
      for (const key in rawCurrentProps) {
        if (!rawProps || // for camelCase
        !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
        // and converted to camelCase (#955)
        ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
          if (options) {
            if (rawPrevProps && // for camelCase
            (rawPrevProps[key] !== void 0 || // for kebab-case
            rawPrevProps[kebabKey] !== void 0)) {
              props[key] = resolvePropValue(
                options,
                rawCurrentProps,
                key,
                void 0,
                instance,
                true
              );
            }
          } else {
            delete props[key];
          }
        }
      }
      if (attrs !== rawCurrentProps) {
        for (const key in attrs) {
          if (!rawProps || !hasOwn(rawProps, key) && true) {
            delete attrs[key];
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (hasAttrsChanged) {
      trigger(instance.attrs, "set", "");
    }
  }
  function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
      for (let key in rawProps) {
        if (isReservedProp(key)) {
          continue;
        }
        const value = rawProps[key];
        let camelKey;
        if (options && hasOwn(options, camelKey = camelize(key))) {
          if (!needCastKeys || !needCastKeys.includes(camelKey)) {
            props[camelKey] = value;
          } else {
            (rawCastValues || (rawCastValues = {}))[camelKey] = value;
          }
        } else if (!isEmitListener(instance.emitsOptions, key)) {
          if (!(key in attrs) || value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (needCastKeys) {
      const rawCurrentProps = /* @__PURE__ */ toRaw(props);
      const castValues = rawCastValues || EMPTY_OBJ;
      for (let i = 0; i < needCastKeys.length; i++) {
        const key = needCastKeys[i];
        props[key] = resolvePropValue(
          options,
          rawCurrentProps,
          key,
          castValues[key],
          instance,
          !hasOwn(castValues, key)
        );
      }
    }
    return hasAttrsChanged;
  }
  function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
      const hasDefault = hasOwn(opt, "default");
      if (hasDefault && value === void 0) {
        const defaultValue = opt.default;
        if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
          const { propsDefaults } = instance;
          if (key in propsDefaults) {
            value = propsDefaults[key];
          } else {
            const reset = setCurrentInstance(instance);
            value = propsDefaults[key] = defaultValue.call(
              null,
              props
            );
            reset();
          }
        } else {
          value = defaultValue;
        }
        if (instance.ce) {
          instance.ce._setProp(key, value);
        }
      }
      if (opt[
        0
        /* shouldCast */
      ]) {
        if (isAbsent && !hasDefault) {
          value = false;
        } else if (opt[
          1
          /* shouldCastTrue */
        ] && (value === "" || value === hyphenate(key))) {
          value = true;
        }
      }
    }
    return value;
  }
  const mixinPropsCache = /* @__PURE__ */ new WeakMap();
  function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = asMixin ? mixinPropsCache : appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
      return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendProps = (raw2) => {
        hasExtends = true;
        const [props, keys] = normalizePropsOptions(raw2, appContext, true);
        extend(normalized, props);
        if (keys)
          needCastKeys.push(...keys);
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendProps);
      }
      if (comp.extends) {
        extendProps(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendProps);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, EMPTY_ARR);
      }
      return EMPTY_ARR;
    }
    if (isArray(raw)) {
      for (let i = 0; i < raw.length; i++) {
        const normalizedKey = camelize(raw[i]);
        if (validatePropName(normalizedKey)) {
          normalized[normalizedKey] = EMPTY_OBJ;
        }
      }
    } else if (raw) {
      for (const key in raw) {
        const normalizedKey = camelize(key);
        if (validatePropName(normalizedKey)) {
          const opt = raw[key];
          const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
          const propType = prop.type;
          let shouldCast = false;
          let shouldCastTrue = true;
          if (isArray(propType)) {
            for (let index = 0; index < propType.length; ++index) {
              const type = propType[index];
              const typeName = isFunction(type) && type.name;
              if (typeName === "Boolean") {
                shouldCast = true;
                break;
              } else if (typeName === "String") {
                shouldCastTrue = false;
              }
            }
          } else {
            shouldCast = isFunction(propType) && propType.name === "Boolean";
          }
          prop[
            0
            /* shouldCast */
          ] = shouldCast;
          prop[
            1
            /* shouldCastTrue */
          ] = shouldCastTrue;
          if (shouldCast || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
    const res = [normalized, needCastKeys];
    if (isObject(comp)) {
      cache.set(comp, res);
    }
    return res;
  }
  function validatePropName(key) {
    if (key[0] !== "$" && !isReservedProp(key)) {
      return true;
    }
    return false;
  }
  const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
  const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
  const normalizeSlot = (key, rawSlot, ctx) => {
    if (rawSlot._n) {
      return rawSlot;
    }
    const normalized = withCtx((...args) => {
      if (false)
        ;
      return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
  };
  const normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx = rawSlots._ctx;
    for (const key in rawSlots) {
      if (isInternalKey(key))
        continue;
      const value = rawSlots[key];
      if (isFunction(value)) {
        slots[key] = normalizeSlot(key, value, ctx);
      } else if (value != null) {
        const normalized = normalizeSlotValue(value);
        slots[key] = () => normalized;
      }
    }
  };
  const normalizeVNodeSlots = (instance, children) => {
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
  };
  const assignSlots = (slots, children, optimized) => {
    for (const key in children) {
      if (optimized || !isInternalKey(key)) {
        slots[key] = children[key];
      }
    }
  };
  const initSlots = (instance, children, optimized) => {
    const slots = instance.slots = createInternalObject();
    if (instance.vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        assignSlots(slots, children, optimized);
        if (optimized) {
          def(slots, "_", type, true);
        }
      } else {
        normalizeObjectSlots(children, slots);
      }
    } else if (children) {
      normalizeVNodeSlots(instance, children);
    }
  };
  const updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = EMPTY_OBJ;
    if (vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        if (optimized && type === 1) {
          needDeletionCheck = false;
        } else {
          assignSlots(slots, children, optimized);
        }
      } else {
        needDeletionCheck = !children.$stable;
        normalizeObjectSlots(children, slots);
      }
      deletionComparisonTarget = children;
    } else if (children) {
      normalizeVNodeSlots(instance, children);
      deletionComparisonTarget = { default: 1 };
    }
    if (needDeletionCheck) {
      for (const key in slots) {
        if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
          delete slots[key];
        }
      }
    }
  };
  const queuePostRenderEffect = queueEffectWithSuspense;
  function createRenderer(options) {
    return baseCreateRenderer(options);
  }
  function baseCreateRenderer(options, createHydrationFns) {
    const target = getGlobalThis();
    target.__VUE__ = true;
    const {
      insert: hostInsert,
      remove: hostRemove,
      patchProp: hostPatchProp,
      createElement: hostCreateElement,
      createText: hostCreateText,
      createComment: hostCreateComment,
      setText: hostSetText,
      setElementText: hostSetElementText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      setScopeId: hostSetScopeId = NOOP,
      insertStaticContent: hostInsertStaticContent
    } = options;
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
      if (n1 === n2) {
        return;
      }
      if (n1 && !isSameVNodeType(n1, n2)) {
        anchor = getNextHostNode(n1);
        unmount(n1, parentComponent, parentSuspense, true);
        n1 = null;
      }
      if (n2.patchFlag === -2) {
        optimized = false;
        n2.dynamicChildren = null;
      }
      const { type, ref: ref2, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container, anchor);
          break;
        case Comment:
          processCommentNode(n1, n2, container, anchor);
          break;
        case Static:
          if (n1 == null) {
            mountStaticNode(n2, container, anchor, namespace);
          }
          break;
        case Fragment:
          processFragment(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          break;
        default:
          if (shapeFlag & 1) {
            processElement(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 6) {
            processComponent(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 64) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else if (shapeFlag & 128) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else
            ;
      }
      if (ref2 != null && parentComponent) {
        setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
      } else if (ref2 == null && n1 && n1.ref != null) {
        setRef(n1.ref, null, parentSuspense, n1, true);
      }
    };
    const processText = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateText(n2.children),
          container,
          anchor
        );
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          {
            hostSetText(el, n2.children);
          }
        }
      }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateComment(n2.children || ""),
          container,
          anchor
        );
      } else {
        n2.el = n1.el;
      }
    };
    const mountStaticNode = (n2, container, anchor, namespace) => {
      [n2.el, n2.anchor] = hostInsertStaticContent(
        n2.children,
        container,
        anchor,
        namespace,
        n2.el,
        n2.anchor
      );
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostInsert(el, container, nextSibling);
        el = next;
      }
      hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostRemove(el);
        el = next;
      }
      hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      if (n2.type === "svg") {
        namespace = "svg";
      } else if (n2.type === "math") {
        namespace = "mathml";
      }
      if (n1 == null) {
        mountElement(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        const customElement = !!(n1.el && n1.el._isVueCE) ? n1.el : null;
        try {
          if (customElement) {
            customElement._beginPatch();
          }
          patchElement(
            n1,
            n2,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } finally {
          if (customElement) {
            customElement._endPatch();
          }
        }
      }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let el;
      let vnodeHook;
      const { props, shapeFlag, transition, dirs } = vnode;
      el = vnode.el = hostCreateElement(
        vnode.type,
        namespace,
        props && props.is,
        props
      );
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(
          vnode.children,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(vnode, namespace),
          slotScopeIds,
          optimized
        );
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], namespace, parentComponent);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value, namespace);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      const needCallTransitionHooks = needTransition(parentSuspense, transition);
      if (needCallTransitionHooks) {
        transition.beforeEnter(el);
      }
      hostInsert(el, container, anchor);
      if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
      if (scopeId) {
        hostSetScopeId(el, scopeId);
      }
      if (slotScopeIds) {
        for (let i = 0; i < slotScopeIds.length; i++) {
          hostSetScopeId(el, slotScopeIds[i]);
        }
      }
      if (parentComponent) {
        let subTree = parentComponent.subTree;
        if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
          const parentVNode = parentComponent.vnode;
          setScopeId(
            el,
            parentVNode,
            parentVNode.scopeId,
            parentVNode.slotScopeIds,
            parentComponent.parent
          );
        }
      }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
      for (let i = start; i < children.length; i++) {
        const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
        patch(
          null,
          child,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const el = n2.el = n1.el;
      let { patchFlag, dynamicChildren, dirs } = n2;
      patchFlag |= n1.patchFlag & 16;
      const oldProps = n1.props || EMPTY_OBJ;
      const newProps = n2.props || EMPTY_OBJ;
      let vnodeHook;
      parentComponent && toggleRecurse(parentComponent, false);
      if (vnodeHook = newProps.onVnodeBeforeUpdate) {
        invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
      }
      if (dirs) {
        invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
      }
      parentComponent && toggleRecurse(parentComponent, true);
      if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
        hostSetElementText(el, "");
      }
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          el,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds
        );
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds,
          false
        );
      }
      if (patchFlag > 0) {
        if (patchFlag & 16) {
          patchProps(el, oldProps, newProps, parentComponent, namespace);
        } else {
          if (patchFlag & 2) {
            if (oldProps.class !== newProps.class) {
              hostPatchProp(el, "class", null, newProps.class, namespace);
            }
          }
          if (patchFlag & 4) {
            hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
          }
          if (patchFlag & 8) {
            const propsToUpdate = n2.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
              const key = propsToUpdate[i];
              const prev = oldProps[key];
              const next = newProps[key];
              if (next !== prev || key === "value") {
                hostPatchProp(el, key, prev, next, namespace, parentComponent);
              }
            }
          }
        }
        if (patchFlag & 1) {
          if (n1.children !== n2.children) {
            hostSetElementText(el, n2.children);
          }
        }
      } else if (!optimized && dynamicChildren == null) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      }
      if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
          dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
        }, parentSuspense);
      }
    };
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
      for (let i = 0; i < newChildren.length; i++) {
        const oldVNode = oldChildren[i];
        const newVNode = newChildren[i];
        const container = (
          // oldVNode may be an errored async setup() component inside Suspense
          // which will not have a mounted element
          oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
          // of the Fragment itself so it can move its children.
          (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
          // which also requires the correct parent container
          !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
          oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
            // In other cases, the parent container is not actually used so we
            // just pass the block element here to avoid a DOM parentNode call.
            fallbackContainer
          )
        );
        patch(
          oldVNode,
          newVNode,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          true
        );
      }
    };
    const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
      if (oldProps !== newProps) {
        if (oldProps !== EMPTY_OBJ) {
          for (const key in oldProps) {
            if (!isReservedProp(key) && !(key in newProps)) {
              hostPatchProp(
                el,
                key,
                oldProps[key],
                null,
                namespace,
                parentComponent
              );
            }
          }
        }
        for (const key in newProps) {
          if (isReservedProp(key))
            continue;
          const next = newProps[key];
          const prev = oldProps[key];
          if (next !== prev && key !== "value") {
            hostPatchProp(el, key, prev, next, namespace, parentComponent);
          }
        }
        if ("value" in newProps) {
          hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
        }
      }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
      const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
      let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
      if (fragmentSlotScopeIds) {
        slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
      }
      if (n1 == null) {
        hostInsert(fragmentStartAnchor, container, anchor);
        hostInsert(fragmentEndAnchor, container, anchor);
        mountChildren(
          // #10007
          // such fragment like `<></>` will be compiled into
          // a fragment which doesn't have a children.
          // In this case fallback to an empty array
          n2.children || [],
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
        // of renderSlot() with no valid children
        n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
          patchBlockChildren(
            n1.dynamicChildren,
            dynamicChildren,
            container,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds
          );
          if (
            // #2080 if the stable fragment has a key, it's a <template v-for> that may
            //  get moved around. Make sure all root level vnodes inherit el.
            // #2134 or if it's a component root, it may also get moved around
            // as the component is being moved.
            n2.key != null || parentComponent && n2 === parentComponent.subTree
          ) {
            traverseStaticChildren(
              n1,
              n2,
              true
              /* shallow */
            );
          }
        } else {
          patchChildren(
            n1,
            n2,
            container,
            fragmentEndAnchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      n2.slotScopeIds = slotScopeIds;
      if (n1 == null) {
        if (n2.shapeFlag & 512) {
          parentComponent.ctx.activate(
            n2,
            container,
            anchor,
            namespace,
            optimized
          );
        } else {
          mountComponent(
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            optimized
          );
        }
      } else {
        updateComponent(n1, n2, optimized);
      }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
      const instance = initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense
      );
      if (isKeepAlive(initialVNode)) {
        instance.ctx.renderer = internals;
      }
      {
        setupComponent(instance, false, optimized);
      }
      if (instance.asyncDep) {
        parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
        if (!initialVNode.el) {
          const placeholder = instance.subTree = createVNode(Comment);
          processCommentNode(null, placeholder, container, anchor);
          initialVNode.placeholder = placeholder.el;
        }
      } else {
        setupRenderEffect(
          instance,
          initialVNode,
          container,
          anchor,
          parentSuspense,
          namespace,
          optimized
        );
      }
    };
    const updateComponent = (n1, n2, optimized) => {
      const instance = n2.component = n1.component;
      if (shouldUpdateComponent(n1, n2, optimized)) {
        if (instance.asyncDep && !instance.asyncResolved) {
          updateComponentPreRender(instance, n2, optimized);
          return;
        } else {
          instance.next = n2;
          instance.update();
        }
      } else {
        n2.el = n1.el;
        instance.vnode = n2;
      }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          let vnodeHook;
          const { el, props } = initialVNode;
          const { bm, m, parent, root, type } = instance;
          const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
          toggleRecurse(instance, false);
          if (bm) {
            invokeArrayFns(bm);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
            invokeVNodeHook(vnodeHook, parent, initialVNode);
          }
          toggleRecurse(instance, true);
          if (el && hydrateNode) {
            const hydrateSubTree = () => {
              instance.subTree = renderComponentRoot(instance);
              hydrateNode(
                el,
                instance.subTree,
                instance,
                parentSuspense,
                null
              );
            };
            if (isAsyncWrapperVNode && type.__asyncHydrate) {
              type.__asyncHydrate(
                el,
                instance,
                hydrateSubTree
              );
            } else {
              hydrateSubTree();
            }
          } else {
            if (root.ce && // @ts-expect-error _def is private
            root.ce._def.shadowRoot !== false) {
              root.ce._injectChildStyle(type);
            }
            const subTree = instance.subTree = renderComponentRoot(instance);
            patch(
              null,
              subTree,
              container,
              anchor,
              instance,
              parentSuspense,
              namespace
            );
            initialVNode.el = subTree.el;
          }
          if (m) {
            queuePostRenderEffect(m, parentSuspense);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
            const scopedInitialVNode = initialVNode;
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
              parentSuspense
            );
          }
          if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
            instance.a && queuePostRenderEffect(instance.a, parentSuspense);
          }
          instance.isMounted = true;
          initialVNode = container = anchor = null;
        } else {
          let { next, bu, u, parent, vnode } = instance;
          {
            const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
            if (nonHydratedAsyncRoot) {
              if (next) {
                next.el = vnode.el;
                updateComponentPreRender(instance, next, optimized);
              }
              nonHydratedAsyncRoot.asyncDep.then(() => {
                if (!instance.isUnmounted) {
                  componentUpdateFn();
                }
              });
              return;
            }
          }
          let originNext = next;
          let vnodeHook;
          toggleRecurse(instance, false);
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next, optimized);
          } else {
            next = vnode;
          }
          if (bu) {
            invokeArrayFns(bu);
          }
          if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
            invokeVNodeHook(vnodeHook, parent, next, vnode);
          }
          toggleRecurse(instance, true);
          const nextTree = renderComponentRoot(instance);
          const prevTree = instance.subTree;
          instance.subTree = nextTree;
          patch(
            prevTree,
            nextTree,
            // parent may have changed if it's in a teleport
            hostParentNode(prevTree.el),
            // anchor may have changed if it's in a fragment
            getNextHostNode(prevTree),
            instance,
            parentSuspense,
            namespace
          );
          next.el = nextTree.el;
          if (originNext === null) {
            updateHOCHostEl(instance, nextTree.el);
          }
          if (u) {
            queuePostRenderEffect(u, parentSuspense);
          }
          if (vnodeHook = next.props && next.props.onVnodeUpdated) {
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, next, vnode),
              parentSuspense
            );
          }
        }
      };
      instance.scope.on();
      const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
      instance.scope.off();
      const update2 = instance.update = effect.run.bind(effect);
      const job = instance.job = effect.runIfDirty.bind(effect);
      job.i = instance;
      job.id = instance.uid;
      effect.scheduler = () => queueJob(job);
      toggleRecurse(instance, true);
      update2();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
      nextVNode.component = instance;
      const prevProps = instance.vnode.props;
      instance.vnode = nextVNode;
      instance.next = null;
      updateProps(instance, nextVNode.props, prevProps, optimized);
      updateSlots(instance, nextVNode.children, optimized);
      pauseTracking();
      flushPreFlushCbs(instance);
      resetTracking();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
      const c1 = n1 && n1.children;
      const prevShapeFlag = n1 ? n1.shapeFlag : 0;
      const c2 = n2.children;
      const { patchFlag, shapeFlag } = n2;
      if (patchFlag > 0) {
        if (patchFlag & 128) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        } else if (patchFlag & 256) {
          patchUnkeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        }
      }
      if (shapeFlag & 8) {
        if (prevShapeFlag & 16) {
          unmountChildren(c1, parentComponent, parentSuspense);
        }
        if (c2 !== c1) {
          hostSetElementText(container, c2);
        }
      } else {
        if (prevShapeFlag & 16) {
          if (shapeFlag & 16) {
            patchKeyedChildren(
              c1,
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else {
            unmountChildren(c1, parentComponent, parentSuspense, true);
          }
        } else {
          if (prevShapeFlag & 8) {
            hostSetElementText(container, "");
          }
          if (shapeFlag & 16) {
            mountChildren(
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          }
        }
      }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      c1 = c1 || EMPTY_ARR;
      c2 = c2 || EMPTY_ARR;
      const oldLength = c1.length;
      const newLength = c2.length;
      const commonLength = Math.min(oldLength, newLength);
      let i;
      for (i = 0; i < commonLength; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        patch(
          c1[i],
          nextChild,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
      if (oldLength > newLength) {
        unmountChildren(
          c1,
          parentComponent,
          parentSuspense,
          true,
          false,
          commonLength
        );
      } else {
        mountChildren(
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized,
          commonLength
        );
      }
    };
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let i = 0;
      const l2 = c2.length;
      let e1 = c1.length - 1;
      let e2 = l2 - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
          while (i <= e2) {
            patch(
              null,
              c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            i++;
          }
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i], parentComponent, parentSuspense, true);
          i++;
        }
      } else {
        const s1 = i;
        const s2 = i;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        for (i = s2; i <= e2; i++) {
          const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
          if (nextChild.key != null) {
            keyToNewIndexMap.set(nextChild.key, i);
          }
        }
        let j;
        let patched = 0;
        const toBePatched = e2 - s2 + 1;
        let moved = false;
        let maxNewIndexSoFar = 0;
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (i = 0; i < toBePatched; i++)
          newIndexToOldIndexMap[i] = 0;
        for (i = s1; i <= e1; i++) {
          const prevChild = c1[i];
          if (patched >= toBePatched) {
            unmount(prevChild, parentComponent, parentSuspense, true);
            continue;
          }
          let newIndex;
          if (prevChild.key != null) {
            newIndex = keyToNewIndexMap.get(prevChild.key);
          } else {
            for (j = s2; j <= e2; j++) {
              if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
                newIndex = j;
                break;
              }
            }
          }
          if (newIndex === void 0) {
            unmount(prevChild, parentComponent, parentSuspense, true);
          } else {
            newIndexToOldIndexMap[newIndex - s2] = i + 1;
            if (newIndex >= maxNewIndexSoFar) {
              maxNewIndexSoFar = newIndex;
            } else {
              moved = true;
            }
            patch(
              prevChild,
              c2[newIndex],
              container,
              null,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            patched++;
          }
        }
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
        j = increasingNewIndexSequence.length - 1;
        for (i = toBePatched - 1; i >= 0; i--) {
          const nextIndex = s2 + i;
          const nextChild = c2[nextIndex];
          const anchorVNode = c2[nextIndex + 1];
          const anchor = nextIndex + 1 < l2 ? (
            // #13559, #14173 fallback to el placeholder for unresolved async component
            anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
          ) : parentAnchor;
          if (newIndexToOldIndexMap[i] === 0) {
            patch(
              null,
              nextChild,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (moved) {
            if (j < 0 || i !== increasingNewIndexSequence[j]) {
              move(nextChild, container, anchor, 2);
            } else {
              j--;
            }
          }
        }
      }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
      const { el, type, transition, children, shapeFlag } = vnode;
      if (shapeFlag & 6) {
        move(vnode.component.subTree, container, anchor, moveType);
        return;
      }
      if (shapeFlag & 128) {
        vnode.suspense.move(container, anchor, moveType);
        return;
      }
      if (shapeFlag & 64) {
        type.move(vnode, container, anchor, internals);
        return;
      }
      if (type === Fragment) {
        hostInsert(el, container, anchor);
        for (let i = 0; i < children.length; i++) {
          move(children[i], container, anchor, moveType);
        }
        hostInsert(vnode.anchor, container, anchor);
        return;
      }
      if (type === Static) {
        moveStaticNode(vnode, container, anchor);
        return;
      }
      const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
      if (needTransition2) {
        if (moveType === 0) {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        } else {
          const { leave, delayLeave, afterLeave } = transition;
          const remove22 = () => {
            if (vnode.ctx.isUnmounted) {
              hostRemove(el);
            } else {
              hostInsert(el, container, anchor);
            }
          };
          const performLeave = () => {
            if (el._isLeaving) {
              el[leaveCbKey](
                true
                /* cancelled */
              );
            }
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          };
          if (delayLeave) {
            delayLeave(el, remove22, performLeave);
          } else {
            performLeave();
          }
        }
      } else {
        hostInsert(el, container, anchor);
      }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
      const {
        type,
        props,
        ref: ref2,
        children,
        dynamicChildren,
        shapeFlag,
        patchFlag,
        dirs,
        cacheIndex
      } = vnode;
      if (patchFlag === -2) {
        optimized = false;
      }
      if (ref2 != null) {
        pauseTracking();
        setRef(ref2, null, parentSuspense, vnode, true);
        resetTracking();
      }
      if (cacheIndex != null) {
        parentComponent.renderCache[cacheIndex] = void 0;
      }
      if (shapeFlag & 256) {
        parentComponent.ctx.deactivate(vnode);
        return;
      }
      const shouldInvokeDirs = shapeFlag & 1 && dirs;
      const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
      let vnodeHook;
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
      if (shapeFlag & 6) {
        unmountComponent(vnode.component, parentSuspense, doRemove);
      } else {
        if (shapeFlag & 128) {
          vnode.suspense.unmount(parentSuspense, doRemove);
          return;
        }
        if (shouldInvokeDirs) {
          invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
        }
        if (shapeFlag & 64) {
          vnode.type.remove(
            vnode,
            parentComponent,
            parentSuspense,
            internals,
            doRemove
          );
        } else if (dynamicChildren && // #5154
        // when v-once is used inside a block, setBlockTracking(-1) marks the
        // parent block with hasOnce: true
        // so that it doesn't take the fast path during unmount - otherwise
        // components nested in v-once are never unmounted.
        !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
        (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
          unmountChildren(
            dynamicChildren,
            parentComponent,
            parentSuspense,
            false,
            true
          );
        } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
          unmountChildren(children, parentComponent, parentSuspense);
        }
        if (doRemove) {
          remove2(vnode);
        }
      }
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        }, parentSuspense);
      }
    };
    const remove2 = (vnode) => {
      const { type, el, anchor, transition } = vnode;
      if (type === Fragment) {
        {
          removeFragment(el, anchor);
        }
        return;
      }
      if (type === Static) {
        removeStaticNode(vnode);
        return;
      }
      const performRemove = () => {
        hostRemove(el);
        if (transition && !transition.persisted && transition.afterLeave) {
          transition.afterLeave();
        }
      };
      if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
        const { leave, delayLeave } = transition;
        const performLeave = () => leave(el, performRemove);
        if (delayLeave) {
          delayLeave(vnode.el, performRemove, performLeave);
        } else {
          performLeave();
        }
      } else {
        performRemove();
      }
    };
    const removeFragment = (cur, end) => {
      let next;
      while (cur !== end) {
        next = hostNextSibling(cur);
        hostRemove(cur);
        cur = next;
      }
      hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
      const { bum, scope, job, subTree, um, m, a } = instance;
      invalidateMount(m);
      invalidateMount(a);
      if (bum) {
        invokeArrayFns(bum);
      }
      scope.stop();
      if (job) {
        job.flags |= 8;
        unmount(subTree, instance, parentSuspense, doRemove);
      }
      if (um) {
        queuePostRenderEffect(um, parentSuspense);
      }
      queuePostRenderEffect(() => {
        instance.isUnmounted = true;
      }, parentSuspense);
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
      for (let i = start; i < children.length; i++) {
        unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
      }
    };
    const getNextHostNode = (vnode) => {
      if (vnode.shapeFlag & 6) {
        return getNextHostNode(vnode.component.subTree);
      }
      if (vnode.shapeFlag & 128) {
        return vnode.suspense.next();
      }
      const el = hostNextSibling(vnode.anchor || vnode.el);
      const teleportEnd = el && el[TeleportEndKey];
      return teleportEnd ? hostNextSibling(teleportEnd) : el;
    };
    let isFlushing = false;
    const render = (vnode, container, namespace) => {
      let instance;
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
          instance = container._vnode.component;
        }
      } else {
        patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
        );
      }
      container._vnode = vnode;
      if (!isFlushing) {
        isFlushing = true;
        flushPreFlushCbs(instance);
        flushPostFlushCbs();
        isFlushing = false;
      }
    };
    const internals = {
      p: patch,
      um: unmount,
      m: move,
      r: remove2,
      mt: mountComponent,
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      n: getNextHostNode,
      o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
      [hydrate, hydrateNode] = createHydrationFns(
        internals
      );
    }
    return {
      render,
      hydrate,
      createApp: createAppAPI(render, hydrate)
    };
  }
  function resolveChildrenNamespace({ type, props }, currentNamespace) {
    return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
  }
  function toggleRecurse({ effect, job }, allowed) {
    if (allowed) {
      effect.flags |= 32;
      job.flags |= 4;
    } else {
      effect.flags &= -33;
      job.flags &= -5;
    }
  }
  function needTransition(parentSuspense, transition) {
    return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
  }
  function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if (isArray(ch1) && isArray(ch2)) {
      for (let i = 0; i < ch1.length; i++) {
        const c1 = ch1[i];
        let c2 = ch2[i];
        if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
          if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
            c2 = ch2[i] = cloneIfMounted(ch2[i]);
            c2.el = c1.el;
          }
          if (!shallow && c2.patchFlag !== -2)
            traverseStaticChildren(c1, c2);
        }
        if (c2.type === Text) {
          if (c2.patchFlag !== -1) {
            c2.el = c1.el;
          } else {
            c2.__elIndex = i + // take fragment start anchor into account
            (n1.type === Fragment ? 1 : 0);
          }
        }
        if (c2.type === Comment && !c2.el) {
          c2.el = c1.el;
        }
      }
    }
  }
  function getSequence(arr) {
    const p2 = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p2[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = u + v >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p2[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p2[v];
    }
    return result;
  }
  function locateNonHydratedAsyncRoot(instance) {
    const subComponent = instance.subTree.component;
    if (subComponent) {
      if (subComponent.asyncDep && !subComponent.asyncResolved) {
        return subComponent;
      } else {
        return locateNonHydratedAsyncRoot(subComponent);
      }
    }
  }
  function invalidateMount(hooks) {
    if (hooks) {
      for (let i = 0; i < hooks.length; i++)
        hooks[i].flags |= 8;
    }
  }
  function resolveAsyncComponentPlaceholder(anchorVnode) {
    if (anchorVnode.placeholder) {
      return anchorVnode.placeholder;
    }
    const instance = anchorVnode.component;
    if (instance) {
      return resolveAsyncComponentPlaceholder(instance.subTree);
    }
    return null;
  }
  const isSuspense = (type) => type.__isSuspense;
  function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
      if (isArray(fn)) {
        suspense.effects.push(...fn);
      } else {
        suspense.effects.push(fn);
      }
    } else {
      queuePostFlushCb(fn);
    }
  }
  const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
  const Text = /* @__PURE__ */ Symbol.for("v-txt");
  const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
  const Static = /* @__PURE__ */ Symbol.for("v-stc");
  const blockStack = [];
  let currentBlock = null;
  function openBlock(disableTracking = false) {
    blockStack.push(currentBlock = disableTracking ? null : []);
  }
  function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
  }
  let isBlockTreeEnabled = 1;
  function setBlockTracking(value, inVOnce = false) {
    isBlockTreeEnabled += value;
    if (value < 0 && currentBlock && inVOnce) {
      currentBlock.hasOnce = true;
    }
  }
  function setupBlock(vnode) {
    vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
    closeBlock();
    if (isBlockTreeEnabled > 0 && currentBlock) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(
      createBaseVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        shapeFlag,
        true
      )
    );
  }
  function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(
      createVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        true
      )
    );
  }
  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }
  function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  const normalizeKey = ({ key }) => key != null ? key : null;
  const normalizeRef = ({
    ref: ref2,
    ref_key,
    ref_for
  }) => {
    if (typeof ref2 === "number") {
      ref2 = "" + ref2;
    }
    return ref2 != null ? isString(ref2) || /* @__PURE__ */ isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
  };
  function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
      __v_isVNode: true,
      __v_skip: true,
      type,
      props,
      key: props && normalizeKey(props),
      ref: props && normalizeRef(props),
      scopeId: currentScopeId,
      slotScopeIds: null,
      children,
      component: null,
      suspense: null,
      ssContent: null,
      ssFallback: null,
      dirs: null,
      transition: null,
      el: null,
      anchor: null,
      target: null,
      targetStart: null,
      targetAnchor: null,
      staticCount: 0,
      shapeFlag,
      patchFlag,
      dynamicProps,
      dynamicChildren: null,
      appContext: null,
      ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
      normalizeChildren(vnode, children);
      if (shapeFlag & 128) {
        type.normalize(vnode);
      }
    } else if (children) {
      vnode.shapeFlag |= isString(children) ? 8 : 16;
    }
    if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
    !isBlockNode && // has current parent block
    currentBlock && // presence of a patch flag indicates this node needs patching on updates.
    // component nodes also should always be patched, because even if the
    // component doesn't need to update, it needs to persist the instance on to
    // the next vnode so that it can be properly unmounted later.
    (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    vnode.patchFlag !== 32) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  const createVNode = _createVNode;
  function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
      type = Comment;
    }
    if (isVNode(type)) {
      const cloned = cloneVNode(
        type,
        props,
        true
        /* mergeRef: true */
      );
      if (children) {
        normalizeChildren(cloned, children);
      }
      if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
        if (cloned.shapeFlag & 6) {
          currentBlock[currentBlock.indexOf(type)] = cloned;
        } else {
          currentBlock.push(cloned);
        }
      }
      cloned.patchFlag = -2;
      return cloned;
    }
    if (isClassComponent(type)) {
      type = type.__vccOpts;
    }
    if (props) {
      props = guardReactiveProps(props);
      let { class: klass, style } = props;
      if (klass && !isString(klass)) {
        props.class = normalizeClass(klass);
      }
      if (isObject(style)) {
        if (/* @__PURE__ */ isProxy(style) && !isArray(style)) {
          style = extend({}, style);
        }
        props.style = normalizeStyle(style);
      }
    }
    const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
    return createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      isBlockNode,
      true
    );
  }
  function guardReactiveProps(props) {
    if (!props)
      return null;
    return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
  }
  function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
    const { props, ref: ref2, patchFlag, children, transition } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
      __v_isVNode: true,
      __v_skip: true,
      type: vnode.type,
      props: mergedProps,
      key: mergedProps && normalizeKey(mergedProps),
      ref: extraProps && extraProps.ref ? (
        // #2078 in the case of <component :is="vnode" ref="extra"/>
        // if the vnode itself already has a ref, cloneVNode will need to merge
        // the refs so the single vnode can be set on multiple refs
        mergeRef && ref2 ? isArray(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps)
      ) : ref2,
      scopeId: vnode.scopeId,
      slotScopeIds: vnode.slotScopeIds,
      children,
      target: vnode.target,
      targetStart: vnode.targetStart,
      targetAnchor: vnode.targetAnchor,
      staticCount: vnode.staticCount,
      shapeFlag: vnode.shapeFlag,
      // if the vnode is cloned with extra props, we can no longer assume its
      // existing patch flag to be reliable and need to add the FULL_PROPS flag.
      // note: preserve flag for fragments since they use the flag for children
      // fast paths only.
      patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
      dynamicProps: vnode.dynamicProps,
      dynamicChildren: vnode.dynamicChildren,
      appContext: vnode.appContext,
      dirs: vnode.dirs,
      transition,
      // These should technically only be non-null on mounted VNodes. However,
      // they *should* be copied for kept-alive vnodes. So we just always copy
      // them since them being non-null during a mount doesn't affect the logic as
      // they will simply be overwritten.
      component: vnode.component,
      suspense: vnode.suspense,
      ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
      ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
      placeholder: vnode.placeholder,
      el: vnode.el,
      anchor: vnode.anchor,
      ctx: vnode.ctx,
      ce: vnode.ce
    };
    if (transition && cloneTransition) {
      setTransitionHooks(
        cloned,
        transition.clone(cloned)
      );
    }
    return cloned;
  }
  function createTextVNode(text = " ", flag = 0) {
    return createVNode(Text, null, text, flag);
  }
  function createCommentVNode(text = "", asBlock = false) {
    return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
  }
  function normalizeVNode(child) {
    if (child == null || typeof child === "boolean") {
      return createVNode(Comment);
    } else if (isArray(child)) {
      return createVNode(
        Fragment,
        null,
        // #3666, avoid reference pollution when reusing vnode
        child.slice()
      );
    } else if (isVNode(child)) {
      return cloneIfMounted(child);
    } else {
      return createVNode(Text, null, String(child));
    }
  }
  function cloneIfMounted(child) {
    return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
  }
  function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
      children = null;
    } else if (isArray(children)) {
      type = 16;
    } else if (typeof children === "object") {
      if (shapeFlag & (1 | 64)) {
        const slot = children.default;
        if (slot) {
          slot._c && (slot._d = false);
          normalizeChildren(vnode, slot());
          slot._c && (slot._d = true);
        }
        return;
      } else {
        type = 32;
        const slotFlag = children._;
        if (!slotFlag && !isInternalObject(children)) {
          children._ctx = currentRenderingInstance;
        } else if (slotFlag === 3 && currentRenderingInstance) {
          if (currentRenderingInstance.slots._ === 1) {
            children._ = 1;
          } else {
            children._ = 2;
            vnode.patchFlag |= 1024;
          }
        }
      }
    } else if (isFunction(children)) {
      children = { default: children, _ctx: currentRenderingInstance };
      type = 32;
    } else {
      children = String(children);
      if (shapeFlag & 64) {
        type = 16;
        children = [createTextVNode(children)];
      } else {
        type = 8;
      }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
  }
  function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
      const toMerge = args[i];
      for (const key in toMerge) {
        if (key === "class") {
          if (ret.class !== toMerge.class) {
            ret.class = normalizeClass([ret.class, toMerge.class]);
          }
        } else if (key === "style") {
          ret.style = normalizeStyle([ret.style, toMerge.style]);
        } else if (isOn(key)) {
          const existing = ret[key];
          const incoming = toMerge[key];
          if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
            ret[key] = existing ? [].concat(existing, incoming) : incoming;
          }
        } else if (key !== "") {
          ret[key] = toMerge[key];
        }
      }
    }
    return ret;
  }
  function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7, [
      vnode,
      prevVNode
    ]);
  }
  const emptyAppContext = createAppContext();
  let uid = 0;
  function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
      uid: uid++,
      vnode,
      type,
      parent,
      appContext,
      root: null,
      // to be immediately set
      next: null,
      subTree: null,
      // will be set synchronously right after creation
      effect: null,
      update: null,
      // will be set synchronously right after creation
      job: null,
      scope: new EffectScope(
        true
        /* detached */
      ),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: parent ? parent.provides : Object.create(appContext.provides),
      ids: parent ? parent.ids : ["", 0, 0],
      accessCache: null,
      renderCache: [],
      // local resolved assets
      components: null,
      directives: null,
      // resolved props and emits options
      propsOptions: normalizePropsOptions(type, appContext),
      emitsOptions: normalizeEmitsOptions(type, appContext),
      // emit
      emit: null,
      // to be set immediately
      emitted: null,
      // props default value
      propsDefaults: EMPTY_OBJ,
      // inheritAttrs
      inheritAttrs: type.inheritAttrs,
      // state
      ctx: EMPTY_OBJ,
      data: EMPTY_OBJ,
      props: EMPTY_OBJ,
      attrs: EMPTY_OBJ,
      slots: EMPTY_OBJ,
      refs: EMPTY_OBJ,
      setupState: EMPTY_OBJ,
      setupContext: null,
      // suspense related
      suspense,
      suspenseId: suspense ? suspense.pendingId : 0,
      asyncDep: null,
      asyncResolved: false,
      // lifecycle hooks
      // not using enums here because it results in computed properties
      isMounted: false,
      isUnmounted: false,
      isDeactivated: false,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null
    };
    {
      instance.ctx = { _: instance };
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    if (vnode.ce) {
      vnode.ce(instance);
    }
    return instance;
  }
  let currentInstance = null;
  const getCurrentInstance = () => currentInstance || currentRenderingInstance;
  let internalSetCurrentInstance;
  let setInSSRSetupState;
  {
    const g = getGlobalThis();
    const registerGlobalSetter = (key, setter) => {
      let setters;
      if (!(setters = g[key]))
        setters = g[key] = [];
      setters.push(setter);
      return (v) => {
        if (setters.length > 1)
          setters.forEach((set2) => set2(v));
        else
          setters[0](v);
      };
    };
    internalSetCurrentInstance = registerGlobalSetter(
      `__VUE_INSTANCE_SETTERS__`,
      (v) => currentInstance = v
    );
    setInSSRSetupState = registerGlobalSetter(
      `__VUE_SSR_SETTERS__`,
      (v) => isInSSRComponentSetup = v
    );
  }
  const setCurrentInstance = (instance) => {
    const prev = currentInstance;
    internalSetCurrentInstance(instance);
    instance.scope.on();
    return () => {
      instance.scope.off();
      internalSetCurrentInstance(prev);
    };
  };
  const unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    internalSetCurrentInstance(null);
  };
  function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4;
  }
  let isInSSRComponentSetup = false;
  function setupComponent(instance, isSSR = false, optimized = false) {
    isSSR && setInSSRSetupState(isSSR);
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children, optimized || isSSR);
    const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
    isSSR && setInSSRSetupState(false);
    return setupResult;
  }
  function setupStatefulComponent(instance, isSSR) {
    const Component = instance.type;
    instance.accessCache = /* @__PURE__ */ Object.create(null);
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
      pauseTracking();
      const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
      const reset = setCurrentInstance(instance);
      const setupResult = callWithErrorHandling(
        setup,
        instance,
        0,
        [
          instance.props,
          setupContext
        ]
      );
      const isAsyncSetup = isPromise(setupResult);
      resetTracking();
      reset();
      if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
        markAsyncBoundary(instance);
      }
      if (isAsyncSetup) {
        setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
        if (isSSR) {
          return setupResult.then((resolvedResult) => {
            handleSetupResult(instance, resolvedResult, isSSR);
          }).catch((e) => {
            handleError(e, instance, 0);
          });
        } else {
          instance.asyncDep = setupResult;
        }
      } else {
        handleSetupResult(instance, setupResult, isSSR);
      }
    } else {
      finishComponentSetup(instance, isSSR);
    }
  }
  function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
      if (instance.type.__ssrInlineRender) {
        instance.ssrRender = setupResult;
      } else {
        instance.render = setupResult;
      }
    } else if (isObject(setupResult)) {
      instance.setupState = proxyRefs(setupResult);
    } else
      ;
    finishComponentSetup(instance, isSSR);
  }
  let compile;
  function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    if (!instance.render) {
      if (!isSSR && compile && !Component.render) {
        const template = Component.template || resolveMergedOptions(instance).template;
        if (template) {
          const { isCustomElement, compilerOptions } = instance.appContext.config;
          const { delimiters, compilerOptions: componentCompilerOptions } = Component;
          const finalCompilerOptions = extend(
            extend(
              {
                isCustomElement,
                delimiters
              },
              compilerOptions
            ),
            componentCompilerOptions
          );
          Component.render = compile(template, finalCompilerOptions);
        }
      }
      instance.render = Component.render || NOOP;
    }
    {
      const reset = setCurrentInstance(instance);
      pauseTracking();
      try {
        applyOptions(instance);
      } finally {
        resetTracking();
        reset();
      }
    }
  }
  const attrsProxyHandlers = {
    get(target, key) {
      track(target, "get", "");
      return target[key];
    }
  };
  function createSetupContext(instance) {
    const expose = (exposed) => {
      instance.exposed = exposed || {};
    };
    {
      return {
        attrs: new Proxy(instance.attrs, attrsProxyHandlers),
        slots: instance.slots,
        emit: instance.emit,
        expose
      };
    }
  }
  function getComponentPublicInstance(instance) {
    if (instance.exposed) {
      return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
        get(target, key) {
          if (key in target) {
            return target[key];
          } else if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
          }
        },
        has(target, key) {
          return key in target || key in publicPropertiesMap;
        }
      }));
    } else {
      return instance.proxy;
    }
  }
  const classifyRE = /(?:^|[-_])\w/g;
  const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
  function getComponentName(Component, includeInferred = true) {
    return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
  }
  function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
      const match = Component.__file.match(/([^/\\]+)\.\w+$/);
      if (match) {
        name = match[1];
      }
    }
    if (!name && instance) {
      const inferFromRegistry = (registry2) => {
        for (const key in registry2) {
          if (registry2[key] === Component) {
            return key;
          }
        }
      };
      name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
        instance.parent.type.components
      ) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
  }
  function isClassComponent(value) {
    return isFunction(value) && "__vccOpts" in value;
  }
  const computed = (getterOrOptions, debugOptions) => {
    const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
    return c;
  };
  const version = "3.5.27";
  /**
  * @vue/runtime-dom v3.5.27
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **/
  let policy = void 0;
  const tt = typeof window !== "undefined" && window.trustedTypes;
  if (tt) {
    try {
      policy = /* @__PURE__ */ tt.createPolicy("vue", {
        createHTML: (val) => val
      });
    } catch (e) {
    }
  }
  const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
  const svgNS = "http://www.w3.org/2000/svg";
  const mathmlNS = "http://www.w3.org/1998/Math/MathML";
  const doc = typeof document !== "undefined" ? document : null;
  const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
  const nodeOps = {
    insert: (child, parent, anchor) => {
      parent.insertBefore(child, anchor || null);
    },
    remove: (child) => {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    createElement: (tag, namespace, is, props) => {
      const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
      if (tag === "select" && props && props.multiple != null) {
        el.setAttribute("multiple", props.multiple);
      }
      return el;
    },
    createText: (text) => doc.createTextNode(text),
    createComment: (text) => doc.createComment(text),
    setText: (node, text) => {
      node.nodeValue = text;
    },
    setElementText: (el, text) => {
      el.textContent = text;
    },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => doc.querySelector(selector),
    setScopeId(el, id) {
      el.setAttribute(id, "");
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(content, parent, anchor, namespace, start, end) {
      const before = anchor ? anchor.previousSibling : parent.lastChild;
      if (start && (start === end || start.nextSibling)) {
        while (true) {
          parent.insertBefore(start.cloneNode(true), anchor);
          if (start === end || !(start = start.nextSibling))
            break;
        }
      } else {
        templateContainer.innerHTML = unsafeToTrustedHTML(
          namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
        );
        const template = templateContainer.content;
        if (namespace === "svg" || namespace === "mathml") {
          const wrapper = template.firstChild;
          while (wrapper.firstChild) {
            template.appendChild(wrapper.firstChild);
          }
          template.removeChild(wrapper);
        }
        parent.insertBefore(template, anchor);
      }
      return [
        // first
        before ? before.nextSibling : parent.firstChild,
        // last
        anchor ? anchor.previousSibling : parent.lastChild
      ];
    }
  };
  const vtcKey = /* @__PURE__ */ Symbol("_vtc");
  function patchClass(el, value, isSVG) {
    const transitionClasses = el[vtcKey];
    if (transitionClasses) {
      value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
    }
    if (value == null) {
      el.removeAttribute("class");
    } else if (isSVG) {
      el.setAttribute("class", value);
    } else {
      el.className = value;
    }
  }
  const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
  const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
  const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
  const displayRE = /(?:^|;)\s*display\s*:/;
  function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString(next);
    let hasControlledDisplay = false;
    if (next && !isCssString) {
      if (prev) {
        if (!isString(prev)) {
          for (const key in prev) {
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        } else {
          for (const prevStyle of prev.split(";")) {
            const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        }
      }
      for (const key in next) {
        if (key === "display") {
          hasControlledDisplay = true;
        }
        setStyle(style, key, next[key]);
      }
    } else {
      if (isCssString) {
        if (prev !== next) {
          const cssVarText = style[CSS_VAR_TEXT];
          if (cssVarText) {
            next += ";" + cssVarText;
          }
          style.cssText = next;
          hasControlledDisplay = displayRE.test(next);
        }
      } else if (prev) {
        el.removeAttribute("style");
      }
    }
    if (vShowOriginalDisplay in el) {
      el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
      if (el[vShowHidden]) {
        style.display = "none";
      }
    }
  }
  const importantRE = /\s*!important$/;
  function setStyle(style, name, val) {
    if (isArray(val)) {
      val.forEach((v) => setStyle(style, name, v));
    } else {
      if (val == null)
        val = "";
      if (name.startsWith("--")) {
        style.setProperty(name, val);
      } else {
        const prefixed = autoPrefix(style, name);
        if (importantRE.test(val)) {
          style.setProperty(
            hyphenate(prefixed),
            val.replace(importantRE, ""),
            "important"
          );
        } else {
          style[prefixed] = val;
        }
      }
    }
  }
  const prefixes = ["Webkit", "Moz", "ms"];
  const prefixCache = {};
  function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
      return cached;
    }
    let name = camelize(rawName);
    if (name !== "filter" && name in style) {
      return prefixCache[rawName] = name;
    }
    name = capitalize(name);
    for (let i = 0; i < prefixes.length; i++) {
      const prefixed = prefixes[i] + name;
      if (prefixed in style) {
        return prefixCache[rawName] = prefixed;
      }
    }
    return rawName;
  }
  const xlinkNS = "http://www.w3.org/1999/xlink";
  function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
    if (isSVG && key.startsWith("xlink:")) {
      if (value == null) {
        el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      if (value == null || isBoolean && !includeBooleanAttr(value)) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(
          key,
          isBoolean ? "" : isSymbol(value) ? String(value) : value
        );
      }
    }
  }
  function patchDOMProp(el, key, value, parentComponent, attrName) {
    if (key === "innerHTML" || key === "textContent") {
      if (value != null) {
        el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
      }
      return;
    }
    const tag = el.tagName;
    if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
    !tag.includes("-")) {
      const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
      const newValue = value == null ? (
        // #11647: value should be set as empty string for null and undefined,
        // but <input type="checkbox"> should be set as 'on'.
        el.type === "checkbox" ? "on" : ""
      ) : String(value);
      if (oldValue !== newValue || !("_value" in el)) {
        el.value = newValue;
      }
      if (value == null) {
        el.removeAttribute(key);
      }
      el._value = value;
      return;
    }
    let needRemove = false;
    if (value === "" || value == null) {
      const type = typeof el[key];
      if (type === "boolean") {
        value = includeBooleanAttr(value);
      } else if (value == null && type === "string") {
        value = "";
        needRemove = true;
      } else if (type === "number") {
        value = 0;
        needRemove = true;
      }
    }
    try {
      el[key] = value;
    } catch (e) {
    }
    needRemove && el.removeAttribute(attrName || key);
  }
  function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
  }
  function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
  }
  const veiKey = /* @__PURE__ */ Symbol("_vei");
  function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    const invokers = el[veiKey] || (el[veiKey] = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
      existingInvoker.value = nextValue;
    } else {
      const [name, options] = parseName(rawName);
      if (nextValue) {
        const invoker = invokers[rawName] = createInvoker(
          nextValue,
          instance
        );
        addEventListener(el, name, invoker, options);
      } else if (existingInvoker) {
        removeEventListener(el, name, existingInvoker, options);
        invokers[rawName] = void 0;
      }
    }
  }
  const optionsModifierRE = /(?:Once|Passive|Capture)$/;
  function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
      options = {};
      let m;
      while (m = name.match(optionsModifierRE)) {
        name = name.slice(0, name.length - m[0].length);
        options[m[0].toLowerCase()] = true;
      }
    }
    const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
    return [event, options];
  }
  let cachedNow = 0;
  const p = /* @__PURE__ */ Promise.resolve();
  const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
  function createInvoker(initialValue, instance) {
    const invoker = (e) => {
      if (!e._vts) {
        e._vts = Date.now();
      } else if (e._vts <= invoker.attached) {
        return;
      }
      callWithAsyncErrorHandling(
        patchStopImmediatePropagation(e, invoker.value),
        instance,
        5,
        [e]
      );
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
  }
  function patchStopImmediatePropagation(e, value) {
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      return value.map(
        (fn) => (e2) => !e2._stopped && fn && fn(e2)
      );
    } else {
      return value;
    }
  }
  const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
  key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
  const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
    const isSVG = namespace === "svg";
    if (key === "class") {
      patchClass(el, nextValue, isSVG);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (isOn(key)) {
      if (!isModelListener(key)) {
        patchEvent(el, key, prevValue, nextValue, parentComponent);
      }
    } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
      patchDOMProp(el, key, nextValue);
      if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
        patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
      }
    } else if (
      // #11081 force set props for possible async custom element
      el._isVueCE && (/[A-Z]/.test(key) || !isString(nextValue))
    ) {
      patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
    } else {
      if (key === "true-value") {
        el._trueValue = nextValue;
      } else if (key === "false-value") {
        el._falseValue = nextValue;
      }
      patchAttr(el, key, nextValue, isSVG);
    }
  };
  function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
      if (key === "innerHTML" || key === "textContent") {
        return true;
      }
      if (key in el && isNativeOn(key) && isFunction(value)) {
        return true;
      }
      return false;
    }
    if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
      return false;
    }
    if (key === "sandbox" && el.tagName === "IFRAME") {
      return false;
    }
    if (key === "form") {
      return false;
    }
    if (key === "list" && el.tagName === "INPUT") {
      return false;
    }
    if (key === "type" && el.tagName === "TEXTAREA") {
      return false;
    }
    if (key === "width" || key === "height") {
      const tag = el.tagName;
      if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
        return false;
      }
    }
    if (isNativeOn(key) && isString(value)) {
      return false;
    }
    return key in el;
  }
  const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
  let renderer;
  function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions));
  }
  const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    const { mount } = app;
    app.mount = (containerOrSelector) => {
      const container = normalizeContainer(containerOrSelector);
      if (!container)
        return;
      const component = app._component;
      if (!isFunction(component) && !component.render && !component.template) {
        component.template = container.innerHTML;
      }
      if (container.nodeType === 1) {
        container.textContent = "";
      }
      const proxy = mount(container, false, resolveRootNamespace(container));
      if (container instanceof Element) {
        container.removeAttribute("v-cloak");
        container.setAttribute("data-v-app", "");
      }
      return proxy;
    };
    return app;
  };
  function resolveRootNamespace(container) {
    if (container instanceof SVGElement) {
      return "svg";
    }
    if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
      return "mathml";
    }
  }
  function normalizeContainer(container) {
    if (isString(container)) {
      const res = document.querySelector(container);
      return res;
    }
    return container;
  }
  const _hoisted_1 = { class: "st-api-wrapper-panel" };
  const _hoisted_2 = { class: "status" };
  const _hoisted_3 = { key: 0 };
  const _hoisted_4 = { key: 1 };
  const _hoisted_5 = {
    key: 2,
    class: "error"
  };
  const _hoisted_6 = {
    key: 0,
    class: "details"
  };
  const _hoisted_7 = { class: "messages-list" };
  const _hoisted_8 = { class: "role-tag" };
  const _sfc_main = /* @__PURE__ */ defineComponent({
    __name: "App",
    setup(__props) {
      const endpoints2 = /* @__PURE__ */ ref([]);
      const loading = /* @__PURE__ */ ref(false);
      const error = /* @__PURE__ */ ref(null);
      const lastPrompt = /* @__PURE__ */ ref(null);
      const previewMessages = computed(() => {
        var _a;
        return ((_a = lastPrompt.value) == null ? void 0 : _a.chat.slice(0, 5)) ?? [];
      });
      function getApi() {
        const api = window.ST_API;
        if (!api)
          throw new Error("ST_API 未就绪");
        return api;
      }
      function printEndpoints() {
        try {
          const api = getApi();
          endpoints2.value = api.listEndpoints();
          console.log("[ST API Wrapper] endpoints:", endpoints2.value);
          toastr.info(`已打印 endpoints（共 ${endpoints2.value.length} 个）到控制台`);
        } catch (e) {
          error.value = (e == null ? void 0 : e.message) ?? String(e);
        }
      }
      async function fetchPrompt() {
        loading.value = true;
        error.value = null;
        try {
          const api = getApi();
          lastPrompt.value = await api.prompt.get({ timeoutMs: 8e3 });
          console.log("[ST API Wrapper] Final chat prompt:", lastPrompt.value);
          console.log("[ST API Wrapper] Final chat messages:", lastPrompt.value.chat);
          toastr.success(`抓取成功：chat=${lastPrompt.value.chat.length}（已输出到控制台）`);
        } catch (e) {
          error.value = (e == null ? void 0 : e.message) ?? String(e);
        } finally {
          loading.value = false;
        }
      }
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1, [
          createBaseVNode("div", { class: "actions flex-container" }, [
            createBaseVNode("button", {
              class: "menu_button",
              type: "button",
              onClick: printEndpoints
            }, "打印 endpoints（控制台）"),
            createBaseVNode("button", {
              class: "menu_button",
              type: "button",
              onClick: fetchPrompt
            }, "抓取最终提示词（控制台）")
          ]),
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("div", null, "已注册 endpoints：" + toDisplayString(endpoints2.value.length), 1),
            lastPrompt.value ? (openBlock(), createElementBlock("div", _hoisted_3, "上次抓取消息数：" + toDisplayString(lastPrompt.value.chat.length), 1)) : createCommentVNode("", true),
            loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, "正在构建提示词...")) : createCommentVNode("", true),
            error.value ? (openBlock(), createElementBlock("div", _hoisted_5, toDisplayString(error.value), 1)) : createCommentVNode("", true)
          ]),
          lastPrompt.value ? (openBlock(), createElementBlock("details", _hoisted_6, [
            _cache[0] || (_cache[0] = createBaseVNode("summary", null, "预览 messages（前 5 条）", -1)),
            createBaseVNode("div", _hoisted_7, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(previewMessages.value, (msg, idx) => {
                return openBlock(), createElementBlock("div", {
                  key: idx,
                  class: normalizeClass(["message-item", msg.role])
                }, [
                  createBaseVNode("span", _hoisted_8, toDisplayString(msg.role.toUpperCase()), 1),
                  createBaseVNode("pre", null, toDisplayString("parts" in msg ? msg.parts.map((p2) => "text" in p2 ? p2.text : "").join("") : msg.content), 1)
                ], 2);
              }), 128))
            ])
          ])) : createCommentVNode("", true)
        ]);
      };
    }
  });
  const App_vue_vue_type_style_index_0_scoped_5dcd21f5_lang = "";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5dcd21f5"]]);
  class ApiRegistry {
    constructor() {
      __publicField(this, "endpoints", /* @__PURE__ */ new Map());
      __publicField(this, "apiTree", /* @__PURE__ */ Object.create(null));
    }
    registerModule(moduleDef) {
      if (!(moduleDef == null ? void 0 : moduleDef.namespace))
        throw new Error("ApiModuleDefinition.namespace is required");
      if (!this.apiTree[moduleDef.namespace]) {
        this.apiTree[moduleDef.namespace] = /* @__PURE__ */ Object.create(null);
      }
      for (const ep of moduleDef.endpoints) {
        const fullName = `${moduleDef.namespace}.${ep.name}`;
        if (this.endpoints.has(fullName)) {
          throw new Error(`Duplicate endpoint: ${fullName}`);
        }
        this.endpoints.set(fullName, ep);
        this.apiTree[moduleDef.namespace][ep.name] = (input) => this.call(fullName, input);
      }
    }
    async call(fullName, input) {
      const ep = this.endpoints.get(fullName);
      if (!ep)
        throw new Error(`Unknown endpoint: ${fullName}`);
      return await ep.handler(input);
    }
    /**
     * Lists all endpoints in "namespace.endpoint" format.
     */
    listEndpoints() {
      return Array.from(this.endpoints.keys()).sort();
    }
    /**
     * Documentation path convention.
     * Docs are maintained under /docs following the API path.
     * Example: "prompt.get" -> "docs/prompt/get.md"
     */
    getDocPath(fullName) {
      const [namespace, endpoint] = fullName.split(".", 2);
      if (!namespace || !endpoint)
        return "";
      return `docs/${namespace}/${endpoint}.md`;
    }
    /**
     * Public API exposed to window.ST_API
     */
    getPublicApi(version2) {
      return {
        version: version2,
        call: this.call.bind(this),
        listEndpoints: this.listEndpoints.bind(this),
        getDocPath: this.getDocPath.bind(this),
        ...this.apiTree
      };
    }
  }
  async function normalizeChatMessages(raw, options = {}) {
    if (!Array.isArray(raw))
      return [];
    const format = options.format || "gemini";
    const mediaFormat = options.mediaFormat || "url";
    const includeSwipes = !!options.includeSwipes;
    const results = await Promise.all(raw.map(async (m) => {
      var _a;
      const text = (m.mes ?? m.content ?? "").toString();
      let role;
      if (m.is_user) {
        role = "user";
      } else if (m.is_system) {
        role = "system";
      } else if (m.role) {
        const r = m.role.toLowerCase();
        if (r === "assistant") {
          role = format === "gemini" ? "model" : "assistant";
        } else {
          role = r;
        }
      } else {
        role = format === "gemini" ? "model" : "assistant";
      }
      const base = {
        role,
        ...m.name ? { name: m.name } : {},
        swipeId: m.swipe_id ?? 0
      };
      if (format === "openai") {
        base.content = text;
        if (includeSwipes && m.swipes)
          base.swipes = m.swipes;
      } else {
        base.parts = await buildParts(text, (_a = m.extra) == null ? void 0 : _a.media, mediaFormat);
        if (includeSwipes && m.swipes) {
          base.swipes = await Promise.all(m.swipes.map((t, idx) => {
            var _a2, _b, _c;
            const swipeMedia = (_c = (_b = (_a2 = m.swipe_info) == null ? void 0 : _a2[idx]) == null ? void 0 : _b.extra) == null ? void 0 : _c.media;
            return buildParts(t, swipeMedia, mediaFormat);
          }));
        }
      }
      return base;
    }));
    return results;
  }
  async function buildParts(text, media, mediaFormat) {
    const parts = [];
    if (text)
      parts.push({ text });
    if (media && Array.isArray(media)) {
      for (const item of media) {
        const mimeType = item.mime_type || (item.type === "image" ? "image/png" : "application/octet-stream");
        if (mediaFormat === "base64") {
          const b64 = await imageUrlToBase64$1(item.url);
          if (b64)
            parts.push({ inlineData: { mimeType, data: b64 } });
        } else {
          parts.push({ fileData: { mimeType, fileUri: item.url } });
        }
      }
    }
    return parts;
  }
  async function imageUrlToBase64$1(url) {
    if (url.startsWith("data:"))
      return url.split(",")[1];
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("[ST API] Base64 conversion failed:", e);
      return null;
    }
  }
  function roleToStFlags(role) {
    const r = String(role || "").toLowerCase();
    if (r === "user")
      return { is_user: true, is_system: false };
    if (r === "system")
      return { is_user: false, is_system: true };
    return { is_user: false, is_system: false };
  }
  function partsToText(parts) {
    if (!Array.isArray(parts))
      return "";
    return parts.map((p2) => "text" in p2 ? p2.text : "").filter((t) => t).join("");
  }
  function partsToMedia(parts) {
    const media = [];
    if (!Array.isArray(parts))
      return media;
    for (const part of parts) {
      if ("fileData" in part) {
        const mimeType = part.fileData.mimeType;
        media.push({
          url: part.fileData.fileUri,
          type: (mimeType == null ? void 0 : mimeType.startsWith("image")) ? "image" : "file",
          mime_type: mimeType,
          source: "injected"
        });
      } else if ("inlineData" in part) {
        const mimeType = part.inlineData.mimeType;
        const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        media.push({
          url: dataUrl,
          type: (mimeType == null ? void 0 : mimeType.startsWith("image")) ? "image" : "file",
          mime_type: mimeType,
          source: "injected"
        });
      }
    }
    return media;
  }
  function swipeToText(swipe) {
    if (typeof swipe === "string")
      return swipe;
    return partsToText(swipe);
  }
  async function chatMessagesToStChat(messages) {
    if (!Array.isArray(messages))
      return [];
    return messages.map((m) => {
      const { is_user, is_system } = roleToStFlags(m.role);
      const name = m.name;
      const swipe_id = typeof m.swipeId === "number" ? m.swipeId : void 0;
      let mes = "";
      let media = [];
      if ("content" in m) {
        mes = String(m.content ?? "");
      } else if ("parts" in m) {
        mes = partsToText(m.parts);
        media = partsToMedia(m.parts);
      }
      const raw = {
        mes,
        is_user,
        is_system,
        ...name ? { name } : {},
        ...swipe_id !== void 0 ? { swipe_id } : {}
      };
      const swipes = m.swipes;
      if (Array.isArray(swipes) && swipes.length > 0) {
        raw.swipes = swipes.map(swipeToText);
      }
      if (media.length > 0) {
        raw.extra = {
          ...raw.extra || {},
          media,
          media_index: 0,
          inline_image: true
        };
      }
      return raw;
    });
  }
  function detectPromptOrderCharacterId(settings, fallback = 100001) {
    var _a;
    const list2 = Array.isArray(settings == null ? void 0 : settings.prompt_order) ? settings.prompt_order : [];
    const hasFallback = list2.some((x) => String(x == null ? void 0 : x.character_id) === String(fallback));
    if (hasFallback)
      return fallback;
    const v = (_a = list2 == null ? void 0 : list2[0]) == null ? void 0 : _a.character_id;
    if (typeof v === "number" && Number.isFinite(v))
      return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
      return Number(v);
    return fallback;
  }
  function normalizeEnabled(value, fallback = true) {
    if (typeof value === "boolean")
      return value;
    return fallback;
  }
  const UTILITY_PROMPT_KEYS$1 = [
    // snake_case (ST)
    "impersonation_prompt",
    "wi_format",
    "scenario_format",
    "personality_format",
    "group_nudge_prompt",
    "new_chat_prompt",
    "new_group_chat_prompt",
    "new_example_chat_prompt",
    "continue_nudge_prompt",
    "send_if_empty",
    "seed",
    // camelCase aliases (best-effort)
    "impersonationPrompt",
    "wiFormat",
    "worldInfoFormat",
    "scenarioFormat",
    "personalityFormat",
    "groupNudgePrompt",
    "newChatPrompt",
    "newGroupChatPrompt",
    "newExampleChatPrompt",
    "continueNudgePrompt",
    "sendIfEmpty"
  ];
  function assertNoUtilityPromptFieldsInOther$1(preset) {
    const other = preset == null ? void 0 : preset.other;
    if (!other || typeof other !== "object" || Array.isArray(other))
      return;
    const found = UTILITY_PROMPT_KEYS$1.find((k) => Object.prototype.hasOwnProperty.call(other, k));
    if (!found)
      return;
    throw new Error(`[ST API] PresetInfo.other contains utility prompt field "${String(found)}". Please move it to PresetInfo.utilityPrompts.`);
  }
  function utilityPromptsToApiSetting(preset) {
    const up = preset == null ? void 0 : preset.utilityPrompts;
    if (!up || typeof up !== "object")
      return {};
    const out = {};
    const set2 = (k, v) => {
      if (v === void 0)
        return;
      out[k] = v;
    };
    set2("impersonation_prompt", up.impersonationPrompt);
    set2("wi_format", up.worldInfoFormat);
    set2("scenario_format", up.scenarioFormat);
    set2("personality_format", up.personalityFormat);
    set2("group_nudge_prompt", up.groupNudgePrompt);
    set2("new_chat_prompt", up.newChatPrompt);
    set2("new_group_chat_prompt", up.newGroupChatPrompt);
    set2("new_example_chat_prompt", up.newExampleChatPrompt);
    set2("continue_nudge_prompt", up.continueNudgePrompt);
    set2("send_if_empty", up.sendIfEmpty);
    set2("seed", up.seed);
    return out;
  }
  function presetInfoToStSettings(preset, options = {}) {
    if (Object.prototype.hasOwnProperty.call(preset, "apiSetting")) {
      throw new Error("[ST API] PresetInfo.apiSetting has been renamed to PresetInfo.other. Please update your code.");
    }
    assertNoUtilityPromptFieldsInOther$1(preset);
    const promptOrderCharacterId = options.promptOrderCharacterId ?? 100001;
    const loadedPrompts = (preset.prompts || []).filter((p2) => p2 && p2.index !== void 0).sort((a, b) => Number(a.index) - Number(b.index));
    const rawOrder = loadedPrompts.map((p2) => ({
      identifier: p2.identifier,
      enabled: normalizeEnabled(p2.enabled, true)
    }));
    const rawPrompts = (preset.prompts || []).map((p2) => {
      const { index, depth, order, trigger: trigger2, position, enabled, ...rest } = p2;
      return {
        ...rest,
        enabled: normalizeEnabled(enabled, true),
        injection_depth: depth ?? 0,
        injection_order: order ?? 100,
        injection_trigger: trigger2 ?? [],
        injection_position: position === "fixed" ? 1 : 0
      };
    });
    const prompt_order = [
      {
        character_id: promptOrderCharacterId,
        order: rawOrder
      }
    ];
    return {
      ...preset.other || {},
      ...utilityPromptsToApiSetting(preset),
      prompts: rawPrompts,
      prompt_order
    };
  }
  function applyPresetToChatCompletionSettings(settings, preset, options = {}) {
    const snapshot = {
      prompts: settings == null ? void 0 : settings.prompts,
      prompt_order: settings == null ? void 0 : settings.prompt_order,
      apiSetting: /* @__PURE__ */ new Map()
    };
    const promptOrderCharacterId = options.promptOrderCharacterId ?? detectPromptOrderCharacterId(settings, 100001);
    const st = presetInfoToStSettings(preset, { promptOrderCharacterId });
    settings.prompts = st.prompts;
    settings.prompt_order = st.prompt_order;
    const mergedApiSetting = { ...preset.other || {}, ...utilityPromptsToApiSetting(preset) };
    Object.keys(mergedApiSetting).forEach((k) => {
      if (k === "prompts" || k === "prompt_order")
        return;
      snapshot.apiSetting.set(k, { hadOwn: Object.prototype.hasOwnProperty.call(settings, k), value: settings[k] });
      settings[k] = mergedApiSetting[k];
    });
    const restore = () => {
      settings.prompts = snapshot.prompts;
      settings.prompt_order = snapshot.prompt_order;
      for (const [k, prev] of snapshot.apiSetting.entries()) {
        if (!prev.hadOwn) {
          delete settings[k];
        } else {
          settings[k] = prev.value;
        }
      }
    };
    return { restore, promptOrderCharacterId };
  }
  function applyPresetPatchToChatCompletionSettings(settings, preset, options = {}) {
    const snapshot = {
      prompts: settings == null ? void 0 : settings.prompts,
      prompt_order: settings == null ? void 0 : settings.prompt_order,
      apiSetting: /* @__PURE__ */ new Map()
    };
    const promptOrderCharacterId = options.promptOrderCharacterId ?? detectPromptOrderCharacterId(settings, 100001);
    const st = presetInfoToStSettings(preset, { promptOrderCharacterId });
    const basePrompts = Array.isArray(settings == null ? void 0 : settings.prompts) ? settings.prompts : [];
    const mergedPrompts = basePrompts.map((p2) => ({ ...p2 }));
    const idxById = /* @__PURE__ */ new Map();
    mergedPrompts.forEach((p2, idx) => {
      const id = p2 == null ? void 0 : p2.identifier;
      if (typeof id === "string" && id)
        idxById.set(id, idx);
    });
    (st.prompts || []).forEach((p2) => {
      const id = p2 == null ? void 0 : p2.identifier;
      if (typeof id !== "string" || !id)
        return;
      if (idxById.has(id)) {
        const i = idxById.get(id);
        mergedPrompts[i] = { ...mergedPrompts[i] ?? {}, ...p2 };
      } else {
        idxById.set(id, mergedPrompts.length);
        mergedPrompts.push({ ...p2 });
      }
    });
    settings.prompts = mergedPrompts;
    const basePromptOrderArr = Array.isArray(snapshot.prompt_order) ? snapshot.prompt_order : [];
    const baseOrderObj = basePromptOrderArr.find((x) => Number(x == null ? void 0 : x.character_id) === Number(promptOrderCharacterId)) ?? basePromptOrderArr[0];
    const baseOrder = Array.isArray(baseOrderObj == null ? void 0 : baseOrderObj.order) ? baseOrderObj.order.filter((x) => x && typeof x.identifier === "string" && x.identifier).map((x) => ({ identifier: String(x.identifier), enabled: normalizeEnabled(x.enabled, true) })) : [];
    const patchOrderObj = Array.isArray(st.prompt_order) ? st.prompt_order[0] : null;
    const patchOrder = Array.isArray(patchOrderObj == null ? void 0 : patchOrderObj.order) ? patchOrderObj.order.filter((x) => x && typeof x.identifier === "string" && x.identifier).map((x) => ({ identifier: String(x.identifier), enabled: normalizeEnabled(x.enabled, true) })) : [];
    const mergedOrder = baseOrder.map((x) => ({ ...x }));
    const orderIdx = /* @__PURE__ */ new Map();
    mergedOrder.forEach((x, i) => orderIdx.set(x.identifier, i));
    patchOrder.forEach((x) => {
      if (orderIdx.has(x.identifier)) {
        mergedOrder[orderIdx.get(x.identifier)].enabled = x.enabled;
      } else {
        orderIdx.set(x.identifier, mergedOrder.length);
        mergedOrder.push({ ...x });
      }
    });
    (st.prompts || []).forEach((p2) => {
      const id = p2 == null ? void 0 : p2.identifier;
      if (typeof id !== "string" || !id)
        return;
      if (orderIdx.has(id))
        return;
      orderIdx.set(id, mergedOrder.length);
      mergedOrder.push({ identifier: id, enabled: normalizeEnabled(p2 == null ? void 0 : p2.enabled, true) });
    });
    settings.prompt_order = [
      {
        character_id: promptOrderCharacterId,
        order: mergedOrder
      }
    ];
    const mergedApiSetting = { ...preset.other || {}, ...utilityPromptsToApiSetting(preset) };
    Object.keys(mergedApiSetting).forEach((k) => {
      if (k === "prompts" || k === "prompt_order")
        return;
      snapshot.apiSetting.set(k, { hadOwn: Object.prototype.hasOwnProperty.call(settings, k), value: settings[k] });
      settings[k] = mergedApiSetting[k];
    });
    const restore = () => {
      settings.prompts = snapshot.prompts;
      settings.prompt_order = snapshot.prompt_order;
      for (const [k, prev] of snapshot.apiSetting.entries()) {
        if (!prev.hadOwn) {
          delete settings[k];
        } else {
          settings[k] = prev.value;
        }
      }
    };
    return { restore, promptOrderCharacterId };
  }
  const reversePositionMap$1 = {
    beforeChar: 0,
    afterChar: 1,
    beforeAn: 2,
    afterAn: 3,
    fixed: 4,
    beforeEm: 5,
    afterEm: 6,
    outlet: 7
  };
  const reverseRoleMap$1 = {
    system: 0,
    user: 1,
    model: 2
  };
  const reverseSelectiveLogicMap$1 = {
    andAny: 0,
    notAll: 1,
    notAny: 2,
    andAll: 3
  };
  function toStEntry$1(entry) {
    const stPosition = reversePositionMap$1[entry.position] ?? (isNaN(Number(entry.position)) ? 0 : Number(entry.position));
    const stRole = entry.position === "fixed" ? reverseRoleMap$1[entry.role || "system"] ?? 0 : null;
    const stSelectiveLogic = reverseSelectiveLogicMap$1[entry.selectiveLogic] ?? 0;
    const constant = entry.activationMode === "always";
    const vectorized = entry.activationMode === "vector";
    return {
      ...entry.other || {},
      uid: entry.index,
      comment: entry.name,
      content: entry.content,
      disable: !entry.enabled,
      constant,
      vectorized,
      order: entry.order,
      depth: entry.depth,
      position: stPosition,
      role: stRole,
      key: entry.key,
      keysecondary: entry.secondaryKey,
      selectiveLogic: stSelectiveLogic,
      caseSensitive: entry.caseSensitive,
      excludeRecursion: entry.excludeRecursion,
      preventRecursion: entry.preventRecursion,
      probability: entry.probability
    };
  }
  function worldBookToStWorldInfo(book) {
    const entries = {};
    (book.entries || []).forEach((e) => {
      entries[e.index] = toStEntry$1(e);
    });
    return { name: book.name, entries };
  }
  function replaceArrayContents(arr, next) {
    arr.length = 0;
    arr.push(...next);
  }
  async function applyChatHistoryInjections(baseChat, injections) {
    if (!Array.isArray(injections) || injections.length === 0)
      return baseChat;
    const base = Array.isArray(baseChat) ? baseChat : [];
    const n = base.length;
    const buckets = Array.from({ length: n + 1 }, () => []);
    const converted = await chatMessagesToStChat(injections.map((x) => x == null ? void 0 : x.message).filter((x) => x));
    let convIdx = 0;
    injections.forEach((inj, idx) => {
      if (!(inj == null ? void 0 : inj.message))
        return;
      const raw = converted[convIdx++];
      if (!raw)
        return;
      const depth = typeof inj.depth === "number" && Number.isFinite(inj.depth) ? Math.max(0, Math.trunc(inj.depth)) : 0;
      const gap = Math.max(0, Math.min(n, n - depth));
      const order = typeof inj.order === "number" && Number.isFinite(inj.order) ? inj.order : 100;
      buckets[gap].push({ order, idx, raw });
    });
    for (const b of buckets) {
      b.sort((a, b2) => a.order - b2.order || a.idx - b2.idx);
    }
    const out = [];
    out.push(...buckets[0].map((x) => x.raw));
    for (let i = 0; i < n; i++) {
      out.push(base[i]);
      out.push(...buckets[i + 1].map((x) => x.raw));
    }
    return out;
  }
  function insertExtraBlocks(messages, blocks) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return blocks.map((b) => ({ role: b.role, content: b.content, ...b.name ? { name: b.name } : {} }));
    }
    if (!Array.isArray(blocks) || blocks.length === 0)
      return messages;
    const result = messages.map((m) => ({ ...m }));
    const insertOne = (msg, insert) => {
      var _a;
      switch (insert) {
        case "head": {
          result.unshift(msg);
          return;
        }
        case "afterSystem": {
          let lastSystem = -1;
          for (let i = 0; i < result.length; i++) {
            if (((_a = result[i]) == null ? void 0 : _a.role) === "system")
              lastSystem = i;
          }
          const idx = lastSystem >= 0 ? lastSystem + 1 : 0;
          result.splice(idx, 0, msg);
          return;
        }
        case "beforeLastUser": {
          const idx = result.map((m) => m == null ? void 0 : m.role).lastIndexOf("user");
          result.splice(idx >= 0 ? idx : 0, 0, msg);
          return;
        }
        case "beforeLastAssistant": {
          const idx = result.map((m) => m == null ? void 0 : m.role).lastIndexOf("assistant");
          result.splice(idx >= 0 ? idx : result.length, 0, msg);
          return;
        }
        case "tail":
        default: {
          result.push(msg);
          return;
        }
      }
    };
    for (const b of blocks) {
      if (!b)
        continue;
      const msg = {
        role: String(b.role || ""),
        content: String(b.content ?? ""),
        ...b.name ? { name: b.name } : {}
      };
      if (typeof b.index === "number" && Number.isFinite(b.index)) {
        const gapIndex = Math.max(0, Math.trunc(b.index));
        const clamped = Math.min(gapIndex, result.length);
        const insertAt = result.length - clamped;
        result.splice(insertAt, 0, msg);
        continue;
      }
      insertOne(msg, b.insert);
    }
    return result;
  }
  function makeTempWorldInfoName() {
    return `__st_api_tmp_wi__${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
  function normalizeWorldInfoEntriesMap(raw) {
    const out = {};
    if (!raw || typeof raw !== "object")
      return out;
    for (const [k, v] of Object.entries(raw)) {
      const keyUid = Number(k);
      if (!Number.isFinite(keyUid))
        continue;
      const entry = v && typeof v === "object" ? { ...v } : { uid: keyUid };
      const uid2 = Number(entry.uid);
      const finalUid = Number.isFinite(uid2) ? uid2 : keyUid;
      entry.uid = finalUid;
      out[finalUid] = entry;
    }
    return out;
  }
  function mergeWorldInfoEntriesByComment(baseRaw, injectedRaw) {
    const base = normalizeWorldInfoEntriesMap(baseRaw);
    const injected = normalizeWorldInfoEntriesMap(injectedRaw);
    const merged = { ...base };
    const nameToUid = /* @__PURE__ */ new Map();
    const usedUids = /* @__PURE__ */ new Set();
    let maxUid = -1;
    for (const [uidStr, entry] of Object.entries(merged)) {
      const uid2 = Number(uidStr);
      if (!Number.isFinite(uid2))
        continue;
      usedUids.add(uid2);
      maxUid = Math.max(maxUid, uid2);
      const name = String((entry == null ? void 0 : entry.comment) ?? "").trim();
      if (name && !nameToUid.has(name))
        nameToUid.set(name, uid2);
    }
    const injectedEntries = Object.values(injected);
    for (const e of injectedEntries) {
      const name = String((e == null ? void 0 : e.comment) ?? "").trim();
      if (name && nameToUid.has(name)) {
        const targetUid = nameToUid.get(name);
        merged[targetUid] = { ...merged[targetUid] ?? {}, ...e, uid: targetUid, comment: name };
        continue;
      }
      let newUid = Number(e == null ? void 0 : e.uid);
      if (!Number.isFinite(newUid) || usedUids.has(newUid)) {
        newUid = maxUid + 1;
        while (usedUids.has(newUid))
          newUid++;
      }
      maxUid = Math.max(maxUid, newUid);
      usedUids.add(newUid);
      merged[newUid] = { ...e, uid: newUid, ...name ? { comment: name } : {} };
      if (name && !nameToUid.has(name))
        nameToUid.set(name, newUid);
    }
    return merged;
  }
  async function applyWorldbookOverrides(ctx, wbOpt, restorers) {
    const mode = String((wbOpt == null ? void 0 : wbOpt.mode) ?? "current");
    if (mode === "disable")
      return true;
    const injectBook = wbOpt == null ? void 0 : wbOpt.inject;
    const replaceBook = wbOpt == null ? void 0 : wbOpt.replace;
    if (injectBook && replaceBook) {
      throw new Error("worldbook.inject and worldbook.replace are mutually exclusive");
    }
    if (!injectBook && !replaceBook)
      return false;
    if (!(ctx == null ? void 0 : ctx.chatMetadata))
      throw new Error("chatMetadata not available in context");
    const wi = await import("/scripts/world-info.js");
    const worldInfoCache = wi == null ? void 0 : wi.worldInfoCache;
    const loadWorldInfo = wi == null ? void 0 : wi.loadWorldInfo;
    const selectedWorldInfo = wi == null ? void 0 : wi.selected_world_info;
    const metadataKey = String((wi == null ? void 0 : wi.METADATA_KEY) || "world_info");
    if (!worldInfoCache || typeof worldInfoCache.set !== "function") {
      throw new Error("worldInfoCache is not available (failed to import /scripts/world-info.js)");
    }
    const chatMetadata = ctx.chatMetadata;
    const snapshot = chatMetadata[metadataKey];
    const tempName = makeTempWorldInfoName();
    let entries = {};
    if (replaceBook) {
      entries = worldBookToStWorldInfo(replaceBook).entries;
    } else if (injectBook) {
      const injectedEntries = worldBookToStWorldInfo(injectBook).entries;
      let baseEntries = {};
      const currentName = snapshot;
      const selected = Array.isArray(selectedWorldInfo) ? selectedWorldInfo : [];
      if (typeof currentName === "string" && currentName.trim() !== "" && !selected.includes(currentName)) {
        try {
          const data = typeof loadWorldInfo === "function" ? await loadWorldInfo(currentName) : null;
          if (data && typeof data === "object" && data.entries && typeof data.entries === "object") {
            baseEntries = data.entries;
          }
        } catch {
        }
      }
      entries = mergeWorldInfoEntriesByComment(baseEntries, injectedEntries);
    }
    worldInfoCache.set(tempName, { entries });
    chatMetadata[metadataKey] = tempName;
    restorers.push(() => {
      try {
        chatMetadata[metadataKey] = snapshot;
      } catch {
      }
      try {
        worldInfoCache.delete(tempName);
      } catch {
      }
    });
    return false;
  }
  async function get$7(input) {
    const ctx = window.SillyTavern.getContext();
    const { eventSource, event_types, generate: generate2, characterId } = ctx;
    const timeoutMs = (input == null ? void 0 : input.timeoutMs) ?? 8e3;
    const chid = (input == null ? void 0 : input.forceCharacterId) ?? characterId;
    if (chid === void 0 || chid === null) {
      throw new Error("No character selected (characterId is undefined).");
    }
    return await new Promise((resolve, reject) => {
      let done = false;
      const cleanup = () => {
        eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onReady);
      };
      const finish = (err, result) => {
        if (done)
          return;
        done = true;
        cleanup();
        if (err)
          reject(err);
        else
          resolve(result);
      };
      const onReady = async (data) => {
        const chat = await normalizeChatMessages(data == null ? void 0 : data.chat);
        finish(void 0, {
          chat,
          characterId: chid,
          timestamp: Date.now()
        });
      };
      eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onReady);
      const timer = setTimeout(() => {
        clearTimeout(timer);
        finish(new Error(`Timeout: did not receive CHAT_COMPLETION_PROMPT_READY within ${timeoutMs}ms.`));
      }, timeoutMs);
      try {
        Promise.resolve(generate2("normal", { force_chid: chid }, true)).catch((e) => finish(e));
      } catch (e) {
        finish(e);
      }
    });
  }
  async function buildRequest(input) {
    const ctx = window.SillyTavern.getContext();
    const { eventSource, event_types, generate: generate2, characterId, mainApi } = ctx;
    const timeoutMs = (input == null ? void 0 : input.timeoutMs) ?? 8e3;
    const chid = (input == null ? void 0 : input.forceCharacterId) ?? characterId;
    if (chid === void 0 || chid === null) {
      throw new Error("No character selected (characterId is undefined).");
    }
    const restorers = [];
    let skipWIAN = false;
    try {
      const presetOpt = input == null ? void 0 : input.preset;
      const presetMode = String((presetOpt == null ? void 0 : presetOpt.mode) ?? "current");
      const presetInject = presetOpt == null ? void 0 : presetOpt.inject;
      const presetReplace = presetOpt == null ? void 0 : presetOpt.replace;
      if (presetMode === "disable") {
        const settings = ctx.chatCompletionSettings;
        const snapshot = { prompt_order: settings == null ? void 0 : settings.prompt_order };
        const promptOrderCharacterId = detectPromptOrderCharacterId(settings, 100001);
        const identifiers = Array.isArray(settings == null ? void 0 : settings.prompts) ? settings.prompts.map((p2) => p2 == null ? void 0 : p2.identifier).filter((x) => typeof x === "string" && x) : [];
        settings.prompt_order = [
          {
            character_id: promptOrderCharacterId,
            order: identifiers.map((identifier) => ({ identifier, enabled: false }))
          }
        ];
        restorers.push(() => {
          settings.prompt_order = snapshot.prompt_order;
        });
      } else if (presetInject || presetReplace) {
        if (presetInject && presetReplace) {
          throw new Error("preset.inject and preset.replace are mutually exclusive");
        }
        if (presetReplace) {
          const applied = applyPresetToChatCompletionSettings(ctx.chatCompletionSettings, presetReplace);
          restorers.push(applied.restore);
        } else if (presetInject) {
          const applied = applyPresetPatchToChatCompletionSettings(ctx.chatCompletionSettings, presetInject);
          restorers.push(applied.restore);
        }
      }
      skipWIAN = await applyWorldbookOverrides(ctx, input == null ? void 0 : input.worldbook, restorers);
      const chOpt = input == null ? void 0 : input.chatHistory;
      const replaceMessages = chOpt == null ? void 0 : chOpt.replace;
      const injectBlocks = (chOpt == null ? void 0 : chOpt.inject) ?? [];
      const needsChatOverride = Array.isArray(replaceMessages) || Array.isArray(injectBlocks) && injectBlocks.length > 0;
      if (needsChatOverride) {
        const chatArr = ctx.chat;
        if (!Array.isArray(chatArr))
          throw new Error("ctx.chat is not an array");
        const snapshot = chatArr.slice();
        let baseChat = snapshot;
        if (Array.isArray(replaceMessages)) {
          baseChat = await chatMessagesToStChat(replaceMessages);
        }
        const merged = await applyChatHistoryInjections(baseChat, injectBlocks);
        replaceArrayContents(chatArr, merged);
        restorers.push(() => replaceArrayContents(chatArr, snapshot));
      }
      return await new Promise((resolve, reject) => {
        let done = false;
        let capturedChat;
        let capturedTextPrompt;
        let capturedAfterData;
        const cleanup = () => {
          eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatReady);
          eventSource.removeListener(event_types.GENERATE_AFTER_COMBINE_PROMPTS, onTextReady);
          eventSource.removeListener(event_types.GENERATE_AFTER_DATA, onAfterData);
        };
        const finish = (err) => {
          if (done)
            return;
          done = true;
          cleanup();
          if (err)
            return reject(err);
          const api = String(mainApi ?? "");
          const out = {
            timestamp: Date.now(),
            characterId: chid
          };
          if (Array.isArray(capturedChat)) {
            const withBlocks = Array.isArray(input == null ? void 0 : input.extraBlocks) ? insertExtraBlocks(capturedChat, input.extraBlocks) : capturedChat;
            out.chatCompletionMessages = withBlocks;
          }
          if (typeof capturedTextPrompt === "string") {
            out.textPrompt = capturedTextPrompt;
          }
          if (!(input == null ? void 0 : input.includeGenerateData)) {
            if (capturedAfterData !== void 0) {
              out.generateData = capturedAfterData;
            }
            return resolve(out);
          }
          (async () => {
            try {
              if (api === "openai" && Array.isArray(out.chatCompletionMessages)) {
                const [{ createGenerationParameters }] = await Promise.all([import("/scripts/openai.js")]);
                const model = typeof ctx.getChatCompletionModel === "function" ? ctx.getChatCompletionModel(ctx.chatCompletionSettings) : void 0;
                if (!createGenerationParameters)
                  throw new Error("Failed to import createGenerationParameters from /scripts/openai.js");
                if (!model)
                  throw new Error("Failed to resolve chat completion model");
                const { generate_data } = await createGenerationParameters(ctx.chatCompletionSettings, model, "normal", out.chatCompletionMessages, { jsonSchema: null });
                out.generateData = generate_data;
                return resolve(out);
              }
              if (capturedAfterData !== void 0) {
                out.generateData = capturedAfterData;
              }
              return resolve(out);
            } catch (e) {
              return reject(e);
            }
          })();
        };
        const onChatReady = (data) => {
          const chat = data == null ? void 0 : data.chat;
          if (!Array.isArray(chat) || chat.length === 0)
            return;
          capturedChat = chat;
          if (String(mainApi ?? "") === "openai") {
            finish();
          }
        };
        const onTextReady = (data) => {
          const prompt = data == null ? void 0 : data.prompt;
          if (typeof prompt !== "string" || prompt.trim() === "")
            return;
          capturedTextPrompt = prompt;
          if (String(mainApi ?? "") !== "openai") {
            finish();
          }
        };
        const onAfterData = (generateData, dryRun) => {
          if (dryRun !== true)
            return;
          capturedAfterData = generateData;
        };
        eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onChatReady);
        eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, onTextReady);
        eventSource.on(event_types.GENERATE_AFTER_DATA, onAfterData);
        const timer = setTimeout(() => {
          clearTimeout(timer);
          finish(new Error(`Timeout: did not receive prompt events within ${timeoutMs}ms.`));
        }, timeoutMs);
        try {
          Promise.resolve(generate2("normal", { force_chid: chid, skipWIAN }, true)).catch((e) => finish(e));
        } catch (e) {
          finish(e);
        }
      });
    } finally {
      for (let i = restorers.length - 1; i >= 0; i--) {
        try {
          restorers[i]();
        } catch {
        }
      }
    }
  }
  async function generate(input) {
    const ctx = window.SillyTavern.getContext();
    const {
      eventSource,
      event_types,
      generate: stGenerate,
      sendGenerationRequest,
      extractMessageFromData,
      characterId,
      mainApi
    } = ctx;
    const writeToChat = Boolean(input == null ? void 0 : input.writeToChat);
    const stream = Boolean(input == null ? void 0 : input.stream);
    const onToken = typeof (input == null ? void 0 : input.onToken) === "function" ? input.onToken : void 0;
    const includeRequest = Boolean(input == null ? void 0 : input.includeRequest);
    const timeoutMs = (input == null ? void 0 : input.timeoutMs) ?? 8e3;
    const chid = (input == null ? void 0 : input.forceCharacterId) ?? characterId;
    if (chid === void 0 || chid === null) {
      throw new Error("No character selected (characterId is undefined).");
    }
    const chOpt = input == null ? void 0 : input.chatHistory;
    const hasChatOverride = Array.isArray(chOpt == null ? void 0 : chOpt.replace) || Array.isArray(chOpt == null ? void 0 : chOpt.inject) && chOpt.inject.length > 0;
    if (writeToChat && hasChatOverride) {
      throw new Error("chatHistory.replace/inject is not supported when writeToChat=true (it would irreversibly alter the current chat).");
    }
    let request;
    if (!writeToChat || includeRequest) {
      request = await buildRequest(input);
    }
    if (!writeToChat) {
      const api2 = String(mainApi ?? "");
      let text = "";
      let streamedAny2 = false;
      let lastFull = "";
      const callOnToken = (full) => {
        if (!stream || !onToken)
          return;
        const delta = full.startsWith(lastFull) ? full.slice(lastFull.length) : full;
        lastFull = full;
        streamedAny2 = true;
        onToken(delta, full);
      };
      if (api2 === "openai") {
        const messages = request == null ? void 0 : request.chatCompletionMessages;
        if (!Array.isArray(messages)) {
          throw new Error("Background generate requires chatCompletionMessages (openai).");
        }
        const res = await Promise.resolve(sendGenerationRequest == null ? void 0 : sendGenerationRequest("normal", { prompt: messages }));
        if (typeof res === "function") {
          for await (const chunk of res()) {
            const full = String((chunk == null ? void 0 : chunk.text) ?? "");
            callOnToken(full);
          }
          text = lastFull;
        } else if (typeof extractMessageFromData === "function") {
          text = String(extractMessageFromData(res, api2) ?? "");
        } else {
          text = typeof res === "string" ? res : String(res ?? "");
        }
      } else {
        const generateData = request == null ? void 0 : request.generateData;
        if (generateData === void 0) {
          throw new Error("Background generate requires generateData (non-openai).");
        }
        const res = await Promise.resolve(sendGenerationRequest == null ? void 0 : sendGenerationRequest("normal", generateData));
        if (typeof extractMessageFromData === "function") {
          text = String(extractMessageFromData(res, api2) ?? "");
        } else {
          text = typeof res === "string" ? res : String((res == null ? void 0 : res.output) ?? (res == null ? void 0 : res.text) ?? "");
        }
      }
      if (stream && onToken && !streamedAny2) {
        onToken(text, text);
      }
      const out = {
        timestamp: Date.now(),
        characterId: chid,
        text,
        from: "background",
        ...includeRequest && request ? { request } : {}
      };
      return out;
    }
    const restorers = [];
    let skipWIAN = false;
    const api = String(mainApi ?? "");
    let streamedText = "";
    let streamedAny = false;
    const onStreamToken = (delta) => {
      const d = typeof delta === "string" ? delta : String(delta ?? "");
      if (!d)
        return;
      streamedAny = true;
      streamedText += d;
      if (stream && onToken)
        onToken(d, streamedText);
    };
    const hasExtraBlocks = Array.isArray(input == null ? void 0 : input.extraBlocks) && input.extraBlocks.length > 0;
    const onChatPromptReady = (data) => {
      if (!hasExtraBlocks)
        return;
      if ((data == null ? void 0 : data.dryRun) === true)
        return;
      if (!Array.isArray(data == null ? void 0 : data.chat) || data.chat.length === 0)
        return;
      data.chat = insertExtraBlocks(data.chat, input.extraBlocks);
    };
    try {
      const presetOpt = input == null ? void 0 : input.preset;
      const presetMode = String((presetOpt == null ? void 0 : presetOpt.mode) ?? "current");
      const presetInject = presetOpt == null ? void 0 : presetOpt.inject;
      const presetReplace = presetOpt == null ? void 0 : presetOpt.replace;
      if (presetMode === "disable") {
        const settings = ctx.chatCompletionSettings;
        const snapshot = { prompt_order: settings == null ? void 0 : settings.prompt_order };
        const promptOrderCharacterId = detectPromptOrderCharacterId(settings, 100001);
        const identifiers = Array.isArray(settings == null ? void 0 : settings.prompts) ? settings.prompts.map((p2) => p2 == null ? void 0 : p2.identifier).filter((x) => typeof x === "string" && x) : [];
        settings.prompt_order = [
          {
            character_id: promptOrderCharacterId,
            order: identifiers.map((identifier) => ({ identifier, enabled: false }))
          }
        ];
        restorers.push(() => {
          settings.prompt_order = snapshot.prompt_order;
        });
      } else if (presetInject || presetReplace) {
        if (presetInject && presetReplace) {
          throw new Error("preset.inject and preset.replace are mutually exclusive");
        }
        if (presetReplace) {
          const applied = applyPresetToChatCompletionSettings(ctx.chatCompletionSettings, presetReplace);
          restorers.push(applied.restore);
        } else if (presetInject) {
          const applied = applyPresetPatchToChatCompletionSettings(ctx.chatCompletionSettings, presetInject);
          restorers.push(applied.restore);
        }
      }
      skipWIAN = await applyWorldbookOverrides(ctx, input == null ? void 0 : input.worldbook, restorers);
      return await new Promise((resolve, reject) => {
        let done = false;
        let timer;
        const cleanup = () => {
          if (timer)
            clearTimeout(timer);
          if (stream)
            eventSource.removeListener(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
          if (hasExtraBlocks)
            eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatPromptReady);
        };
        const finish = (err, text) => {
          if (done)
            return;
          done = true;
          cleanup();
          if (err)
            return reject(err);
          const outText = String(text ?? "");
          const finalText = outText.trim() ? outText : streamedAny ? streamedText : outText;
          if (stream && onToken && !streamedAny && finalText) {
            onToken(finalText, finalText);
          }
          const out = {
            timestamp: Date.now(),
            characterId: chid,
            text: finalText,
            from: "inChat",
            ...includeRequest && request ? { request } : {}
          };
          return resolve(out);
        };
        if (stream)
          eventSource.on(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
        if (hasExtraBlocks)
          eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onChatPromptReady);
        timer = setTimeout(() => {
          finish(new Error(`Timeout: generation did not finish within ${timeoutMs}ms.`));
        }, timeoutMs);
        try {
          Promise.resolve(stGenerate("normal", { force_chid: chid, skipWIAN }, false)).then((res) => {
            if (typeof extractMessageFromData === "function") {
              try {
                return finish(void 0, String(extractMessageFromData(res, api) ?? ""));
              } catch {
                return finish(void 0, String(res ?? ""));
              }
            }
            return finish(void 0, String(res ?? ""));
          }).catch((e) => finish(e));
        } catch (e) {
          finish(e);
        }
      });
    } finally {
      for (let i = restorers.length - 1; i >= 0; i--) {
        try {
          restorers[i]();
        } catch {
        }
      }
    }
  }
  const getEndpoint$6 = {
    name: "get",
    handler: get$7
  };
  const buildRequestEndpoint = {
    name: "buildRequest",
    handler: buildRequest
  };
  const generateEndpoint = {
    name: "generate",
    handler: generate
  };
  const promptModuleDefinition = {
    namespace: "prompt",
    endpoints: [getEndpoint$6, buildRequestEndpoint, generateEndpoint]
  };
  function registerPromptApis(registry2) {
    registry2.registerModule(promptModuleDefinition);
  }
  async function uploadFileInternal(base64, format, chName, fileName) {
    try {
      const ctx = window.SillyTavern.getContext();
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const body = {
        image: cleanBase64,
        format: format.replace(".", ""),
        ch_name: chName,
        filename: fileName
      };
      const response = await fetch("/api/images/upload", {
        method: "POST",
        headers: {
          ...ctx.getRequestHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok)
        throw new Error(`Upload failed: ${response.statusText}`);
      const data = await response.json();
      return data.path || null;
    } catch (e) {
      console.error("[ST API] File upload failed:", e);
      return null;
    }
  }
  async function upload(input) {
    const ctx = window.SillyTavern.getContext();
    let targetChName = input.chName || "uploads";
    if (input.useCharacterDir) {
      targetChName = ctx.name2 || "default";
    }
    const path = await uploadFileInternal(input.data, input.format, targetChName, input.fileName);
    if (!path) {
      throw new Error("File upload failed.");
    }
    return { path };
  }
  async function get$6(input) {
    const url = constructPath(input);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return {
      data,
      mimeType: blob.type
    };
  }
  async function list$6(input) {
    const ctx = window.SillyTavern.getContext();
    let targetChName = input.chName || "uploads";
    if (input.useCharacterDir) {
      targetChName = ctx.name2 || "default";
    }
    const response = await fetch("/api/images/list", {
      method: "POST",
      headers: {
        ...ctx.getRequestHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        folder: targetChName,
        type: 7
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    const filenames = await response.json();
    const files = filenames.map((name) => ({
      name,
      path: `/user/images/${targetChName}/${name}`,
      size: 0,
      mtime: 0
    }));
    return { files };
  }
  async function deleteFile(input) {
    const ctx = window.SillyTavern.getContext();
    if (input.url || input.fileName && input.format) {
      const url = constructPath(input);
      const response = await fetch("/api/images/delete", {
        method: "POST",
        headers: {
          ...ctx.getRequestHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ path: url })
      });
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
      return { success: true };
    }
    const { files } = await list$6({
      chName: input.chName,
      useCharacterDir: input.useCharacterDir
    });
    for (const file of files) {
      await deleteFile({ url: file.path });
    }
    return { success: true };
  }
  function constructPath(input) {
    if ("url" in input && input.url)
      return input.url;
    const ctx = window.SillyTavern.getContext();
    let chName = input.chName || "uploads";
    if (input.useCharacterDir) {
      chName = ctx.name2 || "default";
    }
    if (!("fileName" in input) || !input.fileName) {
      return `/user/images/${chName}`;
    }
    const fileName = input.fileName;
    const format = input.format;
    const ext = format ? `.${format.replace(".", "")}` : "";
    return `/user/images/${chName}/${fileName}${ext}`;
  }
  const uploadEndpoint = {
    name: "upload",
    handler: upload
  };
  const getEndpoint$5 = {
    name: "get",
    handler: get$6
  };
  const listEndpoint$5 = {
    name: "list",
    handler: list$6
  };
  const deleteEndpoint$4 = {
    name: "delete",
    handler: deleteFile
  };
  const fileModuleDefinition = {
    namespace: "file",
    endpoints: [uploadEndpoint, getEndpoint$5, listEndpoint$5, deleteEndpoint$4]
  };
  function registerFileApis(registry2) {
    registry2.registerModule(fileModuleDefinition);
  }
  const panels = /* @__PURE__ */ new Map();
  function resolveTargetSelector(target) {
    if (target === "left" || target === "extensions_settings")
      return "#extensions_settings";
    if (target === "right" || target === "extensions_settings2")
      return "#extensions_settings2";
    return target || "#extensions_settings2";
  }
  async function waitAppReady$2() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx)
      return;
    const { eventSource, event_types } = ctx;
    if (document.getElementById("extensions_settings") || document.getElementById("extensions_settings2")) {
      return;
    }
    return new Promise((resolve) => {
      const done = () => {
        eventSource.removeListener(event_types.APP_READY, done);
        resolve();
      };
      eventSource.on(event_types.APP_READY, done);
      setTimeout(done, 5e3);
    });
  }
  function sanitizeForId(input) {
    return input.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  function applyInitialState(header, content, expanded) {
    const icon = header.querySelector(".inline-drawer-icon");
    if (expanded) {
      content.style.display = "block";
      icon == null ? void 0 : icon.classList.replace("down", "up");
      icon == null ? void 0 : icon.classList.replace("fa-circle-chevron-down", "fa-circle-chevron-up");
    } else {
      content.style.display = "none";
      icon == null ? void 0 : icon.classList.replace("up", "down");
      icon == null ? void 0 : icon.classList.replace("fa-circle-chevron-up", "fa-circle-chevron-down");
    }
  }
  async function registerSettingsPanel(input) {
    await waitAppReady$2();
    const targetSelector = resolveTargetSelector(input.target);
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl)
      throw new Error(`Target not found: ${targetSelector}`);
    const containerId = `${sanitizeForId(input.id)}_container`;
    if (document.getElementById(containerId)) {
      throw new Error(`Panel ID already registered: ${input.id}`);
    }
    const wrapper = document.createElement("div");
    wrapper.id = containerId;
    wrapper.className = `extension_container st-api-panel-wrapper ${input.className ?? ""}`.trim();
    wrapper.dataset.order = String(input.order ?? 0);
    const drawer = document.createElement("div");
    drawer.className = "inline-drawer st-api-drawer";
    const header = document.createElement("div");
    header.className = "inline-drawer-toggle inline-drawer-header";
    header.innerHTML = `<b>${input.title}</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>`;
    const content = document.createElement("div");
    content.className = "inline-drawer-content";
    drawer.appendChild(header);
    drawer.appendChild(content);
    wrapper.appendChild(drawer);
    if (typeof input.index === "number" && input.index >= 0 && input.index < targetEl.children.length) {
      targetEl.insertBefore(wrapper, targetEl.children[input.index]);
    } else {
      targetEl.appendChild(wrapper);
    }
    if (input.content.kind === "html") {
      content.innerHTML = input.content.html;
    } else if (input.content.kind === "htmlTemplate") {
      const frag = document.createRange().createContextualFragment(input.content.html);
      const extracted = frag.querySelector(input.content.extractSelector || ".inline-drawer-content");
      content.innerHTML = extracted ? extracted.innerHTML : input.content.html;
    } else if (input.content.kind === "element") {
      content.appendChild(input.content.element);
    } else if (input.content.kind === "render") {
      const cleanup = await input.content.render(content);
      panels.set(input.id, { cleanup: typeof cleanup === "function" ? cleanup : void 0 });
    }
    applyInitialState(header, content, !!input.expanded);
    return { id: input.id, containerId, drawer, content };
  }
  async function unregisterSettingsPanel(input) {
    const containerId = `${sanitizeForId(input.id)}_container`;
    const el = document.getElementById(containerId);
    if (el) {
      el.remove();
    }
    const rec = panels.get(input.id);
    if (rec == null ? void 0 : rec.cleanup)
      rec.cleanup();
    panels.delete(input.id);
    return { ok: true };
  }
  async function listSettingsPanels() {
    return { panels: [] };
  }
  async function registerExtensionsMenuItem(input) {
    await waitAppReady$2();
    const menu = document.getElementById("extensionsMenu");
    if (!menu)
      throw new Error("Extensions menu (#extensionsMenu) not found");
    const containerId = `${sanitizeForId(input.id)}_ext_container`;
    if (document.getElementById(containerId)) {
      throw new Error(`Extensions menu item ID already registered: ${input.id}`);
    }
    const container = document.createElement("div");
    container.id = containerId;
    container.className = "extension_container interactable";
    container.tabIndex = 0;
    const item = document.createElement("div");
    item.id = sanitizeForId(input.id);
    item.className = "list-group-item flex-container flexGap5 interactable";
    item.tabIndex = 0;
    item.setAttribute("role", "listitem");
    const icon = document.createElement("div");
    icon.className = `extensionsMenuExtensionButton ${input.icon}`;
    item.appendChild(icon);
    const textSpan = document.createElement("span");
    textSpan.textContent = input.label;
    item.appendChild(textSpan);
    item.addEventListener("click", (e) => {
      e.preventDefault();
      input.onClick();
    });
    container.appendChild(item);
    if (typeof input.index === "number" && input.index >= 0 && input.index < menu.children.length) {
      menu.insertBefore(container, menu.children[input.index]);
    } else {
      menu.appendChild(container);
    }
    return { itemId: item.id };
  }
  async function unregisterExtensionsMenuItem(input) {
    const containerId = `${sanitizeForId(input.id)}_ext_container`;
    const el = document.getElementById(containerId);
    if (el) {
      el.remove();
    }
    return { ok: true };
  }
  async function registerOptionsMenuItem(input) {
    await waitAppReady$2();
    let menu = document.querySelector("#options_button + .options-content");
    if (!menu) {
      menu = document.querySelector('.options-content[role="list"]');
    }
    if (!menu) {
      menu = document.querySelector(".options-content");
    }
    if (!menu)
      throw new Error("Options menu (.options-content) not found");
    const itemId = sanitizeForId(input.id);
    if (document.getElementById(itemId)) {
      throw new Error(`Options menu item ID already registered: ${input.id}`);
    }
    const item = document.createElement("a");
    item.id = itemId;
    item.className = "interactable";
    item.tabIndex = 0;
    const icon = document.createElement("i");
    icon.className = `fa-lg ${input.icon}`;
    const textSpan = document.createElement("span");
    textSpan.textContent = input.label;
    item.appendChild(icon);
    item.appendChild(document.createTextNode(" "));
    item.appendChild(textSpan);
    item.addEventListener("click", (e) => {
      e.preventDefault();
      input.onClick();
    });
    if (typeof input.index === "number" && input.index >= 0 && input.index < menu.children.length) {
      menu.insertBefore(item, menu.children[input.index]);
    } else {
      menu.appendChild(item);
    }
    return { itemId: item.id };
  }
  async function unregisterOptionsMenuItem(input) {
    const itemId = sanitizeForId(input.id);
    const el = document.getElementById(itemId);
    if (el) {
      el.remove();
    }
    return { ok: true };
  }
  async function reloadChat() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (ctx == null ? void 0 : ctx.reloadCurrentChat) {
      await ctx.reloadCurrentChat();
      return { ok: true };
    }
    return { ok: false };
  }
  async function reloadSettings() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx)
      return { ok: false };
    if (ctx.saveSettingsDebounced) {
      ctx.saveSettingsDebounced();
    }
    if (ctx.eventSource && ctx.eventTypes) {
      const { eventSource, eventTypes } = ctx;
      eventSource.emit(eventTypes.PRESET_CHANGED);
      eventSource.emit(eventTypes.SETTINGS_LOADED);
    }
    return { ok: true };
  }
  const topDrawers = /* @__PURE__ */ new Map();
  async function registerTopSettingsDrawer(input) {
    await waitAppReady$2();
    const topHolder = document.getElementById("top-settings-holder");
    if (!topHolder) {
      throw new Error("Target not found: #top-settings-holder");
    }
    const drawerId = sanitizeForId(input.id);
    if (document.getElementById(drawerId)) {
      throw new Error(`Top settings drawer ID already registered: ${input.id}`);
    }
    const drawer = document.createElement("div");
    drawer.id = drawerId;
    drawer.className = `drawer st-api-top-drawer ${input.className ?? ""}`.trim();
    const toggle = document.createElement("div");
    toggle.className = "drawer-toggle";
    const iconBtn = document.createElement("div");
    iconBtn.className = `drawer-icon ${input.icon} interactable`;
    if (input.title) {
      iconBtn.title = input.title;
    }
    iconBtn.tabIndex = 0;
    iconBtn.setAttribute("role", "button");
    toggle.appendChild(iconBtn);
    const content = document.createElement("div");
    content.className = "drawer-content";
    drawer.appendChild(toggle);
    drawer.appendChild(content);
    if (typeof input.index === "number" && input.index >= 0 && input.index < topHolder.children.length) {
      topHolder.insertBefore(drawer, topHolder.children[input.index]);
    } else {
      topHolder.appendChild(drawer);
    }
    let cleanupFn;
    if (input.content.kind === "html") {
      content.innerHTML = input.content.html;
    } else if (input.content.kind === "element") {
      content.appendChild(input.content.element);
    } else if (input.content.kind === "render") {
      const result = await input.content.render(content);
      if (typeof result === "function") {
        cleanupFn = result;
      }
    }
    topDrawers.set(input.id, { cleanup: cleanupFn });
    let isOpen = !!input.expanded;
    const updateVisualState = () => {
      if (isOpen) {
        content.classList.remove("closedDrawer");
        content.classList.add("openDrawer");
        iconBtn.classList.remove("closedIcon");
        iconBtn.classList.add("openIcon");
      } else {
        content.classList.remove("openDrawer");
        content.classList.add("closedDrawer");
        iconBtn.classList.remove("openIcon");
        iconBtn.classList.add("closedIcon");
      }
    };
    const openDrawer = async () => {
      if (isOpen)
        return;
      isOpen = true;
      updateVisualState();
      if (input.onOpen) {
        await input.onOpen();
      }
    };
    const closeDrawer = async () => {
      if (!isOpen)
        return;
      isOpen = false;
      updateVisualState();
      if (input.onClose) {
        await input.onClose();
      }
    };
    const toggleDrawer = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };
    updateVisualState();
    iconBtn.addEventListener("click", toggleDrawer);
    iconBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      }
    });
    return {
      id: input.id,
      drawerId,
      drawer,
      content,
      toggle: toggleDrawer,
      open: openDrawer,
      close: closeDrawer
    };
  }
  async function unregisterTopSettingsDrawer(input) {
    const drawerId = sanitizeForId(input.id);
    const el = document.getElementById(drawerId);
    if (el) {
      el.remove();
    }
    const rec = topDrawers.get(input.id);
    if (rec == null ? void 0 : rec.cleanup) {
      rec.cleanup();
    }
    topDrawers.delete(input.id);
    return { ok: true };
  }
  async function scrollChat(input) {
    await waitAppReady$2();
    const chatContainer = document.getElementById("chat");
    if (!chatContainer) {
      return { ok: false };
    }
    const behavior = input.behavior ?? "smooth";
    const target = input.target ?? "bottom";
    if (target === "bottom") {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior
      });
    } else if (target === "top") {
      chatContainer.scrollTo({
        top: 0,
        behavior
      });
    } else if (typeof target === "number") {
      const message = chatContainer.querySelector(`.mes[mesid="${target}"]`);
      if (message) {
        message.scrollIntoView({
          behavior,
          block: "center"
        });
      } else {
        return { ok: false };
      }
    }
    return {
      ok: true,
      scrollTop: chatContainer.scrollTop
    };
  }
  const messageButtons = /* @__PURE__ */ new Map();
  let messageObserver = null;
  function addButtonToMessage(mesElement, config) {
    const mesId = parseInt(mesElement.getAttribute("mesid") || "-1", 10);
    if (mesId < 0)
      return;
    const buttonsContainer = mesElement.querySelector(".mes_buttons");
    if (!buttonsContainer)
      return;
    const buttonId = `st-api-mes-btn-${sanitizeForId(config.id)}`;
    if (buttonsContainer.querySelector(`[data-st-btn-id="${buttonId}"]`))
      return;
    const btn = document.createElement("div");
    btn.className = `mes_button ${config.icon} interactable`;
    btn.title = config.title;
    btn.tabIndex = 0;
    btn.setAttribute("role", "button");
    btn.setAttribute("data-st-btn-id", buttonId);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      config.onClick(mesId, mesElement);
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        config.onClick(mesId, mesElement);
      }
    });
    const existingCustomButtons = buttonsContainer.querySelectorAll("[data-st-btn-id]");
    const mesEditBtn = buttonsContainer.querySelector(".mes_edit");
    if (typeof config.index === "number" && config.index >= 0) {
      let targetIndex = config.index;
      let insertBefore = null;
      const customBtns = Array.from(existingCustomButtons);
      if (targetIndex < customBtns.length) {
        insertBefore = customBtns[targetIndex];
      } else if (mesEditBtn == null ? void 0 : mesEditBtn.nextElementSibling) {
        insertBefore = null;
      }
      if (insertBefore) {
        buttonsContainer.insertBefore(btn, insertBefore);
      } else if (mesEditBtn) {
        mesEditBtn.insertAdjacentElement("afterend", btn);
      } else {
        buttonsContainer.appendChild(btn);
      }
    } else {
      if (mesEditBtn) {
        mesEditBtn.insertAdjacentElement("afterend", btn);
      } else {
        buttonsContainer.appendChild(btn);
      }
    }
  }
  function removeButtonFromMessage(mesElement, buttonId) {
    const btn = mesElement.querySelector(`[data-st-btn-id="st-api-mes-btn-${sanitizeForId(buttonId)}"]`);
    if (btn) {
      btn.remove();
      return true;
    }
    return false;
  }
  function applyButtonToAllMessages(config) {
    const messages = document.querySelectorAll("#chat .mes");
    let count = 0;
    messages.forEach((mes) => {
      addButtonToMessage(mes, config);
      count++;
    });
    return count;
  }
  function ensureMessageObserver() {
    if (messageObserver)
      return;
    const chatContainer = document.getElementById("chat");
    if (!chatContainer)
      return;
    messageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.classList.contains("mes")) {
            messageButtons.forEach((config) => {
              addButtonToMessage(node, config);
            });
            extraMessageButtons.forEach((config) => {
              addExtraButtonToMessage(node, config);
            });
            messageHeaderElements.forEach((config) => {
              addHeaderElementToMessage(node, config);
            });
          }
        });
      });
    });
    messageObserver.observe(chatContainer, { childList: true });
  }
  async function registerMessageButton(input) {
    await waitAppReady$2();
    if (messageButtons.has(input.id)) {
      throw new Error(`Message button ID already registered: ${input.id}`);
    }
    messageButtons.set(input.id, input);
    ensureMessageObserver();
    const appliedCount = applyButtonToAllMessages(input);
    return {
      id: input.id,
      appliedCount
    };
  }
  async function unregisterMessageButton(input) {
    const messages = document.querySelectorAll("#chat .mes");
    let removedCount = 0;
    messages.forEach((mes) => {
      if (removeButtonFromMessage(mes, input.id)) {
        removedCount++;
      }
    });
    messageButtons.delete(input.id);
    if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageObserver) {
      messageObserver.disconnect();
      messageObserver = null;
    }
    return {
      ok: true,
      removedCount
    };
  }
  const extraMessageButtons = /* @__PURE__ */ new Map();
  function addExtraButtonToMessage(mesElement, config) {
    const mesId = parseInt(mesElement.getAttribute("mesid") || "-1", 10);
    if (mesId < 0)
      return;
    const extraButtonsContainer = mesElement.querySelector(".extraMesButtons");
    if (!extraButtonsContainer)
      return;
    const buttonId = `st-api-extra-btn-${sanitizeForId(config.id)}`;
    if (extraButtonsContainer.querySelector(`[data-st-btn-id="${buttonId}"]`))
      return;
    const btn = document.createElement("div");
    btn.className = `mes_button ${config.icon} interactable`;
    btn.title = config.title;
    btn.tabIndex = 0;
    btn.setAttribute("role", "button");
    btn.setAttribute("data-st-btn-id", buttonId);
    btn.setAttribute("data-i18n", `[title]${config.title}`);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      config.onClick(mesId, mesElement);
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        config.onClick(mesId, mesElement);
      }
    });
    if (typeof config.index === "number" && config.index >= 0) {
      const children = extraButtonsContainer.children;
      if (config.index < children.length) {
        extraButtonsContainer.insertBefore(btn, children[config.index]);
      } else {
        extraButtonsContainer.appendChild(btn);
      }
    } else {
      extraButtonsContainer.appendChild(btn);
    }
  }
  function removeExtraButtonFromMessage(mesElement, buttonId) {
    const btn = mesElement.querySelector(`[data-st-btn-id="st-api-extra-btn-${sanitizeForId(buttonId)}"]`);
    if (btn) {
      btn.remove();
      return true;
    }
    return false;
  }
  function applyExtraButtonToAllMessages(config) {
    const messages = document.querySelectorAll("#chat .mes");
    let count = 0;
    messages.forEach((mes) => {
      addExtraButtonToMessage(mes, config);
      count++;
    });
    return count;
  }
  async function registerExtraMessageButton(input) {
    await waitAppReady$2();
    if (extraMessageButtons.has(input.id)) {
      throw new Error(`Extra message button ID already registered: ${input.id}`);
    }
    extraMessageButtons.set(input.id, input);
    ensureMessageObserver();
    const appliedCount = applyExtraButtonToAllMessages(input);
    return {
      id: input.id,
      appliedCount
    };
  }
  async function unregisterExtraMessageButton(input) {
    const messages = document.querySelectorAll("#chat .mes");
    let removedCount = 0;
    messages.forEach((mes) => {
      if (removeExtraButtonFromMessage(mes, input.id)) {
        removedCount++;
      }
    });
    extraMessageButtons.delete(input.id);
    if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageHeaderElements.size === 0 && messageObserver) {
      messageObserver.disconnect();
      messageObserver = null;
    }
    return {
      ok: true,
      removedCount
    };
  }
  const messageHeaderElements = /* @__PURE__ */ new Map();
  function getMessageContext(mesElement) {
    const mesId = parseInt(mesElement.getAttribute("mesid") || "-1", 10);
    if (mesId < 0)
      return null;
    const isUser = mesElement.getAttribute("is_user") === "true";
    const isSystem = mesElement.getAttribute("is_system") === "true";
    const characterName = mesElement.getAttribute("ch_name") || "";
    let role;
    if (isSystem) {
      role = "system";
    } else if (isUser) {
      role = "user";
    } else {
      role = "assistant";
    }
    return {
      mesId,
      role,
      characterName,
      isUser,
      isSystem,
      messageElement: mesElement
    };
  }
  function addHeaderElementToMessage(mesElement, config) {
    const context = getMessageContext(mesElement);
    if (!context)
      return;
    const roleFilter = config.roleFilter ?? "all";
    if (roleFilter !== "all" && roleFilter !== context.role)
      return;
    if (config.filter && !config.filter(context))
      return;
    const headerContainer = mesElement.querySelector(".ch_name .flex-container.alignItemsBaseline");
    if (!headerContainer)
      return;
    const elementId = `st-api-header-${sanitizeForId(config.id)}`;
    if (headerContainer.querySelector(`[data-st-header-id="${elementId}"]`))
      return;
    const element = config.render(context);
    if (!element)
      return;
    element.setAttribute("data-st-header-id", elementId);
    const position = config.position ?? "afterName";
    const nameText = headerContainer.querySelector(".name_text");
    const timestamp = headerContainer.querySelector(".timestamp");
    if (position === "afterName" && nameText) {
      nameText.insertAdjacentElement("afterend", element);
    } else if (position === "beforeTimestamp" && timestamp) {
      timestamp.insertAdjacentElement("beforebegin", element);
    } else if (position === "afterTimestamp" && timestamp) {
      timestamp.insertAdjacentElement("afterend", element);
    } else if (typeof position === "number") {
      const children = headerContainer.children;
      if (position < children.length) {
        headerContainer.insertBefore(element, children[position]);
      } else {
        headerContainer.appendChild(element);
      }
    } else {
      headerContainer.appendChild(element);
    }
  }
  function removeHeaderElementFromMessage(mesElement, elementId) {
    const el = mesElement.querySelector(`[data-st-header-id="st-api-header-${sanitizeForId(elementId)}"]`);
    if (el) {
      el.remove();
      return true;
    }
    return false;
  }
  function applyHeaderElementToAllMessages(config) {
    const messages = document.querySelectorAll("#chat .mes");
    let count = 0;
    messages.forEach((mes) => {
      addHeaderElementToMessage(mes, config);
      count++;
    });
    return count;
  }
  async function registerMessageHeaderElement(input) {
    await waitAppReady$2();
    if (messageHeaderElements.has(input.id)) {
      throw new Error(`Message header element ID already registered: ${input.id}`);
    }
    messageHeaderElements.set(input.id, input);
    ensureMessageObserver();
    const appliedCount = applyHeaderElementToAllMessages(input);
    return {
      id: input.id,
      appliedCount
    };
  }
  async function unregisterMessageHeaderElement(input) {
    const messages = document.querySelectorAll("#chat .mes");
    let removedCount = 0;
    messages.forEach((mes) => {
      if (removeHeaderElementFromMessage(mes, input.id)) {
        removedCount++;
      }
    });
    messageHeaderElements.delete(input.id);
    if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageHeaderElements.size === 0 && messageObserver) {
      messageObserver.disconnect();
      messageObserver = null;
    }
    return {
      ok: true,
      removedCount
    };
  }
  const registerSettingsPanelEndpoint = {
    name: "registerSettingsPanel",
    handler: registerSettingsPanel
  };
  const unregisterSettingsPanelEndpoint = {
    name: "unregisterSettingsPanel",
    handler: unregisterSettingsPanel
  };
  const listSettingsPanelsEndpoint = {
    name: "listSettingsPanels",
    handler: listSettingsPanels
  };
  const registerExtensionsMenuItemEndpoint = {
    name: "registerExtensionsMenuItem",
    handler: registerExtensionsMenuItem
  };
  const unregisterExtensionsMenuItemEndpoint = {
    name: "unregisterExtensionsMenuItem",
    handler: unregisterExtensionsMenuItem
  };
  const registerOptionsMenuItemEndpoint = {
    name: "registerOptionsMenuItem",
    handler: registerOptionsMenuItem
  };
  const unregisterOptionsMenuItemEndpoint = {
    name: "unregisterOptionsMenuItem",
    handler: unregisterOptionsMenuItem
  };
  const reloadChatEndpoint = {
    name: "reloadChat",
    handler: reloadChat
  };
  const reloadSettingsEndpoint = {
    name: "reloadSettings",
    handler: reloadSettings
  };
  const registerTopSettingsDrawerEndpoint = {
    name: "registerTopSettingsDrawer",
    handler: registerTopSettingsDrawer
  };
  const unregisterTopSettingsDrawerEndpoint = {
    name: "unregisterTopSettingsDrawer",
    handler: unregisterTopSettingsDrawer
  };
  const scrollChatEndpoint = {
    name: "scrollChat",
    handler: scrollChat
  };
  const registerMessageButtonEndpoint = {
    name: "registerMessageButton",
    handler: registerMessageButton
  };
  const unregisterMessageButtonEndpoint = {
    name: "unregisterMessageButton",
    handler: unregisterMessageButton
  };
  const registerExtraMessageButtonEndpoint = {
    name: "registerExtraMessageButton",
    handler: registerExtraMessageButton
  };
  const unregisterExtraMessageButtonEndpoint = {
    name: "unregisterExtraMessageButton",
    handler: unregisterExtraMessageButton
  };
  const registerMessageHeaderElementEndpoint = {
    name: "registerMessageHeaderElement",
    handler: registerMessageHeaderElement
  };
  const unregisterMessageHeaderElementEndpoint = {
    name: "unregisterMessageHeaderElement",
    handler: unregisterMessageHeaderElement
  };
  const uiModuleDefinition = {
    namespace: "ui",
    endpoints: [
      registerSettingsPanelEndpoint,
      unregisterSettingsPanelEndpoint,
      listSettingsPanelsEndpoint,
      registerExtensionsMenuItemEndpoint,
      unregisterExtensionsMenuItemEndpoint,
      registerOptionsMenuItemEndpoint,
      unregisterOptionsMenuItemEndpoint,
      reloadChatEndpoint,
      reloadSettingsEndpoint,
      registerTopSettingsDrawerEndpoint,
      unregisterTopSettingsDrawerEndpoint,
      scrollChatEndpoint,
      registerMessageButtonEndpoint,
      unregisterMessageButtonEndpoint,
      registerExtraMessageButtonEndpoint,
      unregisterExtraMessageButtonEndpoint,
      registerMessageHeaderElementEndpoint,
      unregisterMessageHeaderElementEndpoint
    ]
  };
  function registerUiApis(registry2) {
    registry2.registerModule(uiModuleDefinition);
  }
  const installs = /* @__PURE__ */ new Map();
  function resolveCtx() {
    var _a, _b;
    return (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
  }
  async function waitAppReady$1() {
    const ctx = resolveCtx();
    if (!ctx)
      return;
    const { eventSource, event_types } = ctx;
    if (document.getElementById("send_but") || document.getElementById("send_textarea")) {
      return;
    }
    return await new Promise((resolve) => {
      const done = () => {
        eventSource.removeListener(event_types.APP_READY, done);
        resolve();
      };
      eventSource.on(event_types.APP_READY, done);
      setTimeout(done, 5e3);
    });
  }
  function defaults(base, next) {
    return { ...base, ...next ?? {} };
  }
  function makeStEventName(prefix, suffix) {
    return `${prefix}:${suffix}`;
  }
  function makeDomEventName(prefix, suffix) {
    return `${prefix}:${suffix}`;
  }
  function emitBoth(rt, suffix, payload) {
    const ctx = resolveCtx();
    const eventSource = ctx == null ? void 0 : ctx.eventSource;
    const stPrefix = rt.broadcast.stPrefix;
    const domPrefix = rt.broadcast.domPrefix;
    const target = rt.broadcast.target;
    if ((target === "st" || target === "both") && (eventSource == null ? void 0 : eventSource.emit)) {
      void eventSource.emit(makeStEventName(stPrefix, suffix), payload);
    }
    if (target === "dom" || target === "both") {
      try {
        if (typeof window.CustomEvent === "function") {
          window.dispatchEvent(new CustomEvent(makeDomEventName(domPrefix, suffix), { detail: payload }));
        }
      } catch {
      }
    }
  }
  function shouldBypass(rt, target) {
    if (rt.bypassOnce.get("any")) {
      rt.bypassOnce.delete("any");
      return true;
    }
    if (rt.bypassOnce.get(target)) {
      rt.bypassOnce.delete(target);
      return true;
    }
    return false;
  }
  function shouldBlock(rt, target) {
    const b = rt.intercept.block;
    if (typeof b === "boolean")
      return b;
    if (b && typeof b === "object") {
      const v = b[target];
      return v === void 0 ? true : Boolean(v);
    }
    return true;
  }
  function stopEvent(e) {
    var _a;
    try {
      e.preventDefault();
    } catch {
    }
    (_a = e.stopImmediatePropagation) == null ? void 0 : _a.call(e);
    e.stopPropagation();
  }
  function isEnterSendEnabled(ctx) {
    const raw = ctx == null ? void 0 : ctx.shouldSendOnEnter;
    if (typeof raw === "function") {
      try {
        return Boolean(raw());
      } catch {
        return false;
      }
    }
    return Boolean(raw);
  }
  function getStopButtonEl() {
    return document.getElementById("mes_stop") ?? document.querySelector(".mes_stop");
  }
  function computeStopVisible(el) {
    if (!el)
      return { visible: false };
    try {
      const display = window.getComputedStyle(el).display;
      return { visible: display !== "none", display };
    } catch {
      return { visible: true };
    }
  }
  async function install(input) {
    const id = String((input == null ? void 0 : input.id) || "").trim();
    if (!id)
      throw new Error("hooks.install requires a non-empty id");
    if (installs.has(id))
      throw new Error(`hooks.install duplicate id: ${id}`);
    await waitAppReady$1();
    const rt = {
      id,
      broadcast: defaults(
        { target: "both", stPrefix: "st_api_wrapper", domPrefix: "st-api-wrapper" },
        input == null ? void 0 : input.broadcast
      ),
      intercept: defaults(
        {
          targets: ["sendButton", "sendEnter", "regenerate", "continue", "impersonate", "stopButton"],
          block: true,
          onlyWhenSendOnEnter: true
        },
        input == null ? void 0 : input.intercept
      ),
      observe: defaults(
        {
          targets: ["generationLifecycle", "streamTokens", "stopButtonVisibility"],
          blockGenerationOnStart: false,
          emitInitialStopButtonState: true
        },
        input == null ? void 0 : input.observe
      ),
      bypassOnce: /* @__PURE__ */ new Map(),
      streamFull: "",
      lastStopVisible: void 0,
      cleanup: () => {
      }
    };
    const disposers = [];
    const interceptTargets = new Set(rt.intercept.targets ?? []);
    const emitIntercept = (payload) => {
      emitBoth(rt, "intercept", payload);
    };
    const onDocClickCapture = (e) => {
      if (!rt.intercept.block && !rt.broadcast.target)
        return;
      const t = e.target;
      if (!t || !t.closest)
        return;
      const hit = (selector, target) => {
        if (!interceptTargets.has(target))
          return false;
        const el = t.closest(selector);
        if (!el)
          return false;
        if (shouldBypass(rt, target))
          return false;
        const blocked = shouldBlock(rt, target);
        if (blocked)
          stopEvent(e);
        emitIntercept({
          id: rt.id,
          timestamp: Date.now(),
          source: "click",
          target,
          selector,
          blocked
        });
        return true;
      };
      if (hit("#send_but", "sendButton"))
        return;
      if (hit("#options_button", "optionsButton"))
        return;
      if (hit("#extensionsMenuButton", "extensionsMenuButton"))
        return;
      if (hit("#option_regenerate", "regenerate"))
        return;
      if (hit("#option_continue, #mes_continue", "continue"))
        return;
      if (hit("#mes_impersonate", "impersonate"))
        return;
      if (hit("#mes_stop, .mes_stop", "stopButton"))
        return;
    };
    const onDocKeydownCapture = (e) => {
      if (!interceptTargets.has("sendEnter"))
        return;
      if (e.key !== "Enter")
        return;
      if (e.isComposing || e.keyCode === 229)
        return;
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
        return;
      const targetEl = e.target;
      if (!targetEl)
        return;
      if (!(targetEl instanceof HTMLTextAreaElement))
        return;
      if (targetEl.id !== "send_textarea")
        return;
      const ctx2 = resolveCtx();
      if (rt.intercept.onlyWhenSendOnEnter && !isEnterSendEnabled(ctx2))
        return;
      if (shouldBypass(rt, "sendEnter"))
        return;
      const blocked = shouldBlock(rt, "sendEnter");
      if (blocked)
        stopEvent(e);
      emitIntercept({
        id: rt.id,
        timestamp: Date.now(),
        source: "keydown",
        target: "sendEnter",
        selector: "#send_textarea",
        blocked
      });
    };
    document.addEventListener("click", onDocClickCapture, true);
    disposers.push(() => document.removeEventListener("click", onDocClickCapture, true));
    document.addEventListener("keydown", onDocKeydownCapture, true);
    disposers.push(() => document.removeEventListener("keydown", onDocKeydownCapture, true));
    const ctx = resolveCtx();
    const eventSource = ctx == null ? void 0 : ctx.eventSource;
    const event_types = ctx == null ? void 0 : ctx.event_types;
    const observeTargets = new Set(rt.observe.targets ?? []);
    if ((eventSource == null ? void 0 : eventSource.on) && event_types) {
      const onStarted = (type, options, dryRun) => {
        var _a;
        rt.streamFull = "";
        const payload = {
          id: rt.id,
          timestamp: Date.now(),
          generationType: String(type ?? ""),
          options,
          dryRun
        };
        emitBoth(rt, "generation.started", payload);
        if (rt.observe.blockGenerationOnStart && dryRun !== true) {
          try {
            (_a = ctx == null ? void 0 : ctx.stopGeneration) == null ? void 0 : _a.call(ctx);
          } catch {
          }
        }
      };
      const onStopped = () => {
        const payload = {
          id: rt.id,
          timestamp: Date.now()
        };
        emitBoth(rt, "generation.stopped", payload);
      };
      const onEnded = (chatLength) => {
        const payload = {
          id: rt.id,
          timestamp: Date.now(),
          chatLength: typeof chatLength === "number" ? chatLength : void 0
        };
        emitBoth(rt, "generation.ended", payload);
      };
      const onStreamToken = (delta) => {
        const d = typeof delta === "string" ? delta : String(delta ?? "");
        if (!d)
          return;
        rt.streamFull += d;
        const payload = {
          id: rt.id,
          timestamp: Date.now(),
          delta: d,
          full: rt.streamFull
        };
        emitBoth(rt, "generation.streamToken", payload);
      };
      if (observeTargets.has("generationLifecycle")) {
        eventSource.on(event_types.GENERATION_STARTED, onStarted);
        eventSource.on(event_types.GENERATION_STOPPED, onStopped);
        eventSource.on(event_types.GENERATION_ENDED, onEnded);
        disposers.push(() => eventSource.removeListener(event_types.GENERATION_STARTED, onStarted));
        disposers.push(() => eventSource.removeListener(event_types.GENERATION_STOPPED, onStopped));
        disposers.push(() => eventSource.removeListener(event_types.GENERATION_ENDED, onEnded));
      }
      if (observeTargets.has("streamTokens")) {
        eventSource.on(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
        disposers.push(() => eventSource.removeListener(event_types.STREAM_TOKEN_RECEIVED, onStreamToken));
      }
    }
    if (observeTargets.has("stopButtonVisibility")) {
      const emitStopVisible = (visible, display) => {
        const payload = {
          id: rt.id,
          timestamp: Date.now(),
          visible,
          display
        };
        emitBoth(rt, visible ? "ui.stopButtonShown" : "ui.stopButtonHidden", payload);
      };
      const check = () => {
        const el = getStopButtonEl();
        const { visible, display } = computeStopVisible(el);
        if (rt.lastStopVisible === void 0) {
          rt.lastStopVisible = visible;
          if (rt.observe.emitInitialStopButtonState) {
            emitStopVisible(visible, display);
          }
          return;
        }
        if (visible !== rt.lastStopVisible) {
          rt.lastStopVisible = visible;
          emitStopVisible(visible, display);
        }
      };
      check();
      const obs = new MutationObserver(() => check());
      const root = document.body ?? document.documentElement;
      obs.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["style", "class"]
      });
      rt.stopObserver = obs;
      disposers.push(() => obs.disconnect());
    }
    rt.cleanup = () => {
      for (let i = disposers.length - 1; i >= 0; i--) {
        try {
          disposers[i]();
        } catch {
        }
      }
    };
    installs.set(id, rt);
    return { id, ok: true };
  }
  async function uninstall(input) {
    const id = String((input == null ? void 0 : input.id) || "").trim();
    if (!id)
      return { ok: false };
    const rt = installs.get(id);
    if (!rt)
      return { ok: false };
    rt.cleanup();
    installs.delete(id);
    return { ok: true };
  }
  async function bypassOnce(input) {
    const id = String((input == null ? void 0 : input.id) || "").trim();
    const target = (input == null ? void 0 : input.target) ?? "any";
    const rt = installs.get(id);
    if (!rt)
      return { ok: false };
    rt.bypassOnce.set(target, true);
    return { ok: true };
  }
  const installEndpoint = {
    name: "install",
    handler: install
  };
  const uninstallEndpoint = {
    name: "uninstall",
    handler: uninstall
  };
  const bypassOnceEndpoint = {
    name: "bypassOnce",
    handler: bypassOnce
  };
  const hooksModuleDefinition = {
    namespace: "hooks",
    endpoints: [installEndpoint, uninstallEndpoint, bypassOnceEndpoint]
  };
  function registerHooksApis(registry2) {
    registry2.registerModule(hooksModuleDefinition);
  }
  async function list$5(input) {
    const ctx = window.SillyTavern.getContext();
    const rawChat = ctx.chat || [];
    const messages = await normalizeChatMessages(rawChat, {
      format: (input == null ? void 0 : input.format) || "gemini",
      mediaFormat: input == null ? void 0 : input.mediaFormat,
      includeSwipes: input == null ? void 0 : input.includeSwipes
    });
    const finalMessages = (input == null ? void 0 : input.limit) && input.limit > 0 ? messages.slice(-input.limit) : messages;
    return {
      messages: finalMessages,
      chatId: ctx.chatId
    };
  }
  async function get$5(input) {
    const ctx = window.SillyTavern.getContext();
    const rawChat = ctx.chat || [];
    const index = input == null ? void 0 : input.index;
    if (typeof index !== "number" || index < 0 || index >= rawChat.length) {
      throw new Error(`Message index out of bounds: ${index}`);
    }
    const normalized = await normalizeChatMessages([rawChat[index]], {
      format: (input == null ? void 0 : input.format) || "gemini",
      mediaFormat: input == null ? void 0 : input.mediaFormat,
      includeSwipes: input == null ? void 0 : input.includeSwipes
    });
    return {
      index,
      message: normalized[0],
      chatId: ctx.chatId
    };
  }
  async function create$2(input) {
    const ctx = window.SillyTavern.getContext();
    const stMsg = await convertToStMessage(input.role, input.content, input.name);
    ctx.chat.push(stMsg);
    const index = ctx.chat.length - 1;
    if (typeof ctx.addOneMessage === "function") {
      ctx.addOneMessage(stMsg, { forceId: index });
    }
    if (typeof ctx.saveChat === "function") {
      await ctx.saveChat();
    }
    const normalized = await normalizeChatMessages([stMsg], { format: "gemini" });
    return {
      index,
      message: normalized[0]
    };
  }
  async function update$3(input) {
    var _a;
    const ctx = window.SillyTavern.getContext();
    const index = input.index;
    if (!ctx.chat || index < 0 || index >= ctx.chat.length) {
      throw new Error(`Message index out of bounds: ${index}`);
    }
    const existing = ctx.chat[index];
    if (input.role) {
      existing.is_user = input.role === "user";
      existing.is_system = input.role === "system";
    }
    if (input.name) {
      existing.name = input.name;
    }
    if (input.content) {
      const roleForConversion = input.role || (existing.is_user ? "user" : existing.is_system ? "system" : "model");
      const converted = await convertToStMessage(roleForConversion, input.content, input.name || existing.name);
      existing.mes = converted.mes;
      if ((_a = converted.extra) == null ? void 0 : _a.media) {
        existing.extra = {
          ...existing.extra,
          media: converted.extra.media,
          media_index: 0,
          inline_image: true
        };
      }
    }
    if (typeof ctx.saveChat === "function") {
      await ctx.saveChat();
    }
    if (typeof ctx.updateMessageBlock === "function") {
      ctx.updateMessageBlock(index, existing);
    } else {
      ctx.eventSource.emit(ctx.event_types.CHAT_CHANGED);
    }
    const normalized = await normalizeChatMessages([existing], { format: "gemini" });
    return {
      message: normalized[0]
    };
  }
  async function deleteMessage(input) {
    const ctx = window.SillyTavern.getContext();
    const index = input.index;
    if (!ctx.chat || index < 0 || index >= ctx.chat.length) {
      throw new Error(`Message index out of bounds: ${index}`);
    }
    if (typeof ctx.deleteMessage === "function") {
      await ctx.deleteMessage(index);
    } else {
      ctx.chat.splice(index, 1);
      if (typeof ctx.saveChat === "function") {
        await ctx.saveChat();
      }
      ctx.eventSource.emit(ctx.event_types.CHAT_CHANGED);
    }
    return { success: true };
  }
  async function convertToStMessage(role, content, name) {
    const ctx = window.SillyTavern.getContext();
    const isUser = role === "user";
    const isSystem = role === "system";
    let mes = "";
    const media = [];
    if (typeof content === "string") {
      mes = content;
    } else if (Array.isArray(content)) {
      for (const part of content) {
        if ("text" in part) {
          mes += part.text;
        } else if ("fileData" in part) {
          media.push({
            url: part.fileData.fileUri,
            type: part.fileData.mimeType.startsWith("image") ? "image" : "file",
            mime_type: part.fileData.mimeType,
            source: "upload"
          });
        } else if ("inlineData" in part) {
          const chName = ctx.name2 || "default";
          const format = part.inlineData.mimeType.split("/")[1] || "png";
          const fileName = `upload_${Date.now()}`;
          const res = await window.ST_API.file.upload({
            data: part.inlineData.data,
            format,
            chName,
            fileName
          });
          if (res && res.path) {
            media.push({
              url: res.path,
              type: "image",
              mime_type: part.inlineData.mimeType,
              source: "upload"
            });
          }
        }
      }
    }
    const result = {
      name: name || (isSystem ? "System" : isUser ? ctx.name1 : ctx.name2),
      is_user: isUser,
      is_system: isSystem,
      mes,
      extra: {
        isSmallSys: isSystem
      },
      send_date: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (media.length > 0) {
      result.extra.media = media;
      result.extra.media_index = 0;
      result.extra.inline_image = true;
    }
    return result;
  }
  const getEndpoint$4 = {
    name: "get",
    handler: get$5
  };
  const listEndpoint$4 = {
    name: "list",
    handler: list$5
  };
  const createEndpoint$2 = {
    name: "create",
    handler: create$2
  };
  const updateEndpoint$3 = {
    name: "update",
    handler: update$3
  };
  const deleteEndpoint$3 = {
    name: "delete",
    handler: deleteMessage
  };
  const chatHistoryModuleDefinition = {
    namespace: "chatHistory",
    endpoints: [getEndpoint$4, listEndpoint$4, createEndpoint$2, updateEndpoint$3, deleteEndpoint$3]
  };
  function registerChatHistoryApis(registry2) {
    registry2.registerModule(chatHistoryModuleDefinition);
  }
  const targetMap = {
    1: "userInput",
    2: "aiOutput",
    3: "slashCommands",
    5: "worldBook",
    6: "reasoning"
  };
  const reverseTargetMap = {
    userInput: 1,
    aiOutput: 2,
    slashCommands: 3,
    worldBook: 5,
    reasoning: 6
  };
  const macroModeMap = {
    0: "none",
    1: "raw",
    2: "escaped"
  };
  const reverseMacroModeMap = {
    none: 0,
    raw: 1,
    escaped: 2
  };
  function fromStRegex(stRegex) {
    const {
      id,
      scriptName,
      disabled,
      findRegex,
      replaceString,
      trimStrings,
      placement,
      markdownOnly,
      promptOnly,
      runOnEdit,
      substituteRegex,
      minDepth,
      maxDepth
    } = stRegex ?? {};
    const targets = (Array.isArray(placement) ? placement : []).map((p2) => targetMap[p2]).filter(Boolean);
    const view = [];
    if (markdownOnly)
      view.push("user");
    if (promptOnly)
      view.push("model");
    return {
      id: String(id ?? ""),
      name: String(scriptName || ""),
      enabled: !disabled,
      findRegex: String(findRegex || ""),
      replaceRegex: String(replaceString || ""),
      trimRegex: Array.isArray(trimStrings) ? trimStrings : [],
      targets,
      view,
      runOnEdit: !!runOnEdit,
      macroMode: macroModeMap[substituteRegex] || "none",
      minDepth: minDepth ?? null,
      maxDepth: maxDepth ?? null
    };
  }
  function toStRegex(data) {
    const placement = (Array.isArray(data == null ? void 0 : data.targets) ? data.targets : []).map((t) => reverseTargetMap[t]).filter(Boolean);
    const view = Array.isArray(data == null ? void 0 : data.view) ? data.view : [];
    return {
      id: data.id,
      scriptName: data.name,
      disabled: !data.enabled,
      findRegex: data.findRegex,
      replaceString: data.replaceRegex,
      trimStrings: data.trimRegex,
      placement,
      markdownOnly: view.includes("user"),
      promptOnly: view.includes("model"),
      runOnEdit: data.runOnEdit,
      substituteRegex: reverseMacroModeMap[data.macroMode] ?? 0,
      minDepth: data.minDepth,
      maxDepth: data.maxDepth
    };
  }
  function getScopeType(scope, SCRIPT_TYPES) {
    switch (scope) {
      case "global":
        return SCRIPT_TYPES.GLOBAL;
      case "character":
        return SCRIPT_TYPES.SCOPED;
      case "preset":
        return SCRIPT_TYPES.PRESET;
      default:
        return SCRIPT_TYPES.GLOBAL;
    }
  }
  const CHAT_API_TYPE = "openai";
  function readString(v) {
    if (v === void 0 || v === null)
      return void 0;
    return typeof v === "string" ? v : String(v);
  }
  function readNumber(v) {
    if (v === void 0 || v === null)
      return void 0;
    if (typeof v === "number" && Number.isFinite(v))
      return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : void 0;
  }
  function getFirstDefined(obj, keys) {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== void 0) {
        return obj[k];
      }
    }
    return void 0;
  }
  const UTILITY_PROMPT_KEYS = [
    // snake_case (ST)
    "impersonation_prompt",
    "wi_format",
    "scenario_format",
    "personality_format",
    "group_nudge_prompt",
    "new_chat_prompt",
    "new_group_chat_prompt",
    "new_example_chat_prompt",
    "continue_nudge_prompt",
    "send_if_empty",
    "seed",
    // camelCase aliases (best-effort)
    "impersonationPrompt",
    "wiFormat",
    "worldInfoFormat",
    "scenarioFormat",
    "personalityFormat",
    "groupNudgePrompt",
    "newChatPrompt",
    "newGroupChatPrompt",
    "newExampleChatPrompt",
    "continueNudgePrompt",
    "sendIfEmpty"
  ];
  function stripUtilityPromptFields(other) {
    if (!other || typeof other !== "object" || Array.isArray(other))
      return;
    for (const k of UTILITY_PROMPT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(other, k)) {
        delete other[k];
      }
    }
  }
  function assertNoUtilityPromptFieldsInOther(other, where) {
    if (!other || typeof other !== "object" || Array.isArray(other))
      return;
    const found = UTILITY_PROMPT_KEYS.find((k) => Object.prototype.hasOwnProperty.call(other, k));
    if (!found)
      return;
    throw new Error(`[ST API] ${where}: Utility prompt field "${String(found)}" is not allowed in "other". Please put it in "utilityPrompts" instead.`);
  }
  function mergeUtilityPrompts(base, patch) {
    return {
      impersonationPrompt: patch.impersonationPrompt ?? base.impersonationPrompt,
      worldInfoFormat: patch.worldInfoFormat ?? base.worldInfoFormat,
      scenarioFormat: patch.scenarioFormat ?? base.scenarioFormat,
      personalityFormat: patch.personalityFormat ?? base.personalityFormat,
      groupNudgePrompt: patch.groupNudgePrompt ?? base.groupNudgePrompt,
      newChatPrompt: patch.newChatPrompt ?? base.newChatPrompt,
      newGroupChatPrompt: patch.newGroupChatPrompt ?? base.newGroupChatPrompt,
      newExampleChatPrompt: patch.newExampleChatPrompt ?? base.newExampleChatPrompt,
      continueNudgePrompt: patch.continueNudgePrompt ?? base.continueNudgePrompt,
      sendIfEmpty: patch.sendIfEmpty ?? base.sendIfEmpty,
      seed: patch.seed ?? base.seed
    };
  }
  function extractUtilityPrompts(other) {
    const s = (keys) => readString(getFirstDefined(other, keys));
    const n = (keys) => readNumber(getFirstDefined(other, keys));
    return {
      impersonationPrompt: s(["impersonation_prompt", "impersonationPrompt"]),
      worldInfoFormat: s(["wi_format", "wiFormat", "worldInfoFormat"]),
      scenarioFormat: s(["scenario_format", "scenarioFormat"]),
      personalityFormat: s(["personality_format", "personalityFormat"]),
      groupNudgePrompt: s(["group_nudge_prompt", "groupNudgePrompt"]),
      newChatPrompt: s(["new_chat_prompt", "newChatPrompt"]),
      newGroupChatPrompt: s(["new_group_chat_prompt", "newGroupChatPrompt"]),
      newExampleChatPrompt: s(["new_example_chat_prompt", "newExampleChatPrompt"]),
      continueNudgePrompt: s(["continue_nudge_prompt", "continueNudgePrompt"]),
      sendIfEmpty: s(["send_if_empty", "sendIfEmpty"]),
      seed: n(["seed"])
    };
  }
  function getPresetManager() {
    const ctx = window.SillyTavern.getContext();
    const manager = ctx.getPresetManager(CHAT_API_TYPE);
    if (!manager)
      throw new Error("Preset manager not found");
    return manager;
  }
  function transformPreset(name, settings) {
    const { prompts: rawPrompts = [], prompt_order: rawOrder = [], ...other } = settings || {};
    let activeOrderList = [];
    if (Array.isArray(rawOrder) && rawOrder[0] && Array.isArray(rawOrder[0].order)) {
      activeOrderList = rawOrder[0].order;
    }
    const orderMap = /* @__PURE__ */ new Map();
    activeOrderList.forEach((item, idx) => {
      if (item && item.identifier) {
        orderMap.set(String(item.identifier), {
          enabled: item.enabled,
          index: idx
        });
      }
    });
    const mergedPrompts = rawPrompts.map((p2) => {
      const orderItem = orderMap.get(String(p2.identifier));
      const {
        injection_depth,
        injection_order,
        injection_trigger,
        injection_position,
        system_prompt,
        ...rest
      } = p2;
      const result = {
        ...rest,
        enabled: orderItem ? orderItem.enabled : p2.enabled,
        depth: injection_depth ?? 0,
        order: injection_order ?? 100,
        trigger: injection_trigger ?? [],
        position: injection_position === 1 ? "fixed" : "relative"
      };
      if (orderItem !== void 0) {
        result.index = orderItem.index;
      }
      return result;
    });
    mergedPrompts.sort((a, b) => {
      const aIdx = a.index !== void 0 ? a.index : Infinity;
      const bIdx = b.index !== void 0 ? b.index : Infinity;
      return aIdx - bIdx;
    });
    const otherOut = other || {};
    const regexScripts = readPresetRegexScripts(otherOut);
    const utilityPrompts = extractUtilityPrompts(otherOut);
    stripUtilityPromptFields(otherOut);
    return {
      name: name || "Default",
      prompts: mergedPrompts,
      utilityPrompts,
      regexScripts,
      other: otherOut
    };
  }
  function safeObject$1(x) {
    return x && typeof x === "object" && !Array.isArray(x) ? x : {};
  }
  function readPresetRegexScripts(other) {
    const ext = safeObject$1(other == null ? void 0 : other.extensions);
    const raw = ext.regex_scripts ?? ext.regexScripts ?? [];
    return (Array.isArray(raw) ? raw : []).filter(Boolean).map((x) => fromStRegex(x));
  }
  function revertPreset(preset) {
    const loadedPrompts = preset.prompts.filter((p2) => p2.index !== void 0).sort((a, b) => a.index - b.index);
    const rawOrder = loadedPrompts.map((p2) => ({
      identifier: p2.identifier,
      enabled: p2.enabled ?? true
    }));
    const rawPrompts = preset.prompts.map((p2) => {
      const { index, depth, order, trigger: trigger2, position, enabled, ...rest } = p2;
      return {
        ...rest,
        enabled: enabled ?? true,
        injection_depth: depth ?? 0,
        injection_order: order ?? 100,
        injection_trigger: trigger2 ?? [],
        injection_position: position === "fixed" ? 1 : 0
      };
    });
    const prompt_order = [{
      character_id: 1e5,
      order: rawOrder
    }];
    const out = {
      ...preset.other,
      prompts: rawPrompts,
      prompt_order
    };
    const up = preset.utilityPrompts ?? {};
    if (up.impersonationPrompt !== void 0)
      out.impersonation_prompt = up.impersonationPrompt;
    if (up.worldInfoFormat !== void 0)
      out.wi_format = up.worldInfoFormat;
    if (up.scenarioFormat !== void 0)
      out.scenario_format = up.scenarioFormat;
    if (up.personalityFormat !== void 0)
      out.personality_format = up.personalityFormat;
    if (up.groupNudgePrompt !== void 0)
      out.group_nudge_prompt = up.groupNudgePrompt;
    if (up.newChatPrompt !== void 0)
      out.new_chat_prompt = up.newChatPrompt;
    if (up.newGroupChatPrompt !== void 0)
      out.new_group_chat_prompt = up.newGroupChatPrompt;
    if (up.newExampleChatPrompt !== void 0)
      out.new_example_chat_prompt = up.newExampleChatPrompt;
    if (up.continueNudgePrompt !== void 0)
      out.continue_nudge_prompt = up.continueNudgePrompt;
    if (up.sendIfEmpty !== void 0)
      out.send_if_empty = up.sendIfEmpty;
    if (up.seed !== void 0)
      out.seed = up.seed;
    const ext = safeObject$1(out.extensions);
    const had = Object.prototype.hasOwnProperty.call(ext, "regex_scripts");
    if (Array.isArray(preset.regexScripts) && preset.regexScripts.length > 0 || had) {
      ext.regex_scripts = (Array.isArray(preset.regexScripts) ? preset.regexScripts : []).map((x) => toStRegex(x));
      out.extensions = ext;
    }
    return out;
  }
  function getRawSettings(name) {
    const ctx = window.SillyTavern.getContext();
    const presetManager = ctx.getPresetManager(CHAT_API_TYPE);
    if (!presetManager)
      return null;
    const activePresetName = presetManager.getSelectedPresetName();
    if (name === activePresetName) {
      return ctx.chatCompletionSettings;
    }
    const { presets, preset_names } = presetManager.getPresetList();
    if (Array.isArray(preset_names)) {
      const idx = preset_names.indexOf(name);
      return idx !== -1 ? presets[idx] : null;
    } else if (preset_names && typeof preset_names === "object") {
      const idx = preset_names[name];
      return idx !== void 0 ? presets[idx] : null;
    }
    return null;
  }
  function getAllPresetsDetail() {
    const ctx = window.SillyTavern.getContext();
    const presetManager = getPresetManager();
    const { presets, preset_names } = presetManager.getPresetList();
    const activePresetName = presetManager.getSelectedPresetName();
    const results = [];
    const process2 = (pName, pSettings) => {
      const isActive = pName === activePresetName;
      const finalSettings = isActive ? ctx.chatCompletionSettings || pSettings || {} : pSettings || {};
      results.push(transformPreset(pName, finalSettings));
    };
    if (Array.isArray(preset_names)) {
      preset_names.forEach((pName, index) => process2(pName, presets[index]));
    } else if (preset_names && typeof preset_names === "object") {
      Object.entries(preset_names).forEach(([pName, index]) => process2(pName, presets[index]));
    }
    return results;
  }
  function get$4(input) {
    const presetManager = getPresetManager();
    const name = (input == null ? void 0 : input.name) || presetManager.getSelectedPresetName();
    const raw = getRawSettings(name);
    if (raw) {
      return { preset: transformPreset(name, raw) };
    }
    return { preset: null };
  }
  function list$4() {
    const presetManager = getPresetManager();
    const active = presetManager.getSelectedPresetName() || "";
    return { presets: getAllPresetsDetail(), active };
  }
  async function create$1(input) {
    const presetManager = getPresetManager();
    const templateName = presetManager.getSelectedPresetName();
    const templateRaw = templateName ? getRawSettings(templateName) : {};
    const basePreset = transformPreset(input.name, JSON.parse(JSON.stringify(templateRaw)));
    if (Object.prototype.hasOwnProperty.call(input, "apiSetting")) {
      throw new Error('[ST API] preset.create: "apiSetting" has been renamed to "other". Please use "other".');
    }
    if (input.other) {
      assertNoUtilityPromptFieldsInOther(input.other, "preset.create(other)");
      basePreset.other = { ...basePreset.other, ...input.other };
    }
    if (input.utilityPrompts) {
      basePreset.utilityPrompts = mergeUtilityPrompts(basePreset.utilityPrompts, input.utilityPrompts);
    }
    if (input.prompts) {
      basePreset.prompts = input.prompts;
    }
    if (Array.isArray(input.regexScripts)) {
      basePreset.regexScripts = input.regexScripts;
    } else {
      basePreset.regexScripts = readPresetRegexScripts(basePreset.other);
    }
    const rawToSave = revertPreset(basePreset);
    await presetManager.savePreset(input.name, rawToSave);
    return { success: true, name: input.name };
  }
  async function update$2(input) {
    const presetManager = getPresetManager();
    const raw = getRawSettings(input.name);
    if (!raw)
      throw new Error(`Preset not found: ${input.name}`);
    const preset = transformPreset(input.name, JSON.parse(JSON.stringify(raw)));
    if (Object.prototype.hasOwnProperty.call(input, "apiSetting")) {
      throw new Error('[ST API] preset.update: "apiSetting" has been renamed to "other". Please use "other".');
    }
    if (input.other) {
      assertNoUtilityPromptFieldsInOther(input.other, "preset.update(other)");
      preset.other = { ...preset.other, ...input.other };
    }
    if (input.utilityPrompts) {
      preset.utilityPrompts = mergeUtilityPrompts(preset.utilityPrompts, input.utilityPrompts);
    }
    if (input.prompts) {
      preset.prompts = input.prompts;
    }
    if (Array.isArray(input.regexScripts)) {
      preset.regexScripts = input.regexScripts;
    } else {
      preset.regexScripts = readPresetRegexScripts(preset.other);
    }
    const rawToSave = revertPreset(preset);
    const targetName = input.newName || input.name;
    await presetManager.savePreset(targetName, rawToSave);
    if (input.newName && input.newName !== input.name) {
      await presetManager.deletePreset(input.name);
    }
    return { success: true };
  }
  async function deletePreset(input) {
    const presetManager = getPresetManager();
    await presetManager.deletePreset(input.name);
    return { success: true };
  }
  function getPrompt(input) {
    const presetManager = getPresetManager();
    const targetName = input.presetName || presetManager.getSelectedPresetName();
    const raw = getRawSettings(targetName);
    if (!raw)
      throw new Error(`Preset not found: ${targetName}`);
    const preset = transformPreset(targetName, raw);
    const prompt = preset.prompts.find((p2) => p2.identifier === input.identifier);
    if (!prompt)
      throw new Error(`Prompt not found: ${input.identifier}`);
    return { prompt };
  }
  async function createPrompt(input) {
    var _a;
    const presetManager = getPresetManager();
    const targetName = input.presetName || presetManager.getSelectedPresetName();
    const raw = getRawSettings(targetName);
    if (!raw)
      throw new Error(`Preset not found: ${targetName}`);
    const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));
    const newPrompt = {
      identifier: input.prompt.identifier || ((_a = window.uuidv4) == null ? void 0 : _a.call(window)) || crypto.randomUUID(),
      name: input.prompt.name || "New Prompt",
      enabled: input.prompt.enabled ?? true,
      role: input.prompt.role || "system",
      content: input.prompt.content || "",
      depth: input.prompt.depth ?? 0,
      order: input.prompt.order ?? 100,
      trigger: input.prompt.trigger ?? [],
      position: input.prompt.position || "relative",
      ...input.prompt
    };
    preset.prompts.push(newPrompt);
    const rawToSave = revertPreset(preset);
    await presetManager.savePreset(targetName, rawToSave);
    return { success: true, prompt: newPrompt };
  }
  async function updatePrompt(input) {
    const presetManager = getPresetManager();
    const targetName = input.presetName || presetManager.getSelectedPresetName();
    const raw = getRawSettings(targetName);
    if (!raw)
      throw new Error(`Preset not found: ${targetName}`);
    const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));
    const index = preset.prompts.findIndex((p2) => p2.identifier === input.identifier);
    if (index === -1)
      throw new Error(`Prompt not found: ${input.identifier}`);
    preset.prompts[index] = {
      ...preset.prompts[index],
      ...input.update
    };
    const rawToSave = revertPreset(preset);
    await presetManager.savePreset(targetName, rawToSave);
    return { success: true, prompt: preset.prompts[index] };
  }
  async function deletePrompt(input) {
    const presetManager = getPresetManager();
    const targetName = input.presetName || presetManager.getSelectedPresetName();
    const raw = getRawSettings(targetName);
    if (!raw)
      throw new Error(`Preset not found: ${targetName}`);
    const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));
    const initialCount = preset.prompts.length;
    preset.prompts = preset.prompts.filter((p2) => p2.identifier !== input.identifier);
    if (preset.prompts.length === initialCount) {
      throw new Error(`Prompt not found: ${input.identifier}`);
    }
    const rawToSave = revertPreset(preset);
    await presetManager.savePreset(targetName, rawToSave);
    return { success: true };
  }
  const getEndpoint$3 = {
    name: "get",
    handler: get$4
  };
  const listEndpoint$3 = {
    name: "list",
    handler: list$4
  };
  const createEndpoint$1 = {
    name: "create",
    handler: create$1
  };
  const updateEndpoint$2 = {
    name: "update",
    handler: update$2
  };
  const deleteEndpoint$2 = {
    name: "delete",
    handler: deletePreset
  };
  const getPromptEndpoint = {
    name: "getPrompt",
    handler: getPrompt
  };
  const createPromptEndpoint = {
    name: "createPrompt",
    handler: createPrompt
  };
  const updatePromptEndpoint = {
    name: "updatePrompt",
    handler: updatePrompt
  };
  const deletePromptEndpoint = {
    name: "deletePrompt",
    handler: deletePrompt
  };
  const presetModuleDefinition = {
    namespace: "preset",
    endpoints: [
      getEndpoint$3,
      listEndpoint$3,
      createEndpoint$1,
      updateEndpoint$2,
      deleteEndpoint$2,
      getPromptEndpoint,
      createPromptEndpoint,
      updatePromptEndpoint,
      deletePromptEndpoint
    ]
  };
  function registerPresetApis(registry2) {
    registry2.registerModule(presetModuleDefinition);
  }
  function getSTContext$1() {
    var _a, _b;
    return (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
  }
  async function triggerSettingsRefresh() {
    const ctx = getSTContext$1();
    if (!ctx)
      return;
    if (ctx.updateWorldInfoList) {
      await ctx.updateWorldInfoList();
    }
    if (ctx.saveSettingsDebounced) {
      ctx.saveSettingsDebounced();
    }
    if (ctx.eventSource && ctx.eventTypes) {
      ctx.eventSource.emit(ctx.eventTypes.SETTINGS_UPDATED);
      ctx.eventSource.emit(ctx.eventTypes.PRESET_CHANGED);
    }
  }
  const positionMap = {
    0: "beforeChar",
    1: "afterChar",
    2: "beforeAn",
    3: "afterAn",
    4: "fixed",
    5: "beforeEm",
    6: "afterEm",
    7: "outlet"
  };
  const reversePositionMap = {
    "beforeChar": 0,
    "afterChar": 1,
    "beforeAn": 2,
    "afterAn": 3,
    "fixed": 4,
    "beforeEm": 5,
    "afterEm": 6,
    "outlet": 7
  };
  const roleMap = {
    0: "system",
    1: "user",
    2: "model"
  };
  const reverseRoleMap = {
    "system": 0,
    "user": 1,
    "model": 2
  };
  const selectiveLogicMap = {
    0: "andAny",
    1: "notAll",
    2: "notAny",
    3: "andAll"
  };
  const reverseSelectiveLogicMap = {
    "andAny": 0,
    "notAll": 1,
    "notAny": 2,
    "andAll": 3
  };
  function fromStEntry(stEntry, index) {
    const {
      comment,
      content,
      enabled,
      disable,
      order,
      depth,
      position,
      role,
      key,
      keysecondary,
      selectiveLogic,
      caseSensitive,
      excludeRecursion,
      preventRecursion,
      constant,
      vectorized,
      probability,
      useProbability,
      ...other
    } = stEntry;
    const mappedPosition = positionMap[position] || String(position);
    let activationMode = "keyword";
    if (constant) {
      activationMode = "always";
    } else if (vectorized) {
      activationMode = "vector";
    }
    const finalEnabled = !disable;
    const entry = {
      index: Number(index),
      name: comment || "",
      content: content || "",
      enabled: finalEnabled,
      activationMode,
      order: typeof order === "number" ? order : 100,
      depth: typeof depth === "number" ? depth : 4,
      position: mappedPosition,
      role: mappedPosition === "fixed" ? roleMap[role] || "system" : null,
      key: Array.isArray(key) ? key : [],
      secondaryKey: Array.isArray(keysecondary) ? keysecondary : [],
      selectiveLogic: selectiveLogicMap[selectiveLogic] || "andAny",
      caseSensitive: caseSensitive === void 0 ? null : caseSensitive,
      excludeRecursion: !!excludeRecursion,
      preventRecursion: !!preventRecursion,
      probability: typeof probability === "number" ? probability : 100,
      other: {
        ...other,
        useProbability: useProbability !== void 0 ? useProbability : true
      }
    };
    return entry;
  }
  function toStEntry(entry) {
    const stPosition = reversePositionMap[entry.position] ?? (isNaN(Number(entry.position)) ? 0 : Number(entry.position));
    const stRole = entry.position === "fixed" ? reverseRoleMap[entry.role || "system"] ?? 0 : null;
    const stSelectiveLogic = reverseSelectiveLogicMap[entry.selectiveLogic] ?? 0;
    const constant = entry.activationMode === "always";
    const vectorized = entry.activationMode === "vector";
    return {
      ...entry.other,
      uid: entry.index,
      comment: entry.name,
      content: entry.content,
      disable: !entry.enabled,
      constant,
      vectorized,
      order: entry.order,
      depth: entry.depth,
      position: stPosition,
      role: stRole,
      key: entry.key,
      keysecondary: entry.secondaryKey,
      selectiveLogic: stSelectiveLogic,
      caseSensitive: entry.caseSensitive,
      excludeRecursion: entry.excludeRecursion,
      preventRecursion: entry.preventRecursion,
      probability: entry.probability
    };
  }
  function fromStCharacterBookEntry(stEntry) {
    const {
      id,
      comment,
      content,
      enabled,
      constant,
      keys,
      secondary_keys,
      insertion_order,
      position,
      extensions,
      ...other
    } = stEntry ?? {};
    const ext = extensions ?? {};
    const posRaw = ext.position ?? position;
    let mappedPosition = "beforeChar";
    if (typeof posRaw === "number") {
      mappedPosition = positionMap[posRaw] || String(posRaw);
    } else if (typeof posRaw === "string") {
      switch (posRaw) {
        case "before_char":
          mappedPosition = "beforeChar";
          break;
        case "after_char":
          mappedPosition = "afterChar";
          break;
        case "before_em":
          mappedPosition = "beforeEm";
          break;
        case "after_em":
          mappedPosition = "afterEm";
          break;
        case "before_an":
          mappedPosition = "beforeAn";
          break;
        case "after_an":
          mappedPosition = "afterAn";
          break;
        case "fixed":
          mappedPosition = "fixed";
          break;
        case "outlet":
          mappedPosition = "outlet";
          break;
        default:
          mappedPosition = posRaw;
      }
    }
    let activationMode = "keyword";
    if (constant)
      activationMode = "always";
    else if (ext.vectorized)
      activationMode = "vector";
    const selectiveLogicRaw = ext.selectiveLogic ?? ext.selective_logic;
    const mappedSelectiveLogic = typeof selectiveLogicRaw === "number" ? selectiveLogicMap[selectiveLogicRaw] || "andAny" : typeof selectiveLogicRaw === "string" ? selectiveLogicRaw : "andAny";
    const roleRaw = ext.role;
    const mappedRole = mappedPosition === "fixed" ? typeof roleRaw === "number" ? roleMap[roleRaw] || "system" : roleRaw || "system" : null;
    const caseSensitive = ext.case_sensitive ?? ext.caseSensitive;
    return {
      index: Number(id ?? 0),
      name: comment || "",
      content: content || "",
      enabled: enabled === void 0 ? true : !!enabled,
      activationMode,
      key: Array.isArray(keys) ? keys : [],
      secondaryKey: Array.isArray(secondary_keys) ? secondary_keys : [],
      selectiveLogic: mappedSelectiveLogic,
      order: typeof insertion_order === "number" ? insertion_order : 100,
      depth: typeof ext.depth === "number" ? ext.depth : 4,
      position: mappedPosition,
      role: mappedRole,
      caseSensitive: caseSensitive === void 0 ? null : caseSensitive,
      excludeRecursion: !!(ext.exclude_recursion ?? ext.excludeRecursion),
      preventRecursion: !!(ext.prevent_recursion ?? ext.preventRecursion),
      probability: typeof ext.probability === "number" ? ext.probability : 100,
      other: {
        ...other,
        extensions: ext
      }
    };
  }
  function fromStBook(stBook, name) {
    const entries = [];
    const rawEntries = stBook == null ? void 0 : stBook.entries;
    if (Array.isArray(rawEntries)) {
      rawEntries.forEach((e) => entries.push(fromStCharacterBookEntry(e)));
    } else if (rawEntries && typeof rawEntries === "object") {
      Object.keys(rawEntries).forEach((key) => {
        entries.push(fromStEntry(rawEntries[key], Number(key)));
      });
    }
    return { name, entries };
  }
  async function listWorldBooks(input = {}) {
    var _a;
    const worldBooks = [];
    const ctx = getSTContext$1();
    const scope = input == null ? void 0 : input.scope;
    if (!scope || scope === "global") {
      if (ctx == null ? void 0 : ctx.updateWorldInfoList) {
        await ctx.updateWorldInfoList();
      }
      const worldNames = window.world_names || (ctx == null ? void 0 : ctx.world_names) || [];
      if (Array.isArray(worldNames)) {
        worldNames.forEach((name) => {
          if (!worldBooks.find((b) => b.name === name && b.scope === "global")) {
            worldBooks.push({ name, scope: "global" });
          }
        });
      }
    }
    if (!scope || scope === "character") {
      const characters = (ctx == null ? void 0 : ctx.characters) || [];
      const currentChid = ctx == null ? void 0 : ctx.characterId;
      if (typeof currentChid === "number" && characters[currentChid]) {
        const char = characters[currentChid];
        if ((_a = char.data) == null ? void 0 : _a.character_book) {
          worldBooks.push({ name: char.name, scope: "character", ownerId: String(currentChid) });
        }
      }
    }
    if (!scope || scope === "chat") {
      const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
      if (chatMetadata == null ? void 0 : chatMetadata.world_info) {
        worldBooks.push({ name: "Current Chat", scope: "chat", ownerId: ctx == null ? void 0 : ctx.chatId });
      }
    }
    return { worldBooks };
  }
  async function getWorldBook(input) {
    var _a, _b, _c, _d;
    const ctx = getSTContext$1();
    const scopes = input.scope ? [input.scope] : ["global", "character", "chat"];
    for (const scope of scopes) {
      if (scope === "global") {
        if (ctx == null ? void 0 : ctx.loadWorldInfo) {
          const data = await ctx.loadWorldInfo(input.name);
          if (data && data.entries) {
            return { worldBook: fromStBook(data, input.name), scope: "global" };
          }
        }
        try {
          const resp = await fetch("/api/worldinfo/get", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx) },
            body: JSON.stringify({ name: input.name })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.entries) {
              return { worldBook: fromStBook(data, input.name), scope: "global" };
            }
          }
        } catch (e) {
          console.debug(`[ST API] Global check failed for ${input.name}, trying next scope.`);
        }
      }
      if (scope === "character") {
        const char = ctx == null ? void 0 : ctx.characters[ctx == null ? void 0 : ctx.characterId];
        const isMatch = (char == null ? void 0 : char.name) === input.name || ((_c = (_b = char == null ? void 0 : char.data) == null ? void 0 : _b.character_book) == null ? void 0 : _c.name) === input.name;
        if (isMatch && ((_d = char == null ? void 0 : char.data) == null ? void 0 : _d.character_book)) {
          return {
            worldBook: fromStBook(char.data.character_book, char.data.character_book.name || char.name),
            scope: "character"
          };
        }
      }
      if (scope === "chat") {
        if (input.name === "Current Chat" || input.name === (ctx == null ? void 0 : ctx.chatId)) {
          const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
          if (chatMetadata == null ? void 0 : chatMetadata.world_info) {
            return {
              worldBook: fromStBook(chatMetadata.world_info, "Current Chat"),
              scope: "chat"
            };
          }
        }
      }
    }
    throw new Error(`WorldBook not found: ${input.name}`);
  }
  async function updateWorldBook(input) {
    var _a;
    const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
    const ctx = getSTContext$1();
    if (input.entries) {
      worldBook.entries = input.entries;
      await saveWorldBookInternal(worldBook, scope);
    }
    if (input.newName && input.newName !== input.name) {
      if (scope === "global") {
        await saveWorldBookInternal({ name: input.newName, entries: worldBook.entries }, "global");
        await deleteWorldBook({ name: input.name, scope: "global" });
      } else if (scope === "character") {
        const char = ctx == null ? void 0 : ctx.characters[ctx == null ? void 0 : ctx.characterId];
        if (char && ((_a = char.data) == null ? void 0 : _a.character_book)) {
          char.data.character_book.name = input.newName;
          if (ctx.saveCharacterDebounced)
            await ctx.saveCharacterDebounced();
        }
      } else if (scope === "chat") {
        const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
        if (chatMetadata == null ? void 0 : chatMetadata.world_info) {
          chatMetadata.world_info.name = input.newName;
          if (ctx.saveMetadataDebounced)
            ctx.saveMetadataDebounced();
        }
      }
      await triggerSettingsRefresh();
      return { ok: true, name: input.newName };
    }
    await triggerSettingsRefresh();
    return { ok: true, name: input.name };
  }
  async function createWorldBook(input) {
    var _a;
    const ctx = getSTContext$1();
    const scope = input.scope || "global";
    const stEntries = {};
    if (input.entries) {
      input.entries.forEach((e) => {
        stEntries[e.index] = toStEntry(e);
      });
    }
    if (scope === "global") {
      const resp = await fetch("/api/worldinfo/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx) },
        body: JSON.stringify({ name: input.name, data: { entries: stEntries } })
      });
      if (resp.ok) {
        await triggerSettingsRefresh();
        return { name: input.name, ok: true };
      }
    } else if (scope === "character") {
      const char = ctx == null ? void 0 : ctx.characters[ctx == null ? void 0 : ctx.characterId];
      if (char) {
        char.data = char.data || {};
        char.data.character_book = { name: input.name, entries: stEntries };
        if (ctx.saveCharacterDebounced)
          await ctx.saveCharacterDebounced();
        await triggerSettingsRefresh();
        return { name: input.name, ok: true };
      }
    } else if (scope === "chat") {
      const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
      if (chatMetadata) {
        chatMetadata.world_info = { name: input.name, entries: stEntries };
        if (ctx.saveMetadataDebounced)
          ctx.saveMetadataDebounced();
        await triggerSettingsRefresh();
        return { name: input.name, ok: true };
      }
    }
    return { name: input.name, ok: false };
  }
  async function deleteWorldBook(input) {
    var _a, _b;
    const ctx = getSTContext$1();
    const scope = input.scope || "global";
    if (scope === "global") {
      const resp = await fetch("/api/worldinfo/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx) },
        body: JSON.stringify({ name: input.name })
      });
      if (resp.ok) {
        await triggerSettingsRefresh();
        return { ok: true };
      }
    } else if (scope === "character") {
      const char = ctx == null ? void 0 : ctx.characters[ctx == null ? void 0 : ctx.characterId];
      if (char && ((_b = char.data) == null ? void 0 : _b.character_book)) {
        delete char.data.character_book;
        if (ctx.saveCharacterDebounced)
          await ctx.saveCharacterDebounced();
        await triggerSettingsRefresh();
        return { ok: true };
      }
    } else if (scope === "chat") {
      const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
      if (chatMetadata == null ? void 0 : chatMetadata.world_info) {
        delete chatMetadata.world_info;
        if (ctx.saveMetadataDebounced)
          ctx.saveMetadataDebounced();
        await triggerSettingsRefresh();
        return { ok: true };
      }
    }
    return { ok: false };
  }
  async function getWorldBookEntry(input) {
    const { worldBook } = await getWorldBook({ name: input.name, scope: input.scope });
    const entry = worldBook.entries.find((e) => e.index === input.index);
    if (!entry) {
      throw new Error(`Entry ${input.index} not found in book ${input.name}`);
    }
    return { entry };
  }
  async function createWorldBookEntry(input) {
    const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
    let maxUid = -1;
    worldBook.entries.forEach((e) => {
      maxUid = Math.max(maxUid, e.index);
    });
    const newUid = maxUid + 1;
    const newEntry = {
      index: newUid,
      name: "",
      content: "",
      enabled: true,
      activationMode: "keyword",
      order: 100,
      depth: 4,
      position: "beforeChar",
      role: null,
      key: [],
      secondaryKey: [],
      selectiveLogic: "andAny",
      caseSensitive: null,
      excludeRecursion: false,
      preventRecursion: false,
      probability: 100,
      other: {
        selective: false,
        useProbability: true,
        recursive: false,
        matchWholeWords: true,
        useGroupScoring: false,
        automationId: ""
      },
      ...input.entry
    };
    worldBook.entries.push(newEntry);
    await saveWorldBookInternal(worldBook, scope);
    return { entry: newEntry, ok: true };
  }
  async function updateWorldBookEntry(input) {
    const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
    const entryIndex = worldBook.entries.findIndex((e) => e.index === input.index);
    if (entryIndex === -1) {
      throw new Error(`Entry ${input.index} not found in book ${input.name}`);
    }
    const updatedEntry = { ...worldBook.entries[entryIndex], ...input.patch };
    worldBook.entries[entryIndex] = updatedEntry;
    await saveWorldBookInternal(worldBook, scope);
    return { entry: updatedEntry, ok: true };
  }
  async function deleteWorldBookEntry(input) {
    const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
    const entryIndex = worldBook.entries.findIndex((e) => e.index === input.index);
    if (entryIndex === -1) {
      return { ok: true };
    }
    worldBook.entries.splice(entryIndex, 1);
    await saveWorldBookInternal(worldBook, scope);
    return { ok: true };
  }
  async function saveWorldBookInternal(book, scope) {
    var _a, _b;
    const ctx = getSTContext$1();
    const stEntries = {};
    book.entries.forEach((e) => {
      stEntries[e.index] = toStEntry(e);
    });
    if (scope === "global") {
      if (ctx == null ? void 0 : ctx.saveWorldInfo) {
        await ctx.saveWorldInfo(book.name, { entries: stEntries }, true);
      } else {
        await fetch("/api/worldinfo/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx) },
          body: JSON.stringify({ name: book.name, data: { entries: stEntries } })
        });
        if ((ctx == null ? void 0 : ctx.eventSource) && (ctx == null ? void 0 : ctx.eventTypes)) {
          ctx.eventSource.emit(ctx.eventTypes.WORLDINFO_UPDATED, book.name, { entries: stEntries });
        }
        if (window.selected_world_info === book.name && window.reloadEditor) {
          window.world_info = stEntries;
          window.reloadEditor();
        }
      }
    } else if (scope === "character") {
      const char = ctx == null ? void 0 : ctx.characters[ctx == null ? void 0 : ctx.characterId];
      if (char && ((_b = char.data) == null ? void 0 : _b.character_book)) {
        char.data.character_book.entries = stEntries;
        if (ctx.saveCharacterDebounced) {
          await ctx.saveCharacterDebounced();
        }
      }
    } else if (scope === "chat") {
      const chatMetadata = ctx == null ? void 0 : ctx.chatMetadata;
      if (chatMetadata == null ? void 0 : chatMetadata.world_info) {
        chatMetadata.world_info.entries = stEntries;
        if (ctx.saveMetadataDebounced)
          ctx.saveMetadataDebounced();
      }
    }
    await triggerSettingsRefresh();
  }
  const listWorldBooksEndpoint = {
    name: "list",
    handler: listWorldBooks
  };
  const getWorldBookEndpoint = {
    name: "get",
    handler: getWorldBook
  };
  const getWorldBookEntryEndpoint = {
    name: "getEntry",
    handler: getWorldBookEntry
  };
  const createWorldBookEndpoint = {
    name: "create",
    handler: createWorldBook
  };
  const deleteWorldBookEndpoint = {
    name: "delete",
    handler: deleteWorldBook
  };
  const updateWorldBookEndpoint = {
    name: "update",
    handler: updateWorldBook
  };
  const createEntryEndpoint = {
    name: "createEntry",
    handler: createWorldBookEntry
  };
  const updateEntryEndpoint = {
    name: "updateEntry",
    handler: updateWorldBookEntry
  };
  const deleteEntryEndpoint = {
    name: "deleteEntry",
    handler: deleteWorldBookEntry
  };
  const worldbookModuleDefinition = {
    namespace: "worldbook",
    endpoints: [
      listWorldBooksEndpoint,
      getWorldBookEndpoint,
      getWorldBookEntryEndpoint,
      createWorldBookEndpoint,
      deleteWorldBookEndpoint,
      updateWorldBookEndpoint,
      createEntryEndpoint,
      updateEntryEndpoint,
      deleteEntryEndpoint
    ]
  };
  function registerWorldBookApis(registry2) {
    registry2.registerModule(worldbookModuleDefinition);
  }
  function getContext$1() {
    var _a, _b;
    return (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
  }
  function triggerRefresh() {
    const ctx = getContext$1();
    if (!ctx)
      return;
    if (ctx.saveSettingsDebounced) {
      ctx.saveSettingsDebounced();
    }
    if (ctx.eventSource && ctx.eventTypes) {
      const { eventSource, eventTypes } = ctx;
      eventSource.emit(eventTypes.PRESET_CHANGED);
      eventSource.emit(eventTypes.SETTINGS_LOADED);
    }
  }
  async function get$3(input) {
    const ctx = getContext$1();
    if (!ctx)
      throw new Error("SillyTavern context not available");
    const scope = (input == null ? void 0 : input.scope) || "local";
    const name = input == null ? void 0 : input.name;
    if (!name)
      throw new Error("Variable name is required");
    const value = ctx.variables[scope].get(name);
    return { value };
  }
  async function list$3(input) {
    var _a;
    const ctx = getContext$1();
    if (!ctx)
      throw new Error("SillyTavern context not available");
    const scope = (input == null ? void 0 : input.scope) || "local";
    if (scope === "local") {
      return { variables: { ...((_a = ctx.chatMetadata) == null ? void 0 : _a.variables) || {} } };
    }
    const globals = window.variables || {};
    return { variables: { ...globals } };
  }
  async function set(input) {
    const ctx = getContext$1();
    if (!ctx)
      return { ok: false };
    const scope = input.scope || "local";
    ctx.variables[scope].set(input.name, input.value);
    triggerRefresh();
    return { ok: true };
  }
  async function deleteVariable(input) {
    const ctx = getContext$1();
    if (!ctx)
      return { ok: false };
    const scope = input.scope || "local";
    ctx.variables[scope].del(input.name);
    triggerRefresh();
    return { ok: true };
  }
  async function add(input) {
    const ctx = getContext$1();
    if (!ctx)
      return { ok: false };
    const scope = input.scope || "local";
    ctx.variables[scope].add(input.name, input.value);
    triggerRefresh();
    return { ok: true };
  }
  async function inc(input) {
    const ctx = getContext$1();
    if (!ctx)
      return { ok: false };
    const scope = input.scope || "local";
    ctx.variables[scope].inc(input.name);
    triggerRefresh();
    return { ok: true };
  }
  async function dec(input) {
    const ctx = getContext$1();
    if (!ctx)
      return { ok: false };
    const scope = input.scope || "local";
    ctx.variables[scope].dec(input.name);
    triggerRefresh();
    return { ok: true };
  }
  const endpoints = [
    { name: "get", handler: get$3 },
    { name: "list", handler: list$3 },
    { name: "set", handler: set },
    { name: "delete", handler: deleteVariable },
    { name: "add", handler: add },
    { name: "inc", handler: inc },
    { name: "dec", handler: dec }
  ];
  const variablesModuleDefinition = {
    namespace: "variables",
    endpoints
  };
  function registerVariablesApis(registry2) {
    registry2.registerModule(variablesModuleDefinition);
  }
  async function importRegexEngine() {
    try {
      return await eval('import("/scripts/extensions/regex/engine.js")');
    } catch (e) {
      console.warn("[ST API] Regex engine import failed", e);
      return null;
    }
  }
  async function list$2(input) {
    const includeGlobal = (input == null ? void 0 : input.includeGlobal) ?? true;
    const includeCharacter = (input == null ? void 0 : input.includeCharacter) ?? true;
    const includePreset = (input == null ? void 0 : input.includePreset) ?? true;
    const options = { allowedOnly: !!(input == null ? void 0 : input.allowedOnly) };
    const engine = await importRegexEngine();
    if (!engine) {
      const ctx = window.SillyTavern.getContext();
      const raw = includeGlobal ? ctx.extensionSettings.regex || [] : [];
      return { regexScripts: raw.map(fromStRegex) };
    }
    const { getScriptsByType, SCRIPT_TYPES } = engine;
    let rawScripts = [];
    if (includeGlobal) {
      rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.GLOBAL, options));
    }
    if (includeCharacter) {
      rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.SCOPED, options));
    }
    if (includePreset) {
      rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.PRESET, options));
    }
    return { regexScripts: rawScripts.map(fromStRegex) };
  }
  async function get$2(input) {
    const idOrName = String(input.idOrName || "").trim();
    if (!idOrName)
      throw new Error("idOrName is required");
    const options = { allowedOnly: !!input.allowedOnly };
    const match = (raw) => raw && (raw.id === idOrName || raw.scriptName === idOrName);
    const engine = await importRegexEngine();
    if (!engine) {
      const ctx = window.SillyTavern.getContext();
      const rawList = Array.isArray(ctx.extensionSettings.regex) ? ctx.extensionSettings.regex : [];
      const raw = rawList.find(match);
      return raw ? { regexScript: fromStRegex(raw), scope: "global" } : { regexScript: null, scope: null };
    }
    const { getScriptsByType, SCRIPT_TYPES } = engine;
    const scopes = input.scope ? [input.scope] : ["global", "character", "preset"];
    for (const scope of scopes) {
      const type = getScopeType(scope, SCRIPT_TYPES);
      const rawList = getScriptsByType(type, options) || [];
      const raw = rawList.find(match);
      if (raw)
        return { regexScript: fromStRegex(raw), scope };
    }
    return { regexScript: null, scope: null };
  }
  async function process(input) {
    const engine = await importRegexEngine();
    if (!engine)
      return { text: input.text };
    const result = engine.getRegexedString(input.text, input.placement);
    return { text: result };
  }
  async function run(input) {
    const { regexScript } = await get$2({ idOrName: input.idOrName });
    if (!regexScript)
      throw new Error(`Regex script not found: ${input.idOrName}`);
    const engine = await importRegexEngine();
    if (!engine)
      return { text: input.text };
    const stScript = toStRegex(regexScript);
    const result = engine.runRegexScript(stScript, input.text);
    return { text: result };
  }
  async function create(input) {
    var _a, _b, _c, _d;
    const engine = await importRegexEngine();
    if (!engine)
      throw new Error("Regex engine not available");
    const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
    const scope = input.scope || "global";
    const scriptType = getScopeType(scope, SCRIPT_TYPES);
    const scripts = [...getScriptsByType(scriptType)];
    const id = ((_a = window.uuidv4) == null ? void 0 : _a.call(window)) || crypto.randomUUID();
    const newScriptData = {
      id,
      name: input.regexScript.name || "New Script",
      enabled: input.regexScript.enabled ?? true,
      findRegex: input.regexScript.findRegex || "",
      replaceRegex: input.regexScript.replaceRegex || "",
      trimRegex: input.regexScript.trimRegex || [],
      targets: input.regexScript.targets || ["userInput"],
      view: input.regexScript.view || [],
      runOnEdit: input.regexScript.runOnEdit ?? true,
      macroMode: input.regexScript.macroMode || "none",
      minDepth: input.regexScript.minDepth ?? null,
      maxDepth: input.regexScript.maxDepth ?? null
    };
    const stScript = toStRegex(newScriptData);
    scripts.push(stScript);
    await saveScriptsByType(scripts, scriptType);
    const ctx = window.SillyTavern.getContext();
    (_b = ctx.saveSettingsDebounced) == null ? void 0 : _b.call(ctx);
    (_c = ctx.eventSource) == null ? void 0 : _c.emit(ctx.eventTypes.PRESET_CHANGED);
    (_d = ctx.reloadCurrentChat) == null ? void 0 : _d.call(ctx);
    return { success: true, regexScript: newScriptData };
  }
  async function update$1(input) {
    var _a, _b, _c;
    const engine = await importRegexEngine();
    if (!engine)
      throw new Error("Regex engine not available");
    const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
    let targetScope = input.scope;
    let targetType;
    let targetScripts = [];
    let index = -1;
    const scopes = ["global", "character", "preset"];
    if (targetScope) {
      targetType = getScopeType(targetScope, SCRIPT_TYPES);
      targetScripts = getScriptsByType(targetType);
      index = targetScripts.findIndex((s) => s.id === input.id);
    } else {
      for (const s of scopes) {
        const type = getScopeType(s, SCRIPT_TYPES);
        const scripts = getScriptsByType(type);
        const idx = scripts.findIndex((item) => item.id === input.id);
        if (idx !== -1) {
          targetScope = s;
          targetType = type;
          targetScripts = scripts;
          index = idx;
          break;
        }
      }
    }
    if (index === -1)
      throw new Error(`Regex script with ID ${input.id} not found in any scope`);
    const currentData = fromStRegex(targetScripts[index]);
    const updatedData = {
      ...currentData,
      ...input.regexScript,
      id: input.id
      // 强制保持 ID 不变
    };
    const newScripts = [...targetScripts];
    newScripts[index] = toStRegex(updatedData);
    await saveScriptsByType(newScripts, targetType);
    const ctx = window.SillyTavern.getContext();
    (_a = ctx.saveSettingsDebounced) == null ? void 0 : _a.call(ctx);
    (_b = ctx.eventSource) == null ? void 0 : _b.emit(ctx.eventTypes.PRESET_CHANGED);
    (_c = ctx.reloadCurrentChat) == null ? void 0 : _c.call(ctx);
    return { success: true, regexScript: updatedData };
  }
  async function deleteScript(input) {
    var _a, _b, _c;
    const engine = await importRegexEngine();
    if (!engine)
      throw new Error("Regex engine not available");
    const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
    let targetScope = input.scope;
    let targetType;
    let targetScripts = [];
    let index = -1;
    const scopes = ["global", "character", "preset"];
    if (targetScope) {
      targetType = getScopeType(targetScope, SCRIPT_TYPES);
      targetScripts = getScriptsByType(targetType);
      index = targetScripts.findIndex((s) => s.id === input.id);
    } else {
      for (const s of scopes) {
        const type = getScopeType(s, SCRIPT_TYPES);
        const scripts = getScriptsByType(type);
        const idx = scripts.findIndex((item) => item.id === input.id);
        if (idx !== -1) {
          targetScope = s;
          targetType = type;
          targetScripts = scripts;
          index = idx;
          break;
        }
      }
    }
    if (index === -1)
      throw new Error(`Regex script with ID ${input.id} not found in any scope`);
    const newScripts = targetScripts.filter((s) => s.id !== input.id);
    await saveScriptsByType(newScripts, targetType);
    const ctx = window.SillyTavern.getContext();
    (_a = ctx.saveSettingsDebounced) == null ? void 0 : _a.call(ctx);
    (_b = ctx.eventSource) == null ? void 0 : _b.emit(ctx.eventTypes.PRESET_CHANGED);
    (_c = ctx.reloadCurrentChat) == null ? void 0 : _c.call(ctx);
    return { success: true };
  }
  const getEndpoint$2 = {
    name: "get",
    handler: get$2
  };
  const listEndpoint$2 = {
    name: "list",
    handler: list$2
  };
  const processEndpoint = {
    name: "process",
    handler: process
  };
  const runEndpoint = {
    name: "run",
    handler: run
  };
  const createEndpoint = {
    name: "create",
    handler: create
  };
  const updateEndpoint$1 = {
    name: "update",
    handler: update$1
  };
  const deleteEndpoint$1 = {
    name: "delete",
    handler: deleteScript
  };
  const regexScriptModuleDefinition = {
    namespace: "regexScript",
    endpoints: [getEndpoint$2, listEndpoint$2, processEndpoint, runEndpoint, createEndpoint, updateEndpoint$1, deleteEndpoint$1]
  };
  function registerRegexScriptApis(registry2) {
    registry2.registerModule(regexScriptModuleDefinition);
  }
  function getSTContext() {
    var _a, _b;
    return (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
  }
  async function readErrorBody(resp) {
    try {
      const text = await resp.text();
      return text ? ` ${text}` : "";
    } catch {
      return "";
    }
  }
  async function postJson(url, body, mode = "json") {
    var _a;
    const ctx = getSTContext();
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...((_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx)) ?? {} },
      body: JSON.stringify(body ?? {})
    });
    if (!resp.ok) {
      const extra = await readErrorBody(resp);
      throw new Error(`Request failed: POST ${url} -> ${resp.status} ${resp.statusText}${extra}`);
    }
    const text = await resp.text();
    if (mode === "void")
      return void 0;
    if (mode === "text")
      return text;
    if (!text) {
      throw new Error(`Request failed: expected JSON but got empty body. POST ${url}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Request failed: expected JSON but got non-JSON response. POST ${url}`);
    }
  }
  function getAvatarFromAny(raw) {
    const v = (raw == null ? void 0 : raw.avatar) ?? (raw == null ? void 0 : raw.avatar_url) ?? (raw == null ? void 0 : raw.avatarUrl);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }
  function avatarUrlFromName(name) {
    const n = String(name ?? "").trim();
    if (!n)
      throw new Error("name is required");
    return `${n}.png`;
  }
  function stripPngSuffix(nameOrAvatar) {
    const v = String(nameOrAvatar ?? "").trim();
    if (!v)
      return v;
    return v.toLowerCase().endsWith(".png") ? v.slice(0, -4) : v;
  }
  function safeObject(x) {
    return x && typeof x === "object" && !Array.isArray(x) ? x : {};
  }
  function cloneJson(x) {
    try {
      return JSON.parse(JSON.stringify(x));
    } catch {
      return x;
    }
  }
  function toCharacterCard(raw) {
    var _a;
    const data = safeObject(raw == null ? void 0 : raw.data);
    const rawName = (data == null ? void 0 : data.name) ?? (raw == null ? void 0 : raw.name);
    const rawDesc = (data == null ? void 0 : data.description) ?? (raw == null ? void 0 : raw.description);
    const avatar = getAvatarFromAny(raw) ?? "";
    const chatDate = typeof (raw == null ? void 0 : raw.chat) === "string" ? raw.chat : "";
    const createDate = typeof (raw == null ? void 0 : raw.create_date) === "string" ? raw.create_date : "";
    const altGreetingsRaw = data == null ? void 0 : data.alternate_greetings;
    const alternateGreetings = Array.isArray(altGreetingsRaw) ? altGreetingsRaw.map((x) => String(x ?? "")) : [];
    const firstMes = data == null ? void 0 : data.first_mes;
    const message = [];
    if (firstMes !== void 0 || alternateGreetings.length > 0) {
      message.push(String(firstMes ?? ""));
      message.push(...alternateGreetings);
    }
    const ext = safeObject(data == null ? void 0 : data.extensions);
    const rawRegexScripts = ext.regex_scripts ?? ext.regexScripts ?? [];
    const regexScripts = (Array.isArray(rawRegexScripts) ? rawRegexScripts : []).filter(Boolean).map((x) => fromStRegex(x));
    const rawCharacterBook = data == null ? void 0 : data.character_book;
    const worldBook = rawCharacterBook ? fromStBook(rawCharacterBook, String((rawCharacterBook == null ? void 0 : rawCharacterBook.name) || rawName || "")) : null;
    const other = cloneJson(safeObject(raw));
    if (((_a = other == null ? void 0 : other.data) == null ? void 0 : _a.extensions) && typeof other.data.extensions === "object") {
      delete other.data.extensions.regex_scripts;
      delete other.data.extensions.regexScripts;
    }
    if ((other == null ? void 0 : other.data) && typeof other.data === "object") {
      delete other.data.character_book;
      delete other.data.first_mes;
      delete other.data.alternate_greetings;
    }
    delete other.first_mes;
    delete other.alternate_greetings;
    delete other.chat;
    delete other.create_date;
    return {
      name: String(rawName ?? ""),
      description: String(rawDesc ?? ""),
      avatar: String(avatar ?? ""),
      message,
      worldBook,
      regexScripts,
      other,
      chatDate,
      createDate
    };
  }
  async function get$1(input) {
    const avatarUrl = avatarUrlFromName(input == null ? void 0 : input.name);
    const raw = await postJson("/api/characters/get", { avatar_url: avatarUrl }, "json");
    return { character: toCharacterCard(raw) };
  }
  async function list$1(input = {}) {
    const rawList = await postJson("/api/characters/all", {}, "json");
    if (!(input == null ? void 0 : input.full)) {
      return { characters: (Array.isArray(rawList) ? rawList : []).map((x) => toCharacterCard(x)) };
    }
    const out = [];
    for (const c of Array.isArray(rawList) ? rawList : []) {
      const avatar = getAvatarFromAny(c);
      if (!avatar)
        continue;
      const full = await get$1({ name: stripPngSuffix(avatar) });
      out.push(full.character);
    }
    return { characters: out };
  }
  async function deleteCharacter(input) {
    const avatarUrl = String((input == null ? void 0 : input.avatarUrl) || "").trim();
    if (!avatarUrl)
      throw new Error("avatarUrl is required");
    await postJson("/api/characters/delete", {
      avatar_url: avatarUrl,
      delete_chats: !!(input == null ? void 0 : input.deleteChats)
    }, "void");
    return { ok: true };
  }
  async function update(input) {
    const avatarUrl = avatarUrlFromName(input == null ? void 0 : input.name);
    const patch = (input == null ? void 0 : input.patch) ?? {};
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new Error("patch must be an object");
    }
    await postJson("/api/characters/merge-attributes", {
      avatar: avatarUrl,
      ...patch
    }, "void");
    if (input == null ? void 0 : input.returnCharacter) {
      const updated = await get$1({ name: input == null ? void 0 : input.name });
      return { ok: true, character: updated.character };
    }
    return { ok: true };
  }
  const getEndpoint$1 = {
    name: "get",
    handler: get$1
  };
  const listEndpoint$1 = {
    name: "list",
    handler: list$1
  };
  const deleteEndpoint = {
    name: "delete",
    handler: deleteCharacter
  };
  const updateEndpoint = {
    name: "update",
    handler: update
  };
  const characterModuleDefinition = {
    namespace: "character",
    endpoints: [getEndpoint$1, listEndpoint$1, deleteEndpoint, updateEndpoint]
  };
  function registerCharacterApis(registry2) {
    registry2.registerModule(characterModuleDefinition);
  }
  const registeredCommands = /* @__PURE__ */ new Map();
  function getSlashCommandParser() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    return ctx == null ? void 0 : ctx.SlashCommandParser;
  }
  function getSlashCommandClass() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    return ctx == null ? void 0 : ctx.SlashCommand;
  }
  function getSlashCommandArgClasses() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx)
      return null;
    return {
      SlashCommandArgument: ctx.SlashCommandArgument,
      SlashCommandNamedArgument: ctx.SlashCommandNamedArgument,
      ARGUMENT_TYPE: ctx.ARGUMENT_TYPE
    };
  }
  function mapArgumentType(type, ARGUMENT_TYPE) {
    const mapping = {
      string: "STRING",
      number: "NUMBER",
      boolean: "BOOLEAN",
      enum: "ENUM",
      variable: "VARIABLE",
      closure: "CLOSURE",
      list: "LIST",
      dictionary: "DICTIONARY"
    };
    const key = mapping[type] || "STRING";
    return (ARGUMENT_TYPE == null ? void 0 : ARGUMENT_TYPE[key]) ?? type;
  }
  async function registerSlashCommand(input) {
    const parser = getSlashCommandParser();
    const SlashCommand = getSlashCommandClass();
    const argClasses = getSlashCommandArgClasses();
    if (!parser) {
      throw new Error("SlashCommandParser not available in SillyTavern context");
    }
    if (registeredCommands.has(input.name)) {
      throw new Error(`Slash command already registered: /${input.name}`);
    }
    const wrappedCallback = async (args, value) => {
      const context = {
        namedArgs: args || {},
        unnamedArgs: value || "",
        value
      };
      const result = await input.callback(context);
      return result ?? "";
    };
    let unnamedArgs = [];
    let namedArgs = [];
    if (argClasses && input.unnamedArgumentList) {
      const { SlashCommandArgument, ARGUMENT_TYPE } = argClasses;
      if (SlashCommandArgument) {
        unnamedArgs = input.unnamedArgumentList.map((arg) => {
          var _a;
          const typeList = ((_a = arg.typeList) == null ? void 0 : _a.map((t) => mapArgumentType(t, ARGUMENT_TYPE))) || [];
          return SlashCommandArgument.fromProps({
            description: arg.description || "",
            typeList,
            isRequired: arg.isRequired ?? false,
            defaultValue: arg.defaultValue,
            enumList: arg.enumList,
            acceptsMultiple: arg.acceptsMultiple
          });
        });
      }
    }
    if (argClasses && input.namedArgumentList) {
      const { SlashCommandNamedArgument, ARGUMENT_TYPE } = argClasses;
      if (SlashCommandNamedArgument) {
        namedArgs = input.namedArgumentList.map((arg) => {
          var _a;
          const typeList = ((_a = arg.typeList) == null ? void 0 : _a.map((t) => mapArgumentType(t, ARGUMENT_TYPE))) || [];
          return SlashCommandNamedArgument.fromProps({
            name: arg.name,
            description: arg.description || "",
            typeList,
            isRequired: arg.isRequired ?? false,
            defaultValue: arg.defaultValue,
            enumList: arg.enumList,
            acceptsMultiple: arg.acceptsMultiple
          });
        });
      }
    }
    if (SlashCommand && parser.addCommandObject) {
      const command = SlashCommand.fromProps({
        name: input.name,
        callback: wrappedCallback,
        aliases: input.aliases || [],
        helpString: input.helpString || "",
        interruptsGeneration: input.interruptsGeneration ?? false,
        purgeFromMessage: input.purgeFromMessage ?? true,
        unnamedArgumentList: unnamedArgs,
        namedArgumentList: namedArgs,
        returns: input.returns,
        isHidden: input.hidden ?? false
      });
      parser.addCommandObject(command);
      registeredCommands.set(input.name, command);
    } else if (parser.addCommand) {
      parser.addCommand(
        input.name,
        wrappedCallback,
        input.aliases || [],
        input.helpString || "",
        input.interruptsGeneration ?? false,
        input.purgeFromMessage ?? true
      );
      registeredCommands.set(input.name, { name: input.name });
    } else {
      throw new Error("No suitable slash command registration API found");
    }
    return { name: input.name, ok: true };
  }
  async function unregisterSlashCommand(input) {
    const parser = getSlashCommandParser();
    if (!parser) {
      throw new Error("SlashCommandParser not available in SillyTavern context");
    }
    if (!registeredCommands.has(input.name)) {
      return { ok: false };
    }
    if (parser.commands && parser.commands instanceof Map) {
      parser.commands.delete(input.name);
    } else if (parser.commands && typeof parser.commands === "object") {
      delete parser.commands[input.name];
    }
    registeredCommands.delete(input.name);
    return { ok: true };
  }
  async function listSlashCommands() {
    const parser = getSlashCommandParser();
    if (!parser || !parser.commands) {
      return { commands: [] };
    }
    const commands = [];
    const entries = parser.commands instanceof Map ? Array.from(parser.commands.entries()) : Object.entries(parser.commands);
    for (const [name, cmd] of entries) {
      const command = cmd;
      commands.push({
        name,
        aliases: command.aliases || [],
        helpString: command.helpString
      });
    }
    return { commands };
  }
  async function executeSlashCommand(input) {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx) {
      return { ok: false, error: "SillyTavern context not available" };
    }
    const execute = ctx.executeSlashCommandsWithOptions || ctx.executeSlashCommands;
    if (!execute) {
      return { ok: false, error: "Slash command execution API not available" };
    }
    try {
      const result = await execute(input.command, {
        showOutput: input.showOutput ?? false
      });
      let pipeResult;
      if (result === null || result === void 0) {
        pipeResult = "";
      } else if (typeof result === "string") {
        pipeResult = result;
      } else if (typeof result === "object" && "pipe" in result) {
        pipeResult = String(result.pipe ?? "");
      } else {
        pipeResult = String(result);
      }
      return { ok: true, result: pipeResult };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  const registerSlashCommandEndpoint = {
    name: "register",
    handler: registerSlashCommand
  };
  const unregisterSlashCommandEndpoint = {
    name: "unregister",
    handler: unregisterSlashCommand
  };
  const listSlashCommandsEndpoint = {
    name: "list",
    handler: listSlashCommands
  };
  const executeSlashCommandEndpoint = {
    name: "execute",
    handler: executeSlashCommand
  };
  const slashCommandModuleDefinition = {
    namespace: "slashCommand",
    endpoints: [
      registerSlashCommandEndpoint,
      unregisterSlashCommandEndpoint,
      listSlashCommandsEndpoint,
      executeSlashCommandEndpoint
    ]
  };
  function registerSlashCommandApis(registry2) {
    registry2.registerModule(slashCommandModuleDefinition);
  }
  async function waitAppReady() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx)
      return;
    const { eventSource, event_types } = ctx;
    if (typeof (eventSource == null ? void 0 : eventSource.once) === "function" && (event_types == null ? void 0 : event_types.APP_READY)) {
      await new Promise((resolve) => {
        if (document.getElementById("form_create")) {
          resolve();
          return;
        }
        eventSource.once(event_types.APP_READY, () => resolve());
      });
    }
  }
  function ensurePngExtension(name) {
    const trimmed = name.trim();
    if (trimmed.toLowerCase().endsWith(".png")) {
      return trimmed;
    }
    return `${trimmed}.png`;
  }
  async function imageUrlToBase64(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          resolve(result);
        };
        reader.onerror = () => reject(new Error("Failed to read image as base64"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  }
  function getContext() {
    var _a, _b;
    return (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
  }
  function getCurrentCharacterAvatarFileName() {
    var _a;
    const ctx = getContext();
    if (!ctx)
      return null;
    const characterId = ctx.characterId;
    if (characterId === void 0 || characterId === null || characterId < 0) {
      return null;
    }
    const character = (_a = ctx.characters) == null ? void 0 : _a[characterId];
    if (!character)
      return null;
    const avatarFileName = character.avatar || "";
    if (!avatarFileName || avatarFileName === "none") {
      return null;
    }
    return avatarFileName;
  }
  function getCurrentUserAvatarFileName() {
    var _a, _b;
    const ctx = getContext();
    if (!ctx)
      return null;
    const personas = (_a = ctx.powerUserSettings) == null ? void 0 : _a.personas;
    if (personas && typeof personas === "object") {
      const keys = Object.keys(personas);
      if (keys.length > 0) {
        const defaultPersona = (_b = ctx.powerUserSettings) == null ? void 0 : _b.default_persona;
        if (defaultPersona && keys.includes(defaultPersona)) {
          return defaultPersona;
        }
        return keys[0];
      }
    }
    return "user-default.png";
  }
  async function fetchUserAvatarsList() {
    var _a;
    try {
      const ctx = getContext();
      const headers = ((_a = ctx == null ? void 0 : ctx.getRequestHeaders) == null ? void 0 : _a.call(ctx, { omitContentType: true })) || {};
      const response = await fetch("/api/avatars/get", {
        method: "POST",
        headers
      });
      if (response.ok) {
        const avatars = await response.json();
        if (Array.isArray(avatars)) {
          return avatars;
        }
      }
    } catch (error) {
      console.error("Error fetching user avatars:", error);
    }
    return [];
  }
  async function buildAvatarOutput(type, fileName, isCurrent, includeFullBase64 = true) {
    var _a, _b;
    const ctx = getContext();
    let url;
    let thumbnailUrl;
    if (type === "character") {
      url = `characters/${fileName}`;
      thumbnailUrl = ((_a = ctx == null ? void 0 : ctx.getThumbnailUrl) == null ? void 0 : _a.call(ctx, "avatar", fileName)) || `/thumbnail?type=avatar&file=${encodeURIComponent(fileName)}`;
    } else {
      url = `User Avatars/${fileName}`;
      thumbnailUrl = ((_b = ctx == null ? void 0 : ctx.getThumbnailUrl) == null ? void 0 : _b.call(ctx, "persona", fileName)) || `/thumbnail?type=persona&file=${encodeURIComponent(fileName)}`;
    }
    let base64 = "";
    let thumbnailBase64 = "";
    if (includeFullBase64) {
      [base64, thumbnailBase64] = await Promise.all([
        imageUrlToBase64(url),
        imageUrlToBase64(thumbnailUrl)
      ]);
    } else {
      thumbnailBase64 = await imageUrlToBase64(thumbnailUrl);
    }
    const name = fileName.replace(/\.png$/i, "");
    return {
      type,
      name,
      url,
      thumbnailUrl,
      base64,
      thumbnailBase64,
      isCurrent
    };
  }
  async function get(input) {
    await waitAppReady();
    const { type, name } = input;
    if (!type) {
      throw new Error("type is required");
    }
    let fileName;
    let isCurrent = false;
    if (name) {
      fileName = ensurePngExtension(name);
    } else {
      isCurrent = true;
      if (type === "character") {
        const currentFileName = getCurrentCharacterAvatarFileName();
        if (!currentFileName) {
          throw new Error("No character selected in current chat");
        }
        fileName = currentFileName;
      } else {
        const currentFileName = getCurrentUserAvatarFileName();
        if (!currentFileName) {
          throw new Error("No user avatar found");
        }
        fileName = currentFileName;
      }
    }
    return buildAvatarOutput(type, fileName, isCurrent);
  }
  async function list(input) {
    await waitAppReady();
    const { type, includeFullBase64 = false } = input;
    if (!type) {
      throw new Error("type is required");
    }
    const ctx = getContext();
    if (!ctx) {
      throw new Error("SillyTavern context not available");
    }
    const result = {
      characters: [],
      users: [],
      total: 0
    };
    const currentCharacterFileName = getCurrentCharacterAvatarFileName();
    const currentUserFileName = getCurrentUserAvatarFileName();
    if (type === "character" || type === "all") {
      const characters = ctx.characters || [];
      const avatarPromises = [];
      for (const char of characters) {
        const avatar = char == null ? void 0 : char.avatar;
        if (avatar && avatar !== "none") {
          const isCurrent = avatar === currentCharacterFileName;
          avatarPromises.push(buildAvatarOutput("character", avatar, isCurrent, includeFullBase64));
        }
      }
      result.characters = await Promise.all(avatarPromises);
    }
    if (type === "user" || type === "all") {
      const userAvatarFiles = await fetchUserAvatarsList();
      const avatarPromises = [];
      for (const fileName of userAvatarFiles) {
        if (fileName) {
          const isCurrent = fileName === currentUserFileName;
          avatarPromises.push(buildAvatarOutput("user", fileName, isCurrent, includeFullBase64));
        }
      }
      result.users = await Promise.all(avatarPromises);
    }
    result.total = result.characters.length + result.users.length;
    return result;
  }
  const getEndpoint = {
    name: "get",
    handler: get
  };
  const listEndpoint = {
    name: "list",
    handler: list
  };
  const avatarModuleDefinition = {
    namespace: "avatar",
    endpoints: [getEndpoint, listEndpoint]
  };
  function registerAvatarApis(registry2) {
    registry2.registerModule(avatarModuleDefinition);
  }
  function registerAllApis(registry2) {
    registerPromptApis(registry2);
    registerFileApis(registry2);
    registerUiApis(registry2);
    registerHooksApis(registry2);
    registerChatHistoryApis(registry2);
    registerPresetApis(registry2);
    registerWorldBookApis(registry2);
    registerVariablesApis(registry2);
    registerRegexScriptApis(registry2);
    registerCharacterApis(registry2);
    registerSlashCommandApis(registry2);
    registerAvatarApis(registry2);
  }
  const VERSION_STR = "1.0.0";
  const registry = new ApiRegistry();
  registerAllApis(registry);
  window.ST_API = registry.getPublicApi(VERSION_STR);
  async function initSelfPanel() {
    var _a, _b;
    const ctx = (_b = (_a = window.SillyTavern) == null ? void 0 : _a.getContext) == null ? void 0 : _b.call(_a);
    if (!ctx)
      return;
    const { eventSource, event_types } = ctx;
    let isRegistered = false;
    const register = async () => {
      if (isRegistered || document.getElementById("st-api-wrapper.settings_container"))
        return;
      isRegistered = true;
      const safeRegister = async (label, fn) => {
        try {
          await fn();
        } catch (e) {
          console.warn(`[ST API] ${label} registration skipped:`, e instanceof Error ? e.message : e);
        }
      };
      await safeRegister("Settings Panel", () => window.ST_API.ui.registerSettingsPanel({
        id: "st-api-wrapper.settings",
        title: "ST API Wrapper",
        target: "extensions_settings",
        expanded: false,
        order: 0,
        content: {
          kind: "render",
          render: (container) => {
            const mountPoint = document.createElement("div");
            container.appendChild(mountPoint);
            const app = createApp(App);
            app.mount(mountPoint);
            return () => app.unmount();
          }
        }
      }));
    };
    eventSource.on(event_types.APP_READY, register);
    register();
  }
  initSelfPanel();
})();
