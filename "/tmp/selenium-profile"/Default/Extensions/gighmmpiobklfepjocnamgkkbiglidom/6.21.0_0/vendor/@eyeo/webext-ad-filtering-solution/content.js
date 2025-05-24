/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7159:
/***/ ((__unused_webpack_module, exports) => {

/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



let textToRegExp =
/**
 * Converts raw text into a regular expression string
 * @param {string} text the string to convert
 * @return {string} regular expression representation of the text
 * @package
 */
exports.textToRegExp = text => text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const regexpRegexp = /^\/(.*)\/([imu]*)$/;

/**
 * Make a regular expression from a text argument.
 *
 * If it can be parsed as a regular expression, parse it and the flags.
 *
 * @param {string} text the text argument.
 *
 * @return {?RegExp} a RegExp object or null in case of error.
 */
exports.makeRegExpParameter = function makeRegExpParameter(text) {
  let [, source, flags] = regexpRegexp.exec(text) || [null, textToRegExp(text)];

  try {
    return new RegExp(source, flags);
  }
  catch (e) {
    return null;
  }
};

let splitSelector = exports.splitSelector = function splitSelector(selector) {
  if (!selector.includes(",")) {
    return [selector];
  }

  let selectors = [];
  let start = 0;
  let level = 0;
  let sep = "";

  for (let i = 0; i < selector.length; i++) {
    let chr = selector[i];

    // ignore escaped characters
    if (chr == "\\") {
      i++;
    }
    // don't split within quoted text
    else if (chr == sep) {
      sep = "";             // e.g. [attr=","]
    }
    else if (sep == "") {
      if (chr == '"' || chr == "'") {
        sep = chr;
      }
      // don't split between parentheses
      else if (chr == "(") {
        level++;            // e.g. :matches(div,span)
      }
      else if (chr == ")") {
        level = Math.max(0, level - 1);
      }
      else if (chr == "," && level == 0) {
        selectors.push(selector.substring(start, i));
        start = i + 1;
      }
    }
  }

  selectors.push(selector.substring(start));
  return selectors;
};

function findTargetSelectorIndex(selector) {
  let index = 0;
  let whitespace = 0;
  let scope = [];

  // Start from the end of the string and go character by character, where each
  // character is a Unicode code point.
  for (let character of [...selector].reverse()) {
    let currentScope = scope[scope.length - 1];

    if (character == "'" || character == "\"") {
      // If we're already within the same type of quote, close the scope;
      // otherwise open a new scope.
      if (currentScope == character) {
        scope.pop();
      }
      else {
        scope.push(character);
      }
    }
    else if (character == "]" || character == ")") {
      // For closing brackets and parentheses, open a new scope only if we're
      // not within a quote. Within quotes these characters should have no
      // meaning.
      if (currentScope != "'" && currentScope != "\"") {
        scope.push(character);
      }
    }
    else if (character == "[") {
      // If we're already within a bracket, close the scope.
      if (currentScope == "]") {
        scope.pop();
      }
    }
    else if (character == "(") {
      // If we're already within a parenthesis, close the scope.
      if (currentScope == ")") {
        scope.pop();
      }
    }
    else if (!currentScope) {
      // At the top level (not within any scope), count the whitespace if we've
      // encountered it. Otherwise if we've hit one of the combinators,
      // terminate here; otherwise if we've hit a non-colon character,
      // terminate here.
      if (/\s/.test(character)) {
        whitespace++;
      }
      else if ((character == ">" || character == "+" || character == "~") ||
               (whitespace > 0 && character != ":")) {
        break;
      }
    }

    // Zero out the whitespace count if we've entered a scope.
    if (scope.length > 0) {
      whitespace = 0;
    }

    // Increment the index by the size of the character. Note that for Unicode
    // composite characters (like emoji) this will be more than one.
    index += character.length;
  }

  return selector.length - index + whitespace;
}

/**
 * Qualifies a CSS selector with a qualifier, which may be another CSS selector
 * or an empty string. For example, given the selector "div.bar" and the
 * qualifier "#foo", this function returns "div#foo.bar".
 * @param {string} selector The selector to qualify.
 * @param {string} qualifier The qualifier with which to qualify the selector.
 * @returns {string} The qualified selector.
 * @package
 */
exports.qualifySelector = function qualifySelector(selector, qualifier) {
  let qualifiedSelector = "";

  let qualifierTargetSelectorIndex = findTargetSelectorIndex(qualifier);
  let [, qualifierType = ""] =
    /^([a-z][a-z-]*)?/i.exec(qualifier.substring(qualifierTargetSelectorIndex));

  for (let sub of splitSelector(selector)) {
    sub = sub.trim();

    qualifiedSelector += ", ";

    let index = findTargetSelectorIndex(sub);

    // Note that the first group in the regular expression is optional. If it
    // doesn't match (e.g. "#foo::nth-child(1)"), type will be an empty string.
    let [, type = "", rest] =
      /^([a-z][a-z-]*)?\*?(.*)/i.exec(sub.substring(index));

    if (type == qualifierType) {
      type = "";
    }

    // If the qualifier ends in a combinator (e.g. "body #foo>"), we put the
    // type and the rest of the selector after the qualifier
    // (e.g. "body #foo>div.bar"); otherwise (e.g. "body #foo") we merge the
    // type into the qualifier (e.g. "body div#foo.bar").
    if (/[\s>+~]$/.test(qualifier)) {
      qualifiedSelector += sub.substring(0, index) + qualifier + type + rest;
    }
    else {
      qualifiedSelector += sub.substring(0, index) + type + qualifier + rest;
    }
  }

  // Remove the initial comma and space.
  return qualifiedSelector.substring(2);
};


/***/ }),

/***/ 1267:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



const {makeRegExpParameter, splitSelector,
       qualifySelector} = __webpack_require__(7159);
const {filterToRegExp} = __webpack_require__(453);

const DEFAULT_MIN_INVOCATION_INTERVAL = 3000;
let minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
const DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME = 50;
let maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;

const abpSelectorRegexp = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/;

let testInfo = null;

function toCSSStyleDeclaration(value) {
  return Object.assign(document.createElement("test"), {style: value}).style;
}

/**
 * Enables test mode, which tracks additional metadata about the inner
 * workings for test purposes. This also allows overriding internal
 * configuration.
 *
 * @param {object} options
 * @param {number} options.minInvocationInterval Overrides how long
 *   must be waited between filter processing runs
 * @param {number} options.maxSynchronousProcessingTime Overrides how
 *   long the thread may spend processing filters before it must yield
 *   its thread
 */
__webpack_unused_export__ = function setTestMode(options) {
  if (typeof options.minInvocationInterval !== "undefined") {
    minInvocationInterval = options.minInvocationInterval;
  }
  if (typeof options.maxSynchronousProcessingTime !== "undefined") {
    maxSynchronousProcessingTime = options.maxSynchronousProcessingTime;
  }

  testInfo = {
    lastProcessedElements: new Set(),
    failedAssertions: []
  };
};

__webpack_unused_export__ = function getTestInfo() {
  return testInfo;
};

__webpack_unused_export__ = function() {
  minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
  maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;
  testInfo = null;
};

/**
 * Creates a new IdleDeadline.
 *
 * Note: This function is synchronous and does NOT request an idle
 * callback.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline}.
 * @return {IdleDeadline}
 */
function newIdleDeadline() {
  let startTime = performance.now();
  return {
    didTimeout: false,
    timeRemaining() {
      let elapsed = performance.now() - startTime;
      let remaining = maxSynchronousProcessingTime - elapsed;
      return Math.max(0, remaining);
    }
  };
}

/**
 * Returns a promise that is resolved when the browser is next idle.
 *
 * This is intended to be used for long running tasks on the UI thread
 * to allow other UI events to process.
 *
 * @return {Promise.<IdleDeadline>}
 *    A promise that is fulfilled when you can continue processing
 */
function yieldThread() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(resolve);
    }
    else {
      setTimeout(() => {
        resolve(newIdleDeadline());
      }, 0);
    }
  });
}


function getCachedPropertyValue(object, name, defaultValueFunc = () => {}) {
  let value = object[name];
  if (typeof value == "undefined") {
    Object.defineProperty(object, name, {value: value = defaultValueFunc()});
  }
  return value;
}

/**
 * Return position of node from parent.
 * @param {Node} node the node to find the position of.
 * @return {number} One-based index like for :nth-child(), or 0 on error.
 */
function positionInParent(node) {
  let index = 0;
  for (let child of node.parentNode.children) {
    if (child == node) {
      return index + 1;
    }

    index++;
  }

  return 0;
}

function makeSelector(node, selector = "") {
  if (node == null) {
    return null;
  }
  if (!node.parentElement) {
    let newSelector = ":root";
    if (selector) {
      newSelector += " > " + selector;
    }
    return newSelector;
  }
  let idx = positionInParent(node);
  if (idx > 0) {
    let newSelector = `${node.tagName}:nth-child(${idx})`;
    if (selector) {
      newSelector += " > " + selector;
    }
    return makeSelector(node.parentElement, newSelector);
  }

  return selector;
}

function parseSelectorContent(content, startIndex) {
  let parens = 1;
  let quote = null;
  let i = startIndex;
  for (; i < content.length; i++) {
    let c = content[i];
    if (c == "\\") {
      // Ignore escaped characters
      i++;
    }
    else if (quote) {
      if (c == quote) {
        quote = null;
      }
    }
    else if (c == "'" || c == '"') {
      quote = c;
    }
    else if (c == "(") {
      parens++;
    }
    else if (c == ")") {
      parens--;
      if (parens == 0) {
        break;
      }
    }
  }

  if (parens > 0) {
    return null;
  }
  return {text: content.substring(startIndex, i), end: i};
}

/**
 * Stringified style objects
 * @typedef {Object} StringifiedStyle
 * @property {string} style CSS style represented by a string.
 * @property {string[]} subSelectors selectors the CSS properties apply to.
 */

/**
 * Produce a string representation of the stylesheet entry.
 * @param {CSSStyleRule} rule the CSS style rule.
 * @return {StringifiedStyle} the stringified style.
 */
function stringifyStyle(rule) {
  let styles = [];
  for (let i = 0; i < rule.style.length; i++) {
    let property = rule.style.item(i);
    let value = rule.style.getPropertyValue(property);
    let priority = rule.style.getPropertyPriority(property);
    styles.push(`${property}: ${value}${priority ? " !" + priority : ""};`);
  }
  styles.sort();
  return {
    style: styles.join(" "),
    subSelectors: splitSelector(rule.selectorText)
  };
}

let scopeSupported = null;

function tryQuerySelector(subtree, selector, all) {
  let elements = null;
  try {
    elements = all ? subtree.querySelectorAll(selector) :
      subtree.querySelector(selector);
    scopeSupported = true;
  }
  catch (e) {
    // Edge doesn't support ":scope"
    scopeSupported = false;
  }
  return elements;
}

/**
 * Query selector.
 *
 * If it is relative, will try :scope.
 *
 * @param {Node} subtree the element to query selector
 * @param {string} selector the selector to query
 * @param {bool} [all=false] true to perform querySelectorAll()
 *
 * @returns {?(Node|NodeList)} result of the query. null in case of error.
 */
function scopedQuerySelector(subtree, selector, all) {
  if (selector[0] == ">") {
    selector = ":scope" + selector;
    if (scopeSupported) {
      return all ? subtree.querySelectorAll(selector) :
        subtree.querySelector(selector);
    }
    if (scopeSupported == null) {
      return tryQuerySelector(subtree, selector, all);
    }
    return null;
  }
  return all ? subtree.querySelectorAll(selector) :
    subtree.querySelector(selector);
}

function scopedQuerySelectorAll(subtree, selector) {
  return scopedQuerySelector(subtree, selector, true);
}

class PlainSelector {
  constructor(selector) {
    this._selector = selector;
    this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(selector);
    this.maybeContainsSiblingCombinators = /[~+]/.test(selector);
  }

  /**
   * Generator function returning a pair of selector string and subtree.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getSelectors(prefix, subtree, targets) {
    yield [prefix + this._selector, subtree];
  }
}

const incompletePrefixRegexp = /[\s>+~]$/;

class NotSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        if (!this._innerPattern.matches(element, subtree)) {
          yield element;
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class HasSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        for (let selector of this._innerPattern.evaluate(element, targets)) {
          if (selector == null) {
            yield null;
          }
          else if (scopedQuerySelector(element, selector)) {
            yield element;
          }
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class XPathSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;
    this.maybeDependsOnAttributes = true;

    let evaluator = new XPathEvaluator();
    this._expression = evaluator.createExpression(textContent, null);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), element];
    }
  }

  *getElements(prefix, subtree, targets) {
    let {ORDERED_NODE_SNAPSHOT_TYPE: flag} = XPathResult;
    let elements = prefix ? scopedQuerySelectorAll(subtree, prefix) : [subtree];
    for (let parent of elements) {
      let result = this._expression.evaluate(parent, flag, null);
      for (let i = 0, {snapshotLength} = result; i < snapshotLength; i++) {
        yield result.snapshotItem(i);
      }
    }
  }
}

class ContainsSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;

    this._regexp = makeRegExpParameter(textContent);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets)) {
      yield [makeSelector(element), subtree];
    }
  }

  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;

    let elements = scopedQuerySelectorAll(subtree, actualPrefix);

    if (elements) {
      let lastRoot = null;
      for (let element of elements) {
        // For a filter like div:-abp-contains(Hello) and a subtree like
        // <div id="a"><div id="b"><div id="c">Hello</div></div></div>
        // we're only interested in div#a
        if (lastRoot && lastRoot.contains(element)) {
          yield null;
          continue;
        }

        lastRoot = element;

        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo) {
          testInfo.lastProcessedElements.add(element);
        }

        if (this._regexp && this._regexp.test(element.textContent)) {
          yield element;
        }
        else {
          yield null;
        }
      }
    }
  }
}

class PropsSelector {
  constructor(propertyExpression) {
    this.dependsOnStyles = true;
    this.maybeDependsOnAttributes = true;

    let regexpString;
    if (propertyExpression.length >= 2 && propertyExpression[0] == "/" &&
        propertyExpression[propertyExpression.length - 1] == "/") {
      regexpString = propertyExpression.slice(1, -1);
    }
    else {
      regexpString = filterToRegExp(propertyExpression);
    }

    this._regexp = new RegExp(regexpString, "i");

    this._subSelectors = [];
  }

  *getSelectors(prefix, subtree, targets) {
    for (let subSelector of this._subSelectors) {
      if (subSelector.startsWith("*") &&
          !incompletePrefixRegexp.test(prefix)) {
        subSelector = subSelector.substring(1);
      }

      yield [qualifySelector(subSelector, prefix), subtree];
    }
  }

  setStyles(styles) {
    this._subSelectors = [];
    for (let style of styles) {
      if (this._regexp.test(style.style)) {
        for (let subSelector of style.subSelectors) {
          let idx = subSelector.lastIndexOf("::");
          if (idx != -1) {
            subSelector = subSelector.substring(0, idx);
          }

          this._subSelectors.push(subSelector);
        }
      }
    }
  }
}

class Pattern {
  constructor(selectors, text, remove = false, css = null) {
    this.selectors = selectors;
    this.text = text;
    this.remove = remove;
    this.css = css;
  }

  get dependsOnStyles() {
    return getCachedPropertyValue(
      this, "_dependsOnStyles", () => this.selectors.some(
        selector => selector.dependsOnStyles
      )
    );
  }

  get maybeDependsOnAttributes() {
    // Observe changes to attributes if either there's a plain selector that
    // looks like an ID selector, class selector, or attribute selector in one
    // of the patterns (e.g. "a[href='https://example.com/']")
    // or there's a properties selector nested inside a has selector
    // (e.g. "div:-abp-has(:-abp-properties(color: blue))")
    return getCachedPropertyValue(
      this, "_maybeDependsOnAttributes", () => this.selectors.some(
        selector => selector.maybeDependsOnAttributes ||
                    (selector instanceof HasSelector &&
                     selector.dependsOnStyles)
      )
    );
  }

  get dependsOnCharacterData() {
    // Observe changes to character data only if there's a contains selector in
    // one of the patterns.
    return getCachedPropertyValue(
      this, "_dependsOnCharacterData", () => this.selectors.some(
        selector => selector.dependsOnCharacterData
      )
    );
  }

  get maybeContainsSiblingCombinators() {
    return getCachedPropertyValue(
      this, "_maybeContainsSiblingCombinators", () => this.selectors.some(
        selector => selector.maybeContainsSiblingCombinators
      )
    );
  }

  matchesMutationTypes(mutationTypes) {
    let mutationTypeMatchMap = getCachedPropertyValue(
      this, "_mutationTypeMatchMap", () => new Map([
        // All types of DOM-dependent patterns are affected by mutations of
        // type "childList".
        ["childList", true],
        ["attributes", this.maybeDependsOnAttributes],
        ["characterData", this.dependsOnCharacterData]
      ])
    );

    for (let mutationType of mutationTypes) {
      if (mutationTypeMatchMap.get(mutationType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generator function returning CSS selectors for all elements that
   * match the pattern.
   *
   * This allows transforming from selectors that may contain custom
   * :-abp- selectors to pure CSS selectors that can be used to select
   * elements.
   *
   * The selectors returned from this function may be invalidated by DOM
   * mutations.
   *
   * @param {Node} subtree the subtree we work on
   * @param {Node[]} [targets] the nodes we are interested in. May be
   * used to optimize search.
   */
  *evaluate(subtree, targets) {
    let selectors = this.selectors;
    function* evaluateInner(index, prefix, currentSubtree) {
      if (index >= selectors.length) {
        yield prefix;
        return;
      }
      for (let [selector, element] of selectors[index].getSelectors(
        prefix, currentSubtree, targets
      )) {
        if (selector == null) {
          yield null;
        }
        else {
          yield* evaluateInner(index + 1, selector, element);
        }
      }
      // Just in case the getSelectors() generator above had to run some heavy
      // document.querySelectorAll() call which didn't produce any results, make
      // sure there is at least one point where execution can pause.
      yield null;
    }
    yield* evaluateInner(0, "", subtree);
  }

  /**
   * Checks if a pattern matches a specific element
   * @param {Node} [target] the element we're interested in checking for
   * matches on.
   * @param {Node} subtree the subtree we work on
   * @return {bool}
   */
  matches(target, subtree) {
    let targetFilter = [target];
    if (this.maybeContainsSiblingCombinators) {
      targetFilter = null;
    }

    let selectorGenerator = this.evaluate(subtree, targetFilter);
    for (let selector of selectorGenerator) {
      if (selector && target.matches(selector)) {
        return true;
      }
    }
    return false;
  }

  setStyles(styles) {
    for (let selector of this.selectors) {
      if (selector.dependsOnStyles) {
        selector.setStyles(styles);
      }
    }
  }
}

function extractMutationTypes(mutations) {
  let types = new Set();

  for (let mutation of mutations) {
    types.add(mutation.type);

    // There are only 3 types of mutations: "attributes", "characterData", and
    // "childList".
    if (types.size == 3) {
      break;
    }
  }

  return types;
}

function extractMutationTargets(mutations) {
  if (!mutations) {
    return null;
  }

  let targets = new Set();

  for (let mutation of mutations) {
    if (mutation.type == "childList") {
      // When new nodes are added, we're interested in the added nodes rather
      // than the parent.
      for (let node of mutation.addedNodes) {
        targets.add(node);
      }
      if (mutation.removedNodes.length > 0) {
        targets.add(mutation.target);
      }
    }
    else {
      targets.add(mutation.target);
    }
  }

  return [...targets];
}

function filterPatterns(patterns, {stylesheets, mutations}) {
  if (!stylesheets && !mutations) {
    return patterns.slice();
  }

  let mutationTypes = mutations ? extractMutationTypes(mutations) : null;

  return patterns.filter(
    pattern => (stylesheets && pattern.dependsOnStyles) ||
               (mutations && pattern.matchesMutationTypes(mutationTypes))
  );
}

function shouldObserveAttributes(patterns) {
  return patterns.some(pattern => pattern.maybeDependsOnAttributes);
}

function shouldObserveCharacterData(patterns) {
  return patterns.some(pattern => pattern.dependsOnCharacterData);
}

function shouldObserveStyles(patterns) {
  return patterns.some(pattern => pattern.dependsOnStyles);
}

/**
 * @callback hideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be hidden
 */

/**
 * @callback unhideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 */

/**
 * @callback removeElemsFunc
 * @param {Node[]} elements Elements on the page that should be removed
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be removed
 * removed from the DOM
 */

/**
 * @callback cssElemsFunc
 * @param {Node[]} elements Elements on the page that should
 * apply inline CSS rules
 * @param {string[]} cssPatterns The CSS patterns to be applied
 */


/**
 * Manages the front-end processing of element hiding emulation filters.
 */
exports.WX = class ElemHideEmulation {
  /**
   * @param {module:content/elemHideEmulation~hideElemsFunc} hideElemsFunc
   *   A callback that should be provided to do the actual element hiding.
   * @param {module:content/elemHideEmulation~unhideElemsFunc} unhideElemsFunc
   *   A callback that should be provided to unhide previously hidden elements.
   * @param {module:content/elemHideEmulation~removeElemsFunc} removeElemsFunc
   *   A callback that should be provided to remove elements from the DOM.
   * @param {module:content/elemHideEmulation~cssElemsFunc} cssElemsFunc
   *   A callback that should be provided to apply inline CSS rules to elements
  */
  constructor(
    hideElemsFunc = () => {},
    unhideElemsFunc = () => {},
    removeElemsFunc = () => {},
    cssElemsFunc = () => {}
  ) {
    this._filteringInProgress = false;
    this._nextFilteringScheduled = false;
    this._lastInvocation = -minInvocationInterval;
    this._scheduledProcessing = null;

    this.document = document;
    this.hideElemsFunc = hideElemsFunc;
    this.unhideElemsFunc = unhideElemsFunc;
    this.removeElemsFunc = removeElemsFunc;
    this.cssElemsFunc = cssElemsFunc;
    this.observer = new MutationObserver(this.observe.bind(this));
    this.hiddenElements = new Map();
  }

  isSameOrigin(stylesheet) {
    try {
      return new URL(stylesheet.href).origin == this.document.location.origin;
    }
    catch (e) {
      // Invalid URL, assume that it is first-party.
      return true;
    }
  }

  /**
   * Parse the selector
   * @param {string} selector the selector to parse
   * @return {Array} selectors is an array of objects,
   * or null in case of errors.
   */
  parseSelector(selector) {
    if (selector.length == 0) {
      return [];
    }

    let match = abpSelectorRegexp.exec(selector);
    if (!match) {
      return [new PlainSelector(selector)];
    }

    let selectors = [];
    if (match.index > 0) {
      selectors.push(new PlainSelector(selector.substring(0, match.index)));
    }

    let startIndex = match.index + match[0].length;
    let content = parseSelectorContent(selector, startIndex);
    if (!content) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector} ` +
                                   "due to unmatched parentheses."));
      return null;
    }

    if (match[1] == "-abp-properties") {
      selectors.push(new PropsSelector(content.text));
    }
    else if (match[1] == "-abp-has" || match[1] == "has") {
      let hasSelectors = this.parseSelector(content.text);
      if (hasSelectors == null) {
        return null;
      }
      selectors.push(new HasSelector(hasSelectors));
    }
    else if (match[1] == "-abp-contains" || match[1] == "has-text") {
      selectors.push(new ContainsSelector(content.text));
    }
    else if (match[1] === "xpath") {
      try {
        selectors.push(new XPathSelector(content.text));
      }
      catch ({message}) {
        console.warn(
          new SyntaxError(
            "Failed to parse Adblock Plus " +
            `selector ${selector}, invalid ` +
            `xpath: ${content.text} ` +
            `error: ${message}.`
          )
        );

        return null;
      }
    }
    else if (match[1] == "not") {
      let notSelectors = this.parseSelector(content.text);
      if (notSelectors == null) {
        return null;
      }

      // if all of the inner selectors are PlainSelectors, then we
      // don't actually need to use our selector at all. We're better
      // off delegating to the browser :not implementation.
      if (notSelectors.every(s => s instanceof PlainSelector)) {
        selectors.push(new PlainSelector(`:not(${content.text})`));
      }
      else {
        selectors.push(new NotSelector(notSelectors));
      }
    }
    else {
      // this is an error, can't parse selector.
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, invalid ` +
                                   `pseudo-class :${match[1]}().`));
      return null;
    }

    let suffix = this.parseSelector(selector.substring(content.end + 1));
    if (suffix == null) {
      return null;
    }

    selectors.push(...suffix);

    if (selectors.length == 1 && selectors[0] instanceof ContainsSelector) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, can't ` +
                                   "have a lonely :-abp-contains()."));
      return null;
    }
    return selectors;
  }

  /**
   * Reads the rules out of CSS stylesheets
   * @param {CSSStyleSheet[]} [stylesheets] The list of stylesheets to
   * read.
   * @return {CSSStyleRule[]}
   */
  _readCssRules(stylesheets) {
    let cssStyles = [];

    for (let stylesheet of stylesheets || []) {
      // Explicitly ignore third-party stylesheets to ensure consistent behavior
      // between Firefox and Chrome.
      if (!this.isSameOrigin(stylesheet)) {
        continue;
      }

      let rules;
      try {
        rules = stylesheet.cssRules;
      }
      catch (e) {
        // On Firefox, there is a chance that an InvalidAccessError
        // get thrown when accessing cssRules. Just skip the stylesheet
        // in that case.
        // See https://searchfox.org/mozilla-central/rev/f65d7528e34ef1a7665b4a1a7b7cdb1388fcd3aa/layout/style/StyleSheet.cpp#699
        continue;
      }

      if (!rules) {
        continue;
      }

      for (let rule of rules) {
        if (rule.type != rule.STYLE_RULE) {
          continue;
        }

        cssStyles.push(stringifyStyle(rule));
      }
    }
    return cssStyles;
  }

  /**
   * Processes the current document and applies all rules to it.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    The list of new stylesheets that have been added to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, all of document's stylesheets will be considered
   *    then and all rules, including the ones not dependent on styles.
   * @param {MutationRecord[]} [mutations]
   *    The list of DOM mutations that have been applied to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, the entire document will be considered
   *    then and all rules, including the ones not dependent on the DOM.
   * @return {Promise}
   *    A promise that is fulfilled once all filtering is completed
   */
  async _addSelectors(stylesheets, mutations) {
    if (testInfo) {
      testInfo.lastProcessedElements.clear();
    }

    let deadline = newIdleDeadline();

    if (shouldObserveStyles(this.patterns)) {
      this._refreshPatternStyles();
    }

    let patternsToCheck = filterPatterns(
      this.patterns, {stylesheets, mutations}
    );

    let targets = extractMutationTargets(mutations);

    const elementsToHide = [];
    const elementsToHideFilters = [];
    const elementsToRemoveFilters = [];
    const elementsToRemove = [];
    const elementsToApplyCSS = [];
    const cssPatterns = [];
    let elementsToUnhide = new Set(this.hiddenElements.keys());
    for (let pattern of patternsToCheck) {
      let evaluationTargets = targets;

      // If the pattern appears to contain any sibling combinators, we can't
      // easily optimize based on the mutation targets. Since this is a
      // special case, skip the optimization. By setting it to null here we
      // make sure we process the entire DOM.
      if (pattern.maybeContainsSiblingCombinators) {
        evaluationTargets = null;
      }

      let generator = pattern.evaluate(this.document, evaluationTargets);
      for (let selector of generator) {
        if (selector != null) {
          for (let element of this.document.querySelectorAll(selector)) {
            if (pattern.remove) {
              elementsToRemove.push(element);
              elementsToRemoveFilters.push(pattern.text);
              elementsToUnhide.delete(element);
            }
            else if (pattern.css) {
              elementsToApplyCSS.push(element);
              cssPatterns.push(pattern);
            }
            else if (!this.hiddenElements.has(element)) {
              elementsToHide.push(element);
              elementsToHideFilters.push(pattern.text);
            }
            else {
              elementsToUnhide.delete(element);
            }
          }
        }

        if (deadline.timeRemaining() <= 0) {
          deadline = await yieldThread();
        }
      }
    }
    this._removeElems(elementsToRemove, elementsToRemoveFilters);
    this._applyCSSToElems(elementsToApplyCSS, cssPatterns);
    this._hideElems(elementsToHide, elementsToHideFilters);

    // The search for elements to hide it optimized to find new things
    // to hide quickly, by not checking all patterns and not checking
    // the full DOM. That's why we need to do a more thorough check
    // for each remaining element that might need to be unhidden,
    // checking all patterns.
    for (let elem of elementsToUnhide) {
      if (!elem.isConnected) {
        // elements that are no longer in the DOM should be unhidden
        // in case they're ever readded, and then forgotten about so
        // we don't cause a memory leak.
        continue;
      }
      let matchesAny = this.patterns.some(pattern => pattern.matches(
        elem, this.document
      ));
      if (matchesAny) {
        elementsToUnhide.delete(elem);
      }

      if (deadline.timeRemaining() <= 0) {
        deadline = await yieldThread();
      }
    }
    this._unhideElems(Array.from(elementsToUnhide));
  }

  _removeElems(elementsToRemove, elementFilters) {
    if (elementsToRemove.length > 0) {
      this.removeElemsFunc(elementsToRemove, elementFilters);
      for (let elem of elementsToRemove) {
        // they're not hidden anymore (if they ever were), they're
        // removed. There's no unhiding these ones!
        this.hiddenElements.delete(elem);
      }
    }
  }

  _applyCSSToElems(elements, cssPatterns) {
    if (elements.length > 0) {
      this.cssElemsFunc(elements, cssPatterns);
    }
  }

  _hideElems(elementsToHide, elementFilters) {
    if (elementsToHide.length > 0) {
      this.hideElemsFunc(elementsToHide, elementFilters);
      for (let i = 0; i < elementsToHide.length; i++) {
        this.hiddenElements.set(elementsToHide[i], elementFilters[i]);
      }
    }
  }

  _unhideElems(elementsToUnhide) {
    if (elementsToUnhide.length > 0) {
      this.unhideElemsFunc(elementsToUnhide);
      for (let elem of elementsToUnhide) {
        this.hiddenElements.delete(elem);
      }
    }
  }

  /**
   * Performed any scheduled processing.
   *
   * This function is asyncronous, and should not be run multiple
   * times in parallel. The flag `_filteringInProgress` is set and
   * unset so you can check if it's already running.
   * @return {Promise}
   *  A promise that is fulfilled once all filtering is completed
   */
  async _processFiltering() {
    if (this._filteringInProgress) {
      console.warn("ElemHideEmulation scheduling error: " +
                   "Tried to process filtering in parallel.");
      if (testInfo) {
        testInfo.failedAssertions.push(
          "Tried to process filtering in parallel"
        );
      }

      return;
    }

    let params = this._scheduledProcessing || {};
    this._scheduledProcessing = null;
    this._filteringInProgress = true;
    this._nextFilteringScheduled = false;
    await this._addSelectors(
      params.stylesheets,
      params.mutations
    );
    this._lastInvocation = performance.now();
    this._filteringInProgress = false;
    if (this._scheduledProcessing) {
      this._scheduleNextFiltering();
    }
  }

  /**
   * Appends new changes to the list of filters for the next time
   * filtering is run.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  _appendScheduledProcessing(stylesheets, mutations) {
    if (!this._scheduledProcessing) {
      // There isn't anything scheduled yet. Make the schedule.
      this._scheduledProcessing = {stylesheets, mutations};
    }
    else if (!stylesheets && !mutations) {
      // The new request was to reprocess everything, and so any
      // previous filters are irrelevant.
      this._scheduledProcessing = {};
    }
    else if (this._scheduledProcessing.stylesheets ||
             this._scheduledProcessing.mutations) {
      // The previous filters are not to filter everything, so the new
      // parameters matter. Push them onto the appropriate lists.
      if (stylesheets) {
        if (!this._scheduledProcessing.stylesheets) {
          this._scheduledProcessing.stylesheets = [];
        }
        this._scheduledProcessing.stylesheets.push(...stylesheets);
      }
      if (mutations) {
        if (!this._scheduledProcessing.mutations) {
          this._scheduledProcessing.mutations = [];
        }
        this._scheduledProcessing.mutations.push(...mutations);
      }
    }
    else {
      // this._scheduledProcessing is already going to recheck
      // everything, so no need to do anything here.
    }
  }

  /**
   * Schedule filtering to be processed in the future, or start
   * processing immediately.
   *
   * If processing is already scheduled, this does nothing.
   */
  _scheduleNextFiltering() {
    if (this._nextFilteringScheduled || this._filteringInProgress) {
      // The next one has already been scheduled. Our new events are
      // on the queue, so nothing more to do.
      return;
    }

    if (this.document.readyState === "loading") {
      // Document isn't fully loaded yet, so schedule our first
      // filtering as soon as that's done.
      this.document.addEventListener(
        "DOMContentLoaded",
        () => this._processFiltering(),
        {once: true}
      );
      this._nextFilteringScheduled = true;
    }
    else if (performance.now() - this._lastInvocation <
             minInvocationInterval) {
      // It hasn't been long enough since our last filter. Set the
      // timeout for when it's time for that.
      setTimeout(
        () => this._processFiltering(),
        minInvocationInterval - (performance.now() - this._lastInvocation)
      );
      this._nextFilteringScheduled = true;
    }
    else {
      // We can actually just start filtering immediately!
      this._processFiltering();
    }
  }

  /**
   * Re-run filtering either immediately or queued.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  queueFiltering(stylesheets, mutations) {
    this._appendScheduledProcessing(stylesheets, mutations);
    this._scheduleNextFiltering();
  }

  _refreshPatternStyles(stylesheet) {
    let allCssRules = this._readCssRules(this.document.styleSheets);
    for (let pattern of this.patterns) {
      pattern.setStyles(allCssRules);
    }
  }

  onLoad(event) {
    let stylesheet = event.target.sheet;
    if (stylesheet) {
      this.queueFiltering([stylesheet]);
    }
  }

  observe(mutations) {
    if (testInfo) {
      // In test mode, filter out any mutations likely done by us
      // (i.e. style="display: none !important"). This makes it easier to
      // observe how the code responds to DOM mutations.
      mutations = mutations.filter(
        ({type, attributeName, target: {style: newValue}, oldValue}) =>
          !(type == "attributes" && attributeName == "style" &&
            newValue.display == "none" &&
            toCSSStyleDeclaration(oldValue).display != "none")
      );

      if (mutations.length == 0) {
        return;
      }
    }

    this.queueFiltering(null, mutations);
  }

  apply(patterns) {
    if (this.patterns) {
      let removedPatterns = [];
      for (let oldPattern of this.patterns) {
        if (!patterns.find(newPattern => newPattern.text == oldPattern.text)) {
          removedPatterns.push(oldPattern);
        }
      }
      let elementsToUnhide = [];
      for (let pattern of removedPatterns) {
        for (let [element, filter] of this.hiddenElements) {
          if (filter == pattern.text) {
            elementsToUnhide.push(element);
          }
        }
      }
      if (elementsToUnhide.length > 0) {
        this._unhideElems(elementsToUnhide);
      }
    }

    this.patterns = [];
    for (let pattern of patterns) {
      let selectors = this.parseSelector(pattern.selector);
      if (selectors != null && selectors.length > 0) {
        this.patterns.push(
          new Pattern(selectors, pattern.text, pattern.remove, pattern.css)
        );
      }
    }

    if (this.patterns.length > 0) {
      this.queueFiltering();

      let attributes = shouldObserveAttributes(this.patterns);
      this.observer.observe(
        this.document,
        {
          childList: true,
          attributes,
          attributeOldValue: attributes && !!testInfo,
          characterData: shouldObserveCharacterData(this.patterns),
          subtree: true
        }
      );
      if (shouldObserveStyles(this.patterns)) {
        let onLoad = this.onLoad.bind(this);
        if (this.document.readyState === "loading") {
          this.document.addEventListener("DOMContentLoaded", onLoad, true);
        }
        this.document.addEventListener("load", onLoad, true);
      }
    }
  }

  disconnect() {
    this.observer.disconnect();
    this._unhideElems(Array.from(this.hiddenElements.keys()));
  }
};


/***/ }),

/***/ 453:
/***/ ((__unused_webpack_module, exports) => {

/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



/**
 * The maximum number of patterns that
 * `{@link module:patterns.compilePatterns compilePatterns()}` will compile
 * into regular expressions.
 * @type {number}
 */
const COMPILE_PATTERNS_MAX = 100;

/**
 * Regular expression used to match the `^` suffix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let separatorRegExp = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/;

let filterToRegExp =
/**
 * Converts filter text into regular expression string
 * @param {string} text as in Filter()
 * @return {string} regular expression representation of filter text
 * @package
 */
exports.filterToRegExp = function filterToRegExp(text) {
  // remove multiple wildcards
  text = text.replace(/\*+/g, "*");

  // remove leading wildcard
  if (text[0] == "*") {
    text = text.substring(1);
  }

  // remove trailing wildcard
  if (text[text.length - 1] == "*") {
    text = text.substring(0, text.length - 1);
  }

  return text
    // remove anchors following separator placeholder
    .replace(/\^\|$/, "^")
    // escape special symbols
    .replace(/\W/g, "\\$&")
    // replace wildcards by .*
    .replace(/\\\*/g, ".*")
    // process separator placeholders (all ANSI characters but alphanumeric
    // characters and _%.-)
    .replace(/\\\^/g, `(?:${separatorRegExp.source}|$)`)
    // process extended anchor at expression start
    .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
    // process anchor at expression start
    .replace(/^\\\|/, "^")
    // process anchor at expression end
    .replace(/\\\|$/, "$");
};

/**
 * Regular expression used to match the `||` prefix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let extendedAnchorRegExp = new RegExp(filterToRegExp("||") + "$");

/**
 * Regular expression for matching a keyword in a filter.
 * @type {RegExp}
 */
let keywordRegExp = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/;

/**
 * Regular expression for matching all keywords in a filter.
 * @type {RegExp}
 */
let allKeywordsRegExp = new RegExp(keywordRegExp, "g");

/**
 * A `CompiledPatterns` object represents the compiled version of multiple URL
 * request patterns. It is returned by
 * `{@link module:patterns.compilePatterns compilePatterns()}`.
 */
class CompiledPatterns {
  /**
   * Creates an object with the given regular expressions for case-sensitive
   * and case-insensitive matching respectively.
   * @param {?RegExp} [caseSensitive]
   * @param {?RegExp} [caseInsensitive]
   * @private
   */
  constructor(caseSensitive, caseInsensitive) {
    this._caseSensitive = caseSensitive;
    this._caseInsensitive = caseInsensitive;
  }

  /**
   * Tests whether the given URL request matches the patterns used to create
   * this object.
   * @param {module:url.URLRequest} request
   * @returns {boolean}
   */
  test(request) {
    return ((this._caseSensitive &&
             this._caseSensitive.test(request.href)) ||
            (this._caseInsensitive &&
             this._caseInsensitive.test(request.lowerCaseHref)));
  }
}

/**
 * Compiles patterns from the given filters into a single
 * `{@link module:patterns~CompiledPatterns CompiledPatterns}` object.
 *
 * @param {module:filterClasses.URLFilter|
 *         Set.<module:filterClasses.URLFilter>} filters
 *   The filters. If the number of filters exceeds
 *   `{@link module:patterns~COMPILE_PATTERNS_MAX COMPILE_PATTERNS_MAX}`, the
 *   function returns `null`.
 *
 * @returns {?module:patterns~CompiledPatterns}
 *
 * @package
 */
exports.compilePatterns = function compilePatterns(filters) {
  let list = Array.isArray(filters) ? filters : [filters];

  // If the number of filters is too large, it may choke especially on low-end
  // platforms. As a precaution, we refuse to compile. Ideally we would check
  // the length of the regular expression source rather than the number of
  // filters, but this is far more straightforward and practical.
  if (list.length > COMPILE_PATTERNS_MAX) {
    return null;
  }

  let caseSensitive = "";
  let caseInsensitive = "";

  for (let filter of filters) {
    let source = filter.urlPattern.regexpSource;

    if (filter.matchCase) {
      caseSensitive += source + "|";
    }
    else {
      caseInsensitive += source + "|";
    }
  }

  let caseSensitiveRegExp = null;
  let caseInsensitiveRegExp = null;

  try {
    if (caseSensitive) {
      caseSensitiveRegExp = new RegExp(caseSensitive.slice(0, -1));
    }

    if (caseInsensitive) {
      caseInsensitiveRegExp = new RegExp(caseInsensitive.slice(0, -1));
    }
  }
  catch (error) {
    // It is possible in theory for the regular expression to be too large
    // despite COMPILE_PATTERNS_MAX
    return null;
  }

  return new CompiledPatterns(caseSensitiveRegExp, caseInsensitiveRegExp);
};

/**
 * Patterns for matching against URLs.
 *
 * Internally, this may be a RegExp or match directly against the
 * pattern for simple literal patterns.
 */
exports.Pattern = class Pattern {
  /**
   * @param {string} pattern pattern that requests URLs should be
   * matched against in filter text notation
   * @param {bool} matchCase `true` if comparisons must be case
   * sensitive
   */
  constructor(pattern, matchCase) {
    this.matchCase = matchCase || false;

    if (!this.matchCase) {
      pattern = pattern.toLowerCase();
    }

    if (pattern.length >= 2 &&
        pattern[0] == "/" &&
        pattern[pattern.length - 1] == "/") {
      // The filter is a regular expression - convert it immediately to
      // catch syntax errors
      pattern = pattern.substring(1, pattern.length - 1);
      this._regexp = new RegExp(pattern);
    }
    else {
      // Patterns like /foo/bar/* exist so that they are not treated as regular
      // expressions. We drop any superfluous wildcards here so our
      // optimizations can kick in.
      pattern = pattern.replace(/^\*+/, "").replace(/\*+$/, "");

      // No need to convert this filter to regular expression yet, do it on
      // demand
      this.pattern = pattern;
    }
  }

  /**
   * Checks whether the pattern is a string of literal characters with
   * no wildcards or any other special characters.
   *
   * If the pattern is prefixed with a `||` or suffixed with a `^` but otherwise
   * contains no special characters, it is still considered to be a literal
   * pattern.
   *
   * @returns {boolean}
   */
  isLiteralPattern() {
    return typeof this.pattern !== "undefined" &&
      !/[*^|]/.test(this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, ""));
  }

  /**
   * Regular expression to be used when testing against this pattern.
   *
   * null if the pattern is matched without using regular expressions.
   * @type {RegExp}
   */
  get regexp() {
    if (typeof this._regexp == "undefined") {
      this._regexp = this.isLiteralPattern() ?
        null : new RegExp(filterToRegExp(this.pattern));
    }
    return this._regexp;
  }

  /**
   * Pattern in regular expression notation. This will have a value
   * even if `regexp` returns null.
   * @type {string}
   */
  get regexpSource() {
    return this._regexp ? this._regexp.source : filterToRegExp(this.pattern);
  }

  /**
   * Checks whether the given URL request matches this filter's pattern.
   * @param {module:url.URLRequest} request The URL request to check.
   * @returns {boolean} `true` if the URL request matches.
   */
  matchesLocation(request) {
    let location = this.matchCase ? request.href : request.lowerCaseHref;
    let regexp = this.regexp;
    if (regexp) {
      return regexp.test(location);
    }

    let pattern = this.pattern;
    let startsWithAnchor = pattern[0] == "|";
    let startsWithExtendedAnchor = startsWithAnchor && pattern[1] == "|";
    let endsWithSeparator = pattern[pattern.length - 1] == "^";
    let endsWithAnchor = !endsWithSeparator &&
        pattern[pattern.length - 1] == "|";

    if (startsWithExtendedAnchor) {
      pattern = pattern.substr(2);
    }
    else if (startsWithAnchor) {
      pattern = pattern.substr(1);
    }

    if (endsWithSeparator || endsWithAnchor) {
      pattern = pattern.slice(0, -1);
    }

    let index = location.indexOf(pattern);

    while (index != -1) {
      // The "||" prefix requires that the text that follows does not start
      // with a forward slash.
      if ((startsWithExtendedAnchor ?
           location[index] != "/" &&
           extendedAnchorRegExp.test(location.substring(0, index)) :
           startsWithAnchor ?
           index == 0 :
           true) &&
          (endsWithSeparator ?
           !location[index + pattern.length] ||
           separatorRegExp.test(location[index + pattern.length]) :
           endsWithAnchor ?
           index == location.length - pattern.length :
           true)) {
        return true;
      }

      if (pattern == "") {
        return true;
      }

      index = location.indexOf(pattern, index + 1);
    }

    return false;
  }

  /**
   * Checks whether the pattern has keywords
   * @returns {boolean}
   */
  hasKeywords() {
    return this.pattern && keywordRegExp.test(this.pattern);
  }

  /**
   * Finds all keywords that could be associated with this pattern
   * @returns {string[]}
   */
  keywordCandidates() {
    if (!this.pattern) {
      return null;
    }
    return this.pattern.toLowerCase().match(allKeywordsRegExp);
  }
};


/***/ }),

/***/ 7795:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* @@package_name - v@@version - @@timestamp */
/* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set sts=2 sw=2 et tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) {
  throw new Error("This script should only be loaded in a browser extension.");
}

if (!(globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)) {
  const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";

  // Wrapping the bulk of this polyfill in a one-time-use function is a minor
  // optimization for Firefox. Since Spidermonkey does not fully parse the
  // contents of a function until the first time it's called, and since it will
  // never actually need to be called, this allows the polyfill to be included
  // in Firefox nearly for free.
  const wrapAPIs = extensionAPIs => {
    // NOTE: apiMetadata is associated to the content of the api-metadata.json file
    // at build time by replacing the following "include" with the content of the
    // JSON file.
    const apiMetadata = __webpack_require__(9438);

    if (Object.keys(apiMetadata).length === 0) {
      throw new Error("api-metadata.json has not been included in browser-polyfill");
    }

    /**
     * A WeakMap subclass which creates and stores a value for any key which does
     * not exist when accessed, but behaves exactly as an ordinary WeakMap
     * otherwise.
     *
     * @param {function} createItem
     *        A function which will be called in order to create the value for any
     *        key which does not exist, the first time it is accessed. The
     *        function receives, as its only argument, the key being created.
     */
    class DefaultWeakMap extends WeakMap {
      constructor(createItem, items = undefined) {
        super(items);
        this.createItem = createItem;
      }

      get(key) {
        if (!this.has(key)) {
          this.set(key, this.createItem(key));
        }

        return super.get(key);
      }
    }

    /**
     * Returns true if the given object is an object with a `then` method, and can
     * therefore be assumed to behave as a Promise.
     *
     * @param {*} value The value to test.
     * @returns {boolean} True if the value is thenable.
     */
    const isThenable = value => {
      return value && typeof value === "object" && typeof value.then === "function";
    };

    /**
     * Creates and returns a function which, when called, will resolve or reject
     * the given promise based on how it is called:
     *
     * - If, when called, `chrome.runtime.lastError` contains a non-null object,
     *   the promise is rejected with that value.
     * - If the function is called with exactly one argument, the promise is
     *   resolved to that value.
     * - Otherwise, the promise is resolved to an array containing all of the
     *   function's arguments.
     *
     * @param {object} promise
     *        An object containing the resolution and rejection functions of a
     *        promise.
     * @param {function} promise.resolve
     *        The promise's resolution function.
     * @param {function} promise.reject
     *        The promise's rejection function.
     * @param {object} metadata
     *        Metadata about the wrapped method which has created the callback.
     * @param {boolean} metadata.singleCallbackArg
     *        Whether or not the promise is resolved with only the first
     *        argument of the callback, alternatively an array of all the
     *        callback arguments is resolved. By default, if the callback
     *        function is invoked with only a single argument, that will be
     *        resolved to the promise, while all arguments will be resolved as
     *        an array if multiple are given.
     *
     * @returns {function}
     *        The generated callback function.
     */
    const makeCallback = (promise, metadata) => {
      // In case we encounter a browser error in the callback function, we don't
      // want to lose the stack trace leading up to this point. For that reason,
      // we need to instantiate the error outside the callback function.
      let error = new Error();
      return (...callbackArgs) => {
        if (extensionAPIs.runtime.lastError) {
          error.message = extensionAPIs.runtime.lastError.message;
          promise.reject(error);
        } else if (metadata.singleCallbackArg ||
                   (callbackArgs.length <= 1 && metadata.singleCallbackArg !== false)) {
          promise.resolve(callbackArgs[0]);
        } else {
          promise.resolve(callbackArgs);
        }
      };
    };

    const pluralizeArguments = (numArgs) => numArgs == 1 ? "argument" : "arguments";

    /**
     * Creates a wrapper function for a method with the given name and metadata.
     *
     * @param {string} name
     *        The name of the method which is being wrapped.
     * @param {object} metadata
     *        Metadata about the method being wrapped.
     * @param {integer} metadata.minArgs
     *        The minimum number of arguments which must be passed to the
     *        function. If called with fewer than this number of arguments, the
     *        wrapper will raise an exception.
     * @param {integer} metadata.maxArgs
     *        The maximum number of arguments which may be passed to the
     *        function. If called with more than this number of arguments, the
     *        wrapper will raise an exception.
     * @param {boolean} metadata.singleCallbackArg
     *        Whether or not the promise is resolved with only the first
     *        argument of the callback, alternatively an array of all the
     *        callback arguments is resolved. By default, if the callback
     *        function is invoked with only a single argument, that will be
     *        resolved to the promise, while all arguments will be resolved as
     *        an array if multiple are given.
     *
     * @returns {function(object, ...*)}
     *       The generated wrapper function.
     */
    const wrapAsyncFunction = (name, metadata) => {
      return function asyncFunctionWrapper(target, ...args) {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          if (metadata.fallbackToNoCallback) {
            // This API method has currently no callback on Chrome, but it return a promise on Firefox,
            // and so the polyfill will try to call it with a callback first, and it will fallback
            // to not passing the callback if the first call fails.
            try {
              target[name](...args, makeCallback({resolve, reject}, metadata));
            } catch (cbError) {
              console.warn(`${name} API method doesn't seem to support the callback parameter, ` +
                           "falling back to call it without a callback: ", cbError);

              target[name](...args);

              // Update the API method metadata, so that the next API calls will not try to
              // use the unsupported callback anymore.
              metadata.fallbackToNoCallback = false;
              metadata.noCallback = true;

              resolve();
            }
          } else if (metadata.noCallback) {
            target[name](...args);
            resolve();
          } else {
            target[name](...args, makeCallback({resolve, reject}, metadata));
          }
        });
      };
    };

    /**
     * Wraps an existing method of the target object, so that calls to it are
     * intercepted by the given wrapper function. The wrapper function receives,
     * as its first argument, the original `target` object, followed by each of
     * the arguments passed to the original method.
     *
     * @param {object} target
     *        The original target object that the wrapped method belongs to.
     * @param {function} method
     *        The method being wrapped. This is used as the target of the Proxy
     *        object which is created to wrap the method.
     * @param {function} wrapper
     *        The wrapper function which is called in place of a direct invocation
     *        of the wrapped method.
     *
     * @returns {Proxy<function>}
     *        A Proxy object for the given method, which invokes the given wrapper
     *        method in its place.
     */
    const wrapMethod = (target, method, wrapper) => {
      return new Proxy(method, {
        apply(targetMethod, thisObj, args) {
          return wrapper.call(thisObj, target, ...args);
        },
      });
    };

    let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);

    /**
     * Wraps an object in a Proxy which intercepts and wraps certain methods
     * based on the given `wrappers` and `metadata` objects.
     *
     * @param {object} target
     *        The target object to wrap.
     *
     * @param {object} [wrappers = {}]
     *        An object tree containing wrapper functions for special cases. Any
     *        function present in this object tree is called in place of the
     *        method in the same location in the `target` object tree. These
     *        wrapper methods are invoked as described in {@see wrapMethod}.
     *
     * @param {object} [metadata = {}]
     *        An object tree containing metadata used to automatically generate
     *        Promise-based wrapper functions for asynchronous. Any function in
     *        the `target` object tree which has a corresponding metadata object
     *        in the same location in the `metadata` tree is replaced with an
     *        automatically-generated wrapper function, as described in
     *        {@see wrapAsyncFunction}
     *
     * @returns {Proxy<object>}
     */
    const wrapObject = (target, wrappers = {}, metadata = {}) => {
      let cache = Object.create(null);
      let handlers = {
        has(proxyTarget, prop) {
          return prop in target || prop in cache;
        },

        get(proxyTarget, prop, receiver) {
          if (prop in cache) {
            return cache[prop];
          }

          if (!(prop in target)) {
            return undefined;
          }

          let value = target[prop];

          if (typeof value === "function") {
            // This is a method on the underlying object. Check if we need to do
            // any wrapping.

            if (typeof wrappers[prop] === "function") {
              // We have a special-case wrapper for this method.
              value = wrapMethod(target, target[prop], wrappers[prop]);
            } else if (hasOwnProperty(metadata, prop)) {
              // This is an async method that we have metadata for. Create a
              // Promise wrapper for it.
              let wrapper = wrapAsyncFunction(prop, metadata[prop]);
              value = wrapMethod(target, target[prop], wrapper);
            } else {
              // This is a method that we don't know or care about. Return the
              // original method, bound to the underlying object.
              value = value.bind(target);
            }
          } else if (typeof value === "object" && value !== null &&
                     (hasOwnProperty(wrappers, prop) ||
                      hasOwnProperty(metadata, prop))) {
            // This is an object that we need to do some wrapping for the children
            // of. Create a sub-object wrapper for it with the appropriate child
            // metadata.
            value = wrapObject(value, wrappers[prop], metadata[prop]);
          } else if (hasOwnProperty(metadata, "*")) {
            // Wrap all properties in * namespace.
            value = wrapObject(value, wrappers[prop], metadata["*"]);
          } else {
            // We don't need to do any wrapping for this property,
            // so just forward all access to the underlying object.
            Object.defineProperty(cache, prop, {
              configurable: true,
              enumerable: true,
              get() {
                return target[prop];
              },
              set(value) {
                target[prop] = value;
              },
            });

            return value;
          }

          cache[prop] = value;
          return value;
        },

        set(proxyTarget, prop, value, receiver) {
          if (prop in cache) {
            cache[prop] = value;
          } else {
            target[prop] = value;
          }
          return true;
        },

        defineProperty(proxyTarget, prop, desc) {
          return Reflect.defineProperty(cache, prop, desc);
        },

        deleteProperty(proxyTarget, prop) {
          return Reflect.deleteProperty(cache, prop);
        },
      };

      // Per contract of the Proxy API, the "get" proxy handler must return the
      // original value of the target if that value is declared read-only and
      // non-configurable. For this reason, we create an object with the
      // prototype set to `target` instead of using `target` directly.
      // Otherwise we cannot return a custom object for APIs that
      // are declared read-only and non-configurable, such as `chrome.devtools`.
      //
      // The proxy handlers themselves will still use the original `target`
      // instead of the `proxyTarget`, so that the methods and properties are
      // dereferenced via the original targets.
      let proxyTarget = Object.create(target);
      return new Proxy(proxyTarget, handlers);
    };

    /**
     * Creates a set of wrapper functions for an event object, which handles
     * wrapping of listener functions that those messages are passed.
     *
     * A single wrapper is created for each listener function, and stored in a
     * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
     * retrieve the original wrapper, so that  attempts to remove a
     * previously-added listener work as expected.
     *
     * @param {DefaultWeakMap<function, function>} wrapperMap
     *        A DefaultWeakMap object which will create the appropriate wrapper
     *        for a given listener function when one does not exist, and retrieve
     *        an existing one when it does.
     *
     * @returns {object}
     */
    const wrapEvent = wrapperMap => ({
      addListener(target, listener, ...args) {
        target.addListener(wrapperMap.get(listener), ...args);
      },

      hasListener(target, listener) {
        return target.hasListener(wrapperMap.get(listener));
      },

      removeListener(target, listener) {
        target.removeListener(wrapperMap.get(listener));
      },
    });

    const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
      if (typeof listener !== "function") {
        return listener;
      }

      /**
       * Wraps an onRequestFinished listener function so that it will return a
       * `getContent()` property which returns a `Promise` rather than using a
       * callback API.
       *
       * @param {object} req
       *        The HAR entry object representing the network request.
       */
      return function onRequestFinished(req) {
        const wrappedReq = wrapObject(req, {} /* wrappers */, {
          getContent: {
            minArgs: 0,
            maxArgs: 0,
          },
        });
        listener(wrappedReq);
      };
    });

    const onMessageWrappers = new DefaultWeakMap(listener => {
      if (typeof listener !== "function") {
        return listener;
      }

      /**
       * Wraps a message listener function so that it may send responses based on
       * its return value, rather than by returning a sentinel value and calling a
       * callback. If the listener function returns a Promise, the response is
       * sent when the promise either resolves or rejects.
       *
       * @param {*} message
       *        The message sent by the other end of the channel.
       * @param {object} sender
       *        Details about the sender of the message.
       * @param {function(*)} sendResponse
       *        A callback which, when called with an arbitrary argument, sends
       *        that value as a response.
       * @returns {boolean}
       *        True if the wrapped listener returned a Promise, which will later
       *        yield a response. False otherwise.
       */
      return function onMessage(message, sender, sendResponse) {
        let didCallSendResponse = false;

        let wrappedSendResponse;
        let sendResponsePromise = new Promise(resolve => {
          wrappedSendResponse = function(response) {
            didCallSendResponse = true;
            resolve(response);
          };
        });

        let result;
        try {
          result = listener(message, sender, wrappedSendResponse);
        } catch (err) {
          result = Promise.reject(err);
        }

        const isResultThenable = result !== true && isThenable(result);

        // If the listener didn't returned true or a Promise, or called
        // wrappedSendResponse synchronously, we can exit earlier
        // because there will be no response sent from this listener.
        if (result !== true && !isResultThenable && !didCallSendResponse) {
          return false;
        }

        // A small helper to send the message if the promise resolves
        // and an error if the promise rejects (a wrapped sendMessage has
        // to translate the message into a resolved promise or a rejected
        // promise).
        const sendPromisedResult = (promise) => {
          promise.then(msg => {
            // send the message value.
            sendResponse(msg);
          }, error => {
            // Send a JSON representation of the error if the rejected value
            // is an instance of error, or the object itself otherwise.
            let message;
            if (error && (error instanceof Error ||
                typeof error.message === "string")) {
              message = error.message;
            } else {
              message = "An unexpected error occurred";
            }

            sendResponse({
              __mozWebExtensionPolyfillReject__: true,
              message,
            });
          }).catch(err => {
            // Print an error on the console if unable to send the response.
            console.error("Failed to send onMessage rejected reply", err);
          });
        };

        // If the listener returned a Promise, send the resolved value as a
        // result, otherwise wait the promise related to the wrappedSendResponse
        // callback to resolve and send it as a response.
        if (isResultThenable) {
          sendPromisedResult(result);
        } else {
          sendPromisedResult(sendResponsePromise);
        }

        // Let Chrome know that the listener is replying.
        return true;
      };
    });

    const wrappedSendMessageCallback = ({reject, resolve}, reply) => {
      if (extensionAPIs.runtime.lastError) {
        // Detect when none of the listeners replied to the sendMessage call and resolve
        // the promise to undefined as in Firefox.
        // See https://github.com/mozilla/webextension-polyfill/issues/130
        if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
          resolve();
        } else {
          reject(new Error(extensionAPIs.runtime.lastError.message));
        }
      } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
        // Convert back the JSON representation of the error into
        // an Error instance.
        reject(new Error(reply.message));
      } else {
        resolve(reply);
      }
    };

    const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
      if (args.length < metadata.minArgs) {
        throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
      }

      if (args.length > metadata.maxArgs) {
        throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
      }

      return new Promise((resolve, reject) => {
        const wrappedCb = wrappedSendMessageCallback.bind(null, {resolve, reject});
        args.push(wrappedCb);
        apiNamespaceObj.sendMessage(...args);
      });
    };

    const staticWrappers = {
      devtools: {
        network: {
          onRequestFinished: wrapEvent(onRequestFinishedWrappers),
        },
      },
      runtime: {
        onMessage: wrapEvent(onMessageWrappers),
        onMessageExternal: wrapEvent(onMessageWrappers),
        sendMessage: wrappedSendMessage.bind(null, "sendMessage", {minArgs: 1, maxArgs: 3}),
      },
      tabs: {
        sendMessage: wrappedSendMessage.bind(null, "sendMessage", {minArgs: 2, maxArgs: 3}),
      },
    };
    const settingMetadata = {
      clear: {minArgs: 1, maxArgs: 1},
      get: {minArgs: 1, maxArgs: 1},
      set: {minArgs: 1, maxArgs: 1},
    };
    apiMetadata.privacy = {
      network: {"*": settingMetadata},
      services: {"*": settingMetadata},
      websites: {"*": settingMetadata},
    };

    return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
  };

  // The build process adds a UMD wrapper around this file, which makes the
  // `module` variable available.
  module.exports = wrapAPIs(chrome);
} else {
  module.exports = globalThis.browser;
}


/***/ }),

/***/ 9438:
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"alarms":{"clear":{"minArgs":0,"maxArgs":1},"clearAll":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0}},"bookmarks":{"create":{"minArgs":1,"maxArgs":1},"get":{"minArgs":1,"maxArgs":1},"getChildren":{"minArgs":1,"maxArgs":1},"getRecent":{"minArgs":1,"maxArgs":1},"getSubTree":{"minArgs":1,"maxArgs":1},"getTree":{"minArgs":0,"maxArgs":0},"move":{"minArgs":2,"maxArgs":2},"remove":{"minArgs":1,"maxArgs":1},"removeTree":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1},"update":{"minArgs":2,"maxArgs":2}},"browserAction":{"disable":{"minArgs":0,"maxArgs":1,"fallbackToNoCallback":true},"enable":{"minArgs":0,"maxArgs":1,"fallbackToNoCallback":true},"getBadgeBackgroundColor":{"minArgs":1,"maxArgs":1},"getBadgeText":{"minArgs":1,"maxArgs":1},"getPopup":{"minArgs":1,"maxArgs":1},"getTitle":{"minArgs":1,"maxArgs":1},"openPopup":{"minArgs":0,"maxArgs":0},"setBadgeBackgroundColor":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setBadgeText":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setIcon":{"minArgs":1,"maxArgs":1},"setPopup":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setTitle":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"browsingData":{"remove":{"minArgs":2,"maxArgs":2},"removeCache":{"minArgs":1,"maxArgs":1},"removeCookies":{"minArgs":1,"maxArgs":1},"removeDownloads":{"minArgs":1,"maxArgs":1},"removeFormData":{"minArgs":1,"maxArgs":1},"removeHistory":{"minArgs":1,"maxArgs":1},"removeLocalStorage":{"minArgs":1,"maxArgs":1},"removePasswords":{"minArgs":1,"maxArgs":1},"removePluginData":{"minArgs":1,"maxArgs":1},"settings":{"minArgs":0,"maxArgs":0}},"commands":{"getAll":{"minArgs":0,"maxArgs":0}},"contextMenus":{"remove":{"minArgs":1,"maxArgs":1},"removeAll":{"minArgs":0,"maxArgs":0},"update":{"minArgs":2,"maxArgs":2}},"cookies":{"get":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":1,"maxArgs":1},"getAllCookieStores":{"minArgs":0,"maxArgs":0},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}},"devtools":{"inspectedWindow":{"eval":{"minArgs":1,"maxArgs":2,"singleCallbackArg":false}},"panels":{"create":{"minArgs":3,"maxArgs":3,"singleCallbackArg":true},"elements":{"createSidebarPane":{"minArgs":1,"maxArgs":1}}}},"downloads":{"cancel":{"minArgs":1,"maxArgs":1},"download":{"minArgs":1,"maxArgs":1},"erase":{"minArgs":1,"maxArgs":1},"getFileIcon":{"minArgs":1,"maxArgs":2},"open":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"pause":{"minArgs":1,"maxArgs":1},"removeFile":{"minArgs":1,"maxArgs":1},"resume":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1},"show":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"extension":{"isAllowedFileSchemeAccess":{"minArgs":0,"maxArgs":0},"isAllowedIncognitoAccess":{"minArgs":0,"maxArgs":0}},"history":{"addUrl":{"minArgs":1,"maxArgs":1},"deleteAll":{"minArgs":0,"maxArgs":0},"deleteRange":{"minArgs":1,"maxArgs":1},"deleteUrl":{"minArgs":1,"maxArgs":1},"getVisits":{"minArgs":1,"maxArgs":1},"search":{"minArgs":1,"maxArgs":1}},"i18n":{"detectLanguage":{"minArgs":1,"maxArgs":1},"getAcceptLanguages":{"minArgs":0,"maxArgs":0}},"identity":{"launchWebAuthFlow":{"minArgs":1,"maxArgs":1}},"idle":{"queryState":{"minArgs":1,"maxArgs":1}},"management":{"get":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0},"getSelf":{"minArgs":0,"maxArgs":0},"setEnabled":{"minArgs":2,"maxArgs":2},"uninstallSelf":{"minArgs":0,"maxArgs":1}},"notifications":{"clear":{"minArgs":1,"maxArgs":1},"create":{"minArgs":1,"maxArgs":2},"getAll":{"minArgs":0,"maxArgs":0},"getPermissionLevel":{"minArgs":0,"maxArgs":0},"update":{"minArgs":2,"maxArgs":2}},"pageAction":{"getPopup":{"minArgs":1,"maxArgs":1},"getTitle":{"minArgs":1,"maxArgs":1},"hide":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setIcon":{"minArgs":1,"maxArgs":1},"setPopup":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"setTitle":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true},"show":{"minArgs":1,"maxArgs":1,"fallbackToNoCallback":true}},"permissions":{"contains":{"minArgs":1,"maxArgs":1},"getAll":{"minArgs":0,"maxArgs":0},"remove":{"minArgs":1,"maxArgs":1},"request":{"minArgs":1,"maxArgs":1}},"runtime":{"getBackgroundPage":{"minArgs":0,"maxArgs":0},"getPlatformInfo":{"minArgs":0,"maxArgs":0},"openOptionsPage":{"minArgs":0,"maxArgs":0},"requestUpdateCheck":{"minArgs":0,"maxArgs":0},"sendMessage":{"minArgs":1,"maxArgs":3},"sendNativeMessage":{"minArgs":2,"maxArgs":2},"setUninstallURL":{"minArgs":1,"maxArgs":1}},"sessions":{"getDevices":{"minArgs":0,"maxArgs":1},"getRecentlyClosed":{"minArgs":0,"maxArgs":1},"restore":{"minArgs":0,"maxArgs":1}},"storage":{"local":{"clear":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}},"managed":{"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1}},"sync":{"clear":{"minArgs":0,"maxArgs":0},"get":{"minArgs":0,"maxArgs":1},"getBytesInUse":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"set":{"minArgs":1,"maxArgs":1}}},"tabs":{"captureVisibleTab":{"minArgs":0,"maxArgs":2},"create":{"minArgs":1,"maxArgs":1},"detectLanguage":{"minArgs":0,"maxArgs":1},"discard":{"minArgs":0,"maxArgs":1},"duplicate":{"minArgs":1,"maxArgs":1},"executeScript":{"minArgs":1,"maxArgs":2},"get":{"minArgs":1,"maxArgs":1},"getCurrent":{"minArgs":0,"maxArgs":0},"getZoom":{"minArgs":0,"maxArgs":1},"getZoomSettings":{"minArgs":0,"maxArgs":1},"goBack":{"minArgs":0,"maxArgs":1},"goForward":{"minArgs":0,"maxArgs":1},"highlight":{"minArgs":1,"maxArgs":1},"insertCSS":{"minArgs":1,"maxArgs":2},"move":{"minArgs":2,"maxArgs":2},"query":{"minArgs":1,"maxArgs":1},"reload":{"minArgs":0,"maxArgs":2},"remove":{"minArgs":1,"maxArgs":1},"removeCSS":{"minArgs":1,"maxArgs":2},"sendMessage":{"minArgs":2,"maxArgs":3},"setZoom":{"minArgs":1,"maxArgs":2},"setZoomSettings":{"minArgs":1,"maxArgs":2},"update":{"minArgs":1,"maxArgs":2}},"topSites":{"get":{"minArgs":0,"maxArgs":0}},"webNavigation":{"getAllFrames":{"minArgs":1,"maxArgs":1},"getFrame":{"minArgs":1,"maxArgs":1}},"webRequest":{"handlerBehaviorChanged":{"minArgs":0,"maxArgs":0}},"windows":{"create":{"minArgs":0,"maxArgs":1},"get":{"minArgs":1,"maxArgs":2},"getAll":{"minArgs":0,"maxArgs":1},"getCurrent":{"minArgs":0,"maxArgs":1},"getLastFocused":{"minArgs":0,"maxArgs":1},"remove":{"minArgs":1,"maxArgs":1},"update":{"minArgs":2,"maxArgs":2}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ../../vendor/webextension-polyfill/src/browser-polyfill.js
var browser_polyfill = __webpack_require__(7795);
// EXTERNAL MODULE: ./adblockpluscore/lib/content/elemHideEmulation.js
var elemHideEmulation = __webpack_require__(1267);
;// ./src/all/errors.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

const ERROR_NO_CONNECTION = "Could not establish connection. " +
      "Receiving end does not exist.";
const ERROR_CLOSED_CONNECTION = "A listener indicated an asynchronous " +
      "response by returning true, but the message channel closed before a " +
      "response was received";
// https://bugzilla.mozilla.org/show_bug.cgi?id=1578697
const ERROR_MANAGER_DISCONNECTED = "Message manager disconnected";

/**
 * Reconstructs an error from a serializable error object
 *
 * @param {string} errorData - Error object
 *
 * @returns {Error} error
 */
function fromSerializableError(errorData) {
  const error = new Error(errorData.message);
  error.cause = errorData.cause;
  error.name = errorData.name;
  error.stack = errorData.stack;

  return error;
}

/**
 * Filters out `browser.runtime.sendMessage` errors to do with the receiving end
 * no longer existing.
 *
 * @param {Promise} promise The promise that should have "no connection" errors
 *   ignored. Generally this would be the promise returned by
 *   `browser.runtime.sendMessage`.
 * @return {Promise} The same promise, but will resolve with `undefined` instead
 *   of rejecting if the receiving end no longer exists.
 */
function ignoreNoConnectionError(promise) {
  return promise.catch(error => {
    if (typeof error == "object" &&
        (error.message == ERROR_NO_CONNECTION ||
         error.message == ERROR_CLOSED_CONNECTION ||
         error.message == ERROR_MANAGER_DISCONNECTED)) {
      return;
    }

    throw error;
  });
}

/**
 * Creates serializable error object from given error
 *
 * @param {Error} error - Error
 *
 * @returns {string} serializable error object
 */
function toSerializableError(error) {
  return {
    cause: error.cause instanceof Error ?
      toSerializableError(error.cause) :
      error.cause,
    message: error.message,
    name: error.name,
    stack: error.stack
  };
}

;// ./src/content/element-collapsing.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let collapsedSelectors = new Set();
let observers = new WeakMap();

function getURLFromElement(element) {
  if (element.localName == "object") {
    if (element.data) {
      return element.data;
    }

    for (let child of element.children) {
      if (child.localName == "param" && child.name == "movie" && child.value) {
        return new URL(child.value, document.baseURI).href;
      }
    }

    return null;
  }

  return element.currentSrc || element.src;
}

function getSelectorForBlockedElement(element) {
  // Setting the "display" CSS property to "none" doesn't have any effect on
  // <frame> elements (in framesets). So we have to hide it inline through
  // the "visibility" CSS property.
  if (element.localName == "frame") {
    return null;
  }

  // If the <video> or <audio> element contains any <source> children,
  // we cannot address it in CSS by the source URL; in that case we
  // don't "collapse" it using a CSS selector but rather hide it directly by
  // setting the style="..." attribute.
  if (element.localName == "video" || element.localName == "audio") {
    for (let child of element.children) {
      if (child.localName == "source") {
        return null;
      }
    }
  }

  let selector = "";
  for (let attr of ["src", "srcset"]) {
    let value = element.getAttribute(attr);
    if (value && attr in element) {
      selector += "[" + attr + "=" + CSS.escape(value) + "]";
    }
  }

  return selector ? element.localName + selector : null;
}

function hideElement(element, properties) {
  let {style} = element;

  if (!properties) {
    if (element.localName == "frame") {
      properties = [["visibility", "hidden"]];
    }
    else {
      properties = [["display", "none"]];
    }
  }

  for (let [key, value] of properties) {
    style.setProperty(key, value, "important");
  }

  if (observers.has(element)) {
    observers.get(element).disconnect();
  }

  let observer = new MutationObserver(() => {
    for (let [key, value] of properties) {
      if (style.getPropertyValue(key) != value ||
          style.getPropertyPriority(key) != "important") {
        style.setProperty(key, value, "important");
      }
    }
  });
  observer.observe(
    element, {
      attributes: true,
      attributeFilter: ["style"]
    }
  );
  observers.set(element, observer);
}

function unhideElement(element) {
  let observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }

  let property = element.localName == "frame" ? "visibility" : "display";
  element.style.removeProperty(property);
}

function collapseElement(element) {
  let selector = getSelectorForBlockedElement(element);
  if (!selector) {
    hideElement(element);
    return;
  }

  if (!collapsedSelectors.has(selector)) {
    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({
        type: "ewe:inject-css",
        selector
      })
    );
    collapsedSelectors.add(selector);
  }
}

function hideInAboutBlankFrames(selector, urls) {
  // Resources (e.g. images) loaded into about:blank frames
  // are (sometimes) loaded with the frameId of the main_frame.
  for (let frame of document.querySelectorAll("iframe[src='about:blank']")) {
    if (!frame.contentDocument) {
      continue;
    }

    for (let element of frame.contentDocument.querySelectorAll(selector)) {
      // Use hideElement, because we don't have the correct frameId
      // for the "ewe:inject-css" message.
      if (urls.has(getURLFromElement(element))) {
        hideElement(element);
      }
    }
  }
}

function startElementCollapsing() {
  let deferred = null;

  browser_polyfill.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type != "ewe:collapse") {
      return;
    }

    if (document.readyState == "loading") {
      if (!deferred) {
        deferred = new Map();
        document.addEventListener("DOMContentLoaded", () => {
          // Under some conditions a hostile script could try to trigger
          // the event again. Since we set deferred to `null`, then
          // we assume that we should just return instead of throwing
          // a TypeError.
          if (!deferred) {
            return;
          }

          for (let [selector, urls] of deferred) {
            for (let element of document.querySelectorAll(selector)) {
              if (urls.has(getURLFromElement(element))) {
                collapseElement(element);
              }
            }

            hideInAboutBlankFrames(selector, urls);
          }

          deferred = null;
        });
      }

      let urls = deferred.get(message.selector) || new Set();
      deferred.set(message.selector, urls);
      urls.add(message.url);
    }
    else {
      for (let element of document.querySelectorAll(message.selector)) {
        if (getURLFromElement(element) == message.url) {
          collapseElement(element);
        }
      }

      hideInAboutBlankFrames(message.selector, new Set([message.url]));
    }
    return false;
  });
}

;// ./src/content/allowlisting.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const MAX_ERROR_THRESHOLD = 30;
const MAX_QUEUED_EVENTS = 20;
const EVENT_INTERVAL_MS = 100;

let errorCount = 0;
let eventProcessingInterval = null;
let eventProcessingInProgress = false;
let eventQueue = [];

function isEventTrusted(event) {
  return Object.getPrototypeOf(event) === CustomEvent.prototype &&
    !Object.hasOwnProperty.call(event, "detail");
}

async function allowlistDomain(event) {
  if (!isEventTrusted(event)) {
    return false;
  }

  return ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({
      type: "ewe:allowlist-page",
      timestamp: event.detail.timestamp,
      signature: event.detail.signature,
      options: event.detail.options
    })
  );
}

async function processNextEvent() {
  if (eventProcessingInProgress) {
    return;
  }

  try {
    eventProcessingInProgress = true;
    let event = eventQueue.shift();
    if (event) {
      try {
        let allowlistingResult = await allowlistDomain(event);
        if (allowlistingResult === true) {
          document.dispatchEvent(new Event("domain_allowlisting_success"));
          stopOneClickAllowlisting();
        }
        else {
          throw new Error("Domain allowlisting rejected");
        }
      }
      catch (e) {
        errorCount++;
        if (errorCount >= MAX_ERROR_THRESHOLD) {
          stopOneClickAllowlisting();
        }
      }
    }

    if (!eventQueue.length) {
      stopProcessingInterval();
    }
  }
  finally {
    eventProcessingInProgress = false;
  }
}

function onDomainAllowlistingRequest(event) {
  if (eventQueue.length >= MAX_QUEUED_EVENTS) {
    return;
  }

  eventQueue.push(event);
  startProcessingInterval();
}

function startProcessingInterval() {
  if (!eventProcessingInterval) {
    processNextEvent();
    eventProcessingInterval = setInterval(processNextEvent, EVENT_INTERVAL_MS);
  }
}

function stopProcessingInterval() {
  clearInterval(eventProcessingInterval);
  eventProcessingInterval = null;
}

function stopOneClickAllowlisting() {
  document.removeEventListener("domain_allowlisting_request",
                               onDomainAllowlistingRequest, true);
  eventQueue = [];
  stopProcessingInterval();
}

function startOneClickAllowlisting() {
  document.addEventListener("domain_allowlisting_request",
                            onDomainAllowlistingRequest, true);
}

;// ./src/content/element-hiding-tracer.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => this.trace());
    }
    else {
      this.trace();
    }
  }

  log(filters, selectors = []) {
    ignoreNoConnectionError(browser_polyfill.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      try {
        if (document.querySelector(selector)) {
          this.selectors.delete(selector);
          if (filter) {
            filters.push(filter);
          }
          else {
            selectors.push(selector);
          }
        }
      }
      catch (e) {
        console.error(e.toString());
      }
    }

    if (filters.length > 0 || selectors.length > 0) {
      this.log(filters, selectors);
    }

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }

  disconnect() {
    this.observer.disconnect();
  }
}

;// ./src/content/subscribe-links.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const ALLOWED_DOMAINS = new Set([
  "abpchina.org",
  "abpindo.blogspot.com",
  "abpvn.com",
  "adblock.ee",
  "adblock.gardar.net",
  "adblockplus.me",
  "adblockplus.org",
  "abptestpages.org",
  "commentcamarche.net",
  "droit-finances.commentcamarche.com",
  "easylist.to",
  "eyeo.com",
  "fanboy.co.nz",
  "filterlists.com",
  "forums.lanik.us",
  "gitee.com",
  "gitee.io",
  "github.com",
  "github.io",
  "gitlab.com",
  "gitlab.io",
  "gurud.ee",
  "hugolescargot.com",
  "i-dont-care-about-cookies.eu",
  "journaldesfemmes.fr",
  "journaldunet.com",
  "linternaute.com",
  "spam404.com",
  "stanev.org",
  "void.gr",
  "xfiles.noads.it",
  "zoso.ro"
]);

function isDomainAllowed(domain) {
  if (domain.endsWith(".")) {
    domain = domain.substring(0, domain.length - 1);
  }

  while (true) {
    if (ALLOWED_DOMAINS.has(domain)) {
      return true;
    }
    let index = domain.indexOf(".");
    if (index == -1) {
      return false;
    }
    domain = domain.substr(index + 1);
  }
}

function subscribeLinksEnabled(url) {
  let {protocol, hostname} = new URL(url);
  return hostname == "localhost" ||
    protocol == "https:" && isDomainAllowed(hostname);
}

function handleSubscribeLinks() {
  document.addEventListener("click", event => {
    if (event.button == 2 || !event.isTrusted) {
      return;
    }

    let link = event.target;
    while (!(link instanceof HTMLAnchorElement)) {
      link = link.parentNode;

      if (!link) {
        return;
      }
    }

    let queryString = null;
    if (link.protocol == "http:" || link.protocol == "https:") {
      if (link.host == "subscribe.adblockplus.org" && link.pathname == "/") {
        queryString = link.search.substr(1);
      }
    }
    else {
      // Firefox doesn't seem to populate the "search" property for
      // links with non-standard URL schemes so we need to extract the query
      // string manually.
      let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(link.href);
      if (match) {
        queryString = match[1];
      }
    }

    if (!queryString) {
      return;
    }

    let title = null;
    let url = null;
    for (let param of queryString.split("&")) {
      let parts = param.split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1])) {
        continue;
      }
      switch (parts[0]) {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url) {
      return;
    }

    if (!title) {
      title = url;
    }

    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url)) {
      return;
    }

    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({type: "ewe:subscribe-link-clicked",
                                   title, url})
    );

    event.preventDefault();
    event.stopPropagation();
  }, true);
}

;// ./src/content/cdp-session.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let isActive = false;

function notifyActive() {
  if (isActive) {
    ignoreNoConnectionError(
      browser_polyfill.runtime.sendMessage({
        type: "ewe:cdp-session-active"
      })
    );
    isActive = false;
  }
  scheduleCheckActive();
}

function scheduleCheckActive() {
  setTimeout(notifyActive, 1000);
}

function markActive() {
  isActive = true;
}

function startNotifyActive() {
  scheduleCheckActive();

  document.addEventListener("scroll", markActive, true);
  document.addEventListener("click", markActive);
  document.addEventListener("keypress", markActive, true);
}

;// ../../node_modules/uuid/dist/esm-browser/native.js
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const esm_browser_native = ({
  randomUUID
});
;// ../../node_modules/uuid/dist/esm-browser/rng.js
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}
;// ../../node_modules/uuid/dist/esm-browser/stringify.js

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const esm_browser_stringify = ((/* unused pure expression or super */ null && (stringify)));
;// ../../node_modules/uuid/dist/esm-browser/v4.js




function v4(options, buf, offset) {
  if (esm_browser_native.randomUUID && !buf && !options) {
    return esm_browser_native.randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return unsafeStringify(rnds);
}

/* harmony default export */ const esm_browser_v4 = (v4);
;// ./src/content/blockthrough-tag.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */






let sessionId = null;

function onBTAADetectionEvent(event) {
  if (!sessionId) {
    sessionId = esm_browser_v4();
  }

  ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({
      type: "ewe:blockthrough-acceptable-ads-detection-event",
      details: {
        ab: event.detail.ab,
        acceptable: event.detail.acceptable,
        sessionId
      }
    })
  );
}

function startWatchingBlockthroughTag() {
  window.addEventListener("BTAADetection", onBTAADetectionEvent);
}

;// ./src/content/index.js
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */













let tracer;
let content_elemHideEmulation;

async function initContentFeatures() {
  if (subscribeLinksEnabled(window.location.href)) {
    handleSubscribeLinks();
  }

  let response = await ignoreNoConnectionError(
    browser_polyfill.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (response) {
    await applyContentFeatures(response);
  }
}

async function removeContentFeatures() {
  if (tracer) {
    tracer.disconnect();
  }
}

async function applyContentFeatures(response) {
  if (response.tracedSelectors) {
    tracer = new ElementHidingTracer(response.tracedSelectors);
  }

  const hideElements = (elements, filters) => {
    for (let element of elements) {
      hideElement(element, response.cssProperties);
    }

    if (tracer) {
      tracer.log(filters);
    }
  };

  const unhideElements = elements => {
    for (let element of elements) {
      unhideElement(element);
    }
  };

  const removeElements = (elements, filters) => {
    for (const element of elements) {
      element.remove();
    }

    if (tracer) {
      tracer.log(filters);
    }
  };

  const applyInlineCSS = (elements, cssPatterns) => {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const pattern = cssPatterns[i];

      for (const [key, value] of Object.entries(pattern.css)) {
        element.style.setProperty(key, value, "important");
      }
    }

    if (tracer) {
      const filterTexts = cssPatterns.map(pattern => pattern.text);
      tracer.log(filterTexts);
    }
  };

  if (response.emulatedPatterns.length > 0) {
    if (!content_elemHideEmulation) {
      content_elemHideEmulation = new elemHideEmulation/* ElemHideEmulation */.WX(hideElements, unhideElements,
                                                removeElements, applyInlineCSS);
    }
    content_elemHideEmulation.apply(response.emulatedPatterns);
  }
  else if (content_elemHideEmulation) {
    content_elemHideEmulation.apply(response.emulatedPatterns);
  }

  if (response.notifyActive) {
    startNotifyActive();
  }
}

function onMessage(message) {
  if (typeof message == "object" && message != null &&
    message.type && message.type == "ewe:apply-content-features") {
    removeContentFeatures();
    applyContentFeatures(message);
  }
}
browser_polyfill.runtime.onMessage.addListener(onMessage);

startElementCollapsing();
startOneClickAllowlisting();
initContentFeatures();
startWatchingBlockthroughTag();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyxrQ0FBa0M7QUFDM0M7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdCQUFnQixVQUFVLG9CQUFvQjtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFF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QjtBQUM5QjtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxrQkFBa0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQjtBQUN0Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLDJCQUEyQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQSxtREFBbUQ7QUFDbkQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUU0QztBQUNhOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1AsT0FBTyxvQkFBb0I7QUFDM0I7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSSx1QkFBdUI7QUFDM0IsTUFBTSx3QkFBZSxjQUFjO0FBQ25DLDhDQUE4QztBQUM5Qzs7QUFFQTtB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QWU7O0FBRWYsc0JBQXNCO0FBQ3RCLHlCQUF5QjtBQUN6QjtBQUNBLDRCQUE0QiIsInNvdXJjZXMiOlsid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9hZGJsb2NrcGx1c2NvcmUvbGliL2NvbW1vbi5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vYWRibG9ja3BsdXNjb3JlL2xpYi9jb250ZW50L2VsZW1IaWRlRW11bGF0aW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9hZGJsb2NrcGx1c2NvcmUvbGliL3BhdHRlcm5zLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi4vLi4vdmVuZG9yL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9zcmMvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvYWxsL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2NvbnRlbnQvZWxlbWVudC1jb2xsYXBzaW5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvY29udGVudC9hbGxvd2xpc3RpbmcuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL3NyYy9jb250ZW50L2VsZW1lbnQtaGlkaW5nLXRyYWNlci5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4vc3JjL2NvbnRlbnQvc3Vic2NyaWJlLWxpbmtzLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi9zcmMvY29udGVudC9jZHAtc2Vzc2lvbi5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4uLy4uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbmF0aXZlLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1hZC1maWx0ZXJpbmctc29sdXRpb24vLi4vLi4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uLi8uLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3N0cmluZ2lmeS5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtYWQtZmlsdGVyaW5nLXNvbHV0aW9uLy4uLy4uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL3NyYy9jb250ZW50L2Jsb2NrdGhyb3VnaC10YWcuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LWFkLWZpbHRlcmluZy1zb2x1dGlvbi8uL3NyYy9jb250ZW50L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5sZXQgdGV4dFRvUmVnRXhwID1cbi8qKlxuICogQ29udmVydHMgcmF3IHRleHQgaW50byBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IHRoZSBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybiB7c3RyaW5nfSByZWd1bGFyIGV4cHJlc3Npb24gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRleHRcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMudGV4dFRvUmVnRXhwID0gdGV4dCA9PiB0ZXh0LnJlcGxhY2UoL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csIFwiXFxcXCQmXCIpO1xuXG5jb25zdCByZWdleHBSZWdleHAgPSAvXlxcLyguKilcXC8oW2ltdV0qKSQvO1xuXG4vKipcbiAqIE1ha2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZnJvbSBhIHRleHQgYXJndW1lbnQuXG4gKlxuICogSWYgaXQgY2FuIGJlIHBhcnNlZCBhcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiwgcGFyc2UgaXQgYW5kIHRoZSBmbGFncy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCB0aGUgdGV4dCBhcmd1bWVudC5cbiAqXG4gKiBAcmV0dXJuIHs/UmVnRXhwfSBhIFJlZ0V4cCBvYmplY3Qgb3IgbnVsbCBpbiBjYXNlIG9mIGVycm9yLlxuICovXG5leHBvcnRzLm1ha2VSZWdFeHBQYXJhbWV0ZXIgPSBmdW5jdGlvbiBtYWtlUmVnRXhwUGFyYW1ldGVyKHRleHQpIHtcbiAgbGV0IFssIHNvdXJjZSwgZmxhZ3NdID0gcmVnZXhwUmVnZXhwLmV4ZWModGV4dCkgfHwgW251bGwsIHRleHRUb1JlZ0V4cCh0ZXh0KV07XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIGZsYWdzKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5sZXQgc3BsaXRTZWxlY3RvciA9IGV4cG9ydHMuc3BsaXRTZWxlY3RvciA9IGZ1bmN0aW9uIHNwbGl0U2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgaWYgKCFzZWxlY3Rvci5pbmNsdWRlcyhcIixcIikpIHtcbiAgICByZXR1cm4gW3NlbGVjdG9yXTtcbiAgfVxuXG4gIGxldCBzZWxlY3RvcnMgPSBbXTtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGxldmVsID0gMDtcbiAgbGV0IHNlcCA9IFwiXCI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaHIgPSBzZWxlY3RvcltpXTtcblxuICAgIC8vIGlnbm9yZSBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICBpZiAoY2hyID09IFwiXFxcXFwiKSB7XG4gICAgICBpKys7XG4gICAgfVxuICAgIC8vIGRvbid0IHNwbGl0IHdpdGhpbiBxdW90ZWQgdGV4dFxuICAgIGVsc2UgaWYgKGNociA9PSBzZXApIHtcbiAgICAgIHNlcCA9IFwiXCI7ICAgICAgICAgICAgIC8vIGUuZy4gW2F0dHI9XCIsXCJdXG4gICAgfVxuICAgIGVsc2UgaWYgKHNlcCA9PSBcIlwiKSB7XG4gICAgICBpZiAoY2hyID09ICdcIicgfHwgY2hyID09IFwiJ1wiKSB7XG4gICAgICAgIHNlcCA9IGNocjtcbiAgICAgIH1cbiAgICAgIC8vIGRvbid0IHNwbGl0IGJldHdlZW4gcGFyZW50aGVzZXNcbiAgICAgIGVsc2UgaWYgKGNociA9PSBcIihcIikge1xuICAgICAgICBsZXZlbCsrOyAgICAgICAgICAgIC8vIGUuZy4gOm1hdGNoZXMoZGl2LHNwYW4pXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHIgPT0gXCIpXCIpIHtcbiAgICAgICAgbGV2ZWwgPSBNYXRoLm1heCgwLCBsZXZlbCAtIDEpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2hyID09IFwiLFwiICYmIGxldmVsID09IDApIHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0KSk7XG4gIHJldHVybiBzZWxlY3RvcnM7XG59O1xuXG5mdW5jdGlvbiBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChzZWxlY3Rvcikge1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgd2hpdGVzcGFjZSA9IDA7XG4gIGxldCBzY29wZSA9IFtdO1xuXG4gIC8vIFN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgc3RyaW5nIGFuZCBnbyBjaGFyYWN0ZXIgYnkgY2hhcmFjdGVyLCB3aGVyZSBlYWNoXG4gIC8vIGNoYXJhY3RlciBpcyBhIFVuaWNvZGUgY29kZSBwb2ludC5cbiAgZm9yIChsZXQgY2hhcmFjdGVyIG9mIFsuLi5zZWxlY3Rvcl0ucmV2ZXJzZSgpKSB7XG4gICAgbGV0IGN1cnJlbnRTY29wZSA9IHNjb3BlW3Njb3BlLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGNoYXJhY3RlciA9PSBcIidcIiB8fCBjaGFyYWN0ZXIgPT0gXCJcXFwiXCIpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgd2l0aGluIHRoZSBzYW1lIHR5cGUgb2YgcXVvdGUsIGNsb3NlIHRoZSBzY29wZTtcbiAgICAgIC8vIG90aGVyd2lzZSBvcGVuIGEgbmV3IHNjb3BlLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSA9PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NvcGUucHVzaChjaGFyYWN0ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT0gXCJdXCIgfHwgY2hhcmFjdGVyID09IFwiKVwiKSB7XG4gICAgICAvLyBGb3IgY2xvc2luZyBicmFja2V0cyBhbmQgcGFyZW50aGVzZXMsIG9wZW4gYSBuZXcgc2NvcGUgb25seSBpZiB3ZSdyZVxuICAgICAgLy8gbm90IHdpdGhpbiBhIHF1b3RlLiBXaXRoaW4gcXVvdGVzIHRoZXNlIGNoYXJhY3RlcnMgc2hvdWxkIGhhdmUgbm9cbiAgICAgIC8vIG1lYW5pbmcuXG4gICAgICBpZiAoY3VycmVudFNjb3BlICE9IFwiJ1wiICYmIGN1cnJlbnRTY29wZSAhPSBcIlxcXCJcIikge1xuICAgICAgICBzY29wZS5wdXNoKGNoYXJhY3Rlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIltcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gYSBicmFja2V0LCBjbG9zZSB0aGUgc2NvcGUuXG4gICAgICBpZiAoY3VycmVudFNjb3BlID09IFwiXVwiKSB7XG4gICAgICAgIHNjb3BlLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT0gXCIoXCIpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgd2l0aGluIGEgcGFyZW50aGVzaXMsIGNsb3NlIHRoZSBzY29wZS5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgPT0gXCIpXCIpIHtcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFjdXJyZW50U2NvcGUpIHtcbiAgICAgIC8vIEF0IHRoZSB0b3AgbGV2ZWwgKG5vdCB3aXRoaW4gYW55IHNjb3BlKSwgY291bnQgdGhlIHdoaXRlc3BhY2UgaWYgd2UndmVcbiAgICAgIC8vIGVuY291bnRlcmVkIGl0LiBPdGhlcndpc2UgaWYgd2UndmUgaGl0IG9uZSBvZiB0aGUgY29tYmluYXRvcnMsXG4gICAgICAvLyB0ZXJtaW5hdGUgaGVyZTsgb3RoZXJ3aXNlIGlmIHdlJ3ZlIGhpdCBhIG5vbi1jb2xvbiBjaGFyYWN0ZXIsXG4gICAgICAvLyB0ZXJtaW5hdGUgaGVyZS5cbiAgICAgIGlmICgvXFxzLy50ZXN0KGNoYXJhY3RlcikpIHtcbiAgICAgICAgd2hpdGVzcGFjZSsrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoKGNoYXJhY3RlciA9PSBcIj5cIiB8fCBjaGFyYWN0ZXIgPT0gXCIrXCIgfHwgY2hhcmFjdGVyID09IFwiflwiKSB8fFxuICAgICAgICAgICAgICAgKHdoaXRlc3BhY2UgPiAwICYmIGNoYXJhY3RlciAhPSBcIjpcIikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gWmVybyBvdXQgdGhlIHdoaXRlc3BhY2UgY291bnQgaWYgd2UndmUgZW50ZXJlZCBhIHNjb3BlLlxuICAgIGlmIChzY29wZS5sZW5ndGggPiAwKSB7XG4gICAgICB3aGl0ZXNwYWNlID0gMDtcbiAgICB9XG5cbiAgICAvLyBJbmNyZW1lbnQgdGhlIGluZGV4IGJ5IHRoZSBzaXplIG9mIHRoZSBjaGFyYWN0ZXIuIE5vdGUgdGhhdCBmb3IgVW5pY29kZVxuICAgIC8vIGNvbXBvc2l0ZSBjaGFyYWN0ZXJzIChsaWtlIGVtb2ppKSB0aGlzIHdpbGwgYmUgbW9yZSB0aGFuIG9uZS5cbiAgICBpbmRleCArPSBjaGFyYWN0ZXIubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdG9yLmxlbmd0aCAtIGluZGV4ICsgd2hpdGVzcGFjZTtcbn1cblxuLyoqXG4gKiBRdWFsaWZpZXMgYSBDU1Mgc2VsZWN0b3Igd2l0aCBhIHF1YWxpZmllciwgd2hpY2ggbWF5IGJlIGFub3RoZXIgQ1NTIHNlbGVjdG9yXG4gKiBvciBhbiBlbXB0eSBzdHJpbmcuIEZvciBleGFtcGxlLCBnaXZlbiB0aGUgc2VsZWN0b3IgXCJkaXYuYmFyXCIgYW5kIHRoZVxuICogcXVhbGlmaWVyIFwiI2Zvb1wiLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgXCJkaXYjZm9vLmJhclwiLlxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIFRoZSBzZWxlY3RvciB0byBxdWFsaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IHF1YWxpZmllciBUaGUgcXVhbGlmaWVyIHdpdGggd2hpY2ggdG8gcXVhbGlmeSB0aGUgc2VsZWN0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcXVhbGlmaWVkIHNlbGVjdG9yLlxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy5xdWFsaWZ5U2VsZWN0b3IgPSBmdW5jdGlvbiBxdWFsaWZ5U2VsZWN0b3Ioc2VsZWN0b3IsIHF1YWxpZmllcikge1xuICBsZXQgcXVhbGlmaWVkU2VsZWN0b3IgPSBcIlwiO1xuXG4gIGxldCBxdWFsaWZpZXJUYXJnZXRTZWxlY3RvckluZGV4ID0gZmluZFRhcmdldFNlbGVjdG9ySW5kZXgocXVhbGlmaWVyKTtcbiAgbGV0IFssIHF1YWxpZmllclR5cGUgPSBcIlwiXSA9XG4gICAgL14oW2Etel1bYS16LV0qKT8vaS5leGVjKHF1YWxpZmllci5zdWJzdHJpbmcocXVhbGlmaWVyVGFyZ2V0U2VsZWN0b3JJbmRleCkpO1xuXG4gIGZvciAobGV0IHN1YiBvZiBzcGxpdFNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgIHN1YiA9IHN1Yi50cmltKCk7XG5cbiAgICBxdWFsaWZpZWRTZWxlY3RvciArPSBcIiwgXCI7XG5cbiAgICBsZXQgaW5kZXggPSBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChzdWIpO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBmaXJzdCBncm91cCBpbiB0aGUgcmVndWxhciBleHByZXNzaW9uIGlzIG9wdGlvbmFsLiBJZiBpdFxuICAgIC8vIGRvZXNuJ3QgbWF0Y2ggKGUuZy4gXCIjZm9vOjpudGgtY2hpbGQoMSlcIiksIHR5cGUgd2lsbCBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAgbGV0IFssIHR5cGUgPSBcIlwiLCByZXN0XSA9XG4gICAgICAvXihbYS16XVthLXotXSopP1xcKj8oLiopL2kuZXhlYyhzdWIuc3Vic3RyaW5nKGluZGV4KSk7XG5cbiAgICBpZiAodHlwZSA9PSBxdWFsaWZpZXJUeXBlKSB7XG4gICAgICB0eXBlID0gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcXVhbGlmaWVyIGVuZHMgaW4gYSBjb21iaW5hdG9yIChlLmcuIFwiYm9keSAjZm9vPlwiKSwgd2UgcHV0IHRoZVxuICAgIC8vIHR5cGUgYW5kIHRoZSByZXN0IG9mIHRoZSBzZWxlY3RvciBhZnRlciB0aGUgcXVhbGlmaWVyXG4gICAgLy8gKGUuZy4gXCJib2R5ICNmb28+ZGl2LmJhclwiKTsgb3RoZXJ3aXNlIChlLmcuIFwiYm9keSAjZm9vXCIpIHdlIG1lcmdlIHRoZVxuICAgIC8vIHR5cGUgaW50byB0aGUgcXVhbGlmaWVyIChlLmcuIFwiYm9keSBkaXYjZm9vLmJhclwiKS5cbiAgICBpZiAoL1tcXHM+K35dJC8udGVzdChxdWFsaWZpZXIpKSB7XG4gICAgICBxdWFsaWZpZWRTZWxlY3RvciArPSBzdWIuc3Vic3RyaW5nKDAsIGluZGV4KSArIHF1YWxpZmllciArIHR5cGUgKyByZXN0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IHN1Yi5zdWJzdHJpbmcoMCwgaW5kZXgpICsgdHlwZSArIHF1YWxpZmllciArIHJlc3Q7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBpbml0aWFsIGNvbW1hIGFuZCBzcGFjZS5cbiAgcmV0dXJuIHF1YWxpZmllZFNlbGVjdG9yLnN1YnN0cmluZygyKTtcbn07XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQWRibG9jayBQbHVzIDxodHRwczovL2FkYmxvY2twbHVzLm9yZy8+LFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEFkYmxvY2sgUGx1cy4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiogQG1vZHVsZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3Qge21ha2VSZWdFeHBQYXJhbWV0ZXIsIHNwbGl0U2VsZWN0b3IsXG4gICAgICAgcXVhbGlmeVNlbGVjdG9yfSA9IHJlcXVpcmUoXCIuLi9jb21tb25cIik7XG5jb25zdCB7ZmlsdGVyVG9SZWdFeHB9ID0gcmVxdWlyZShcIi4uL3BhdHRlcm5zXCIpO1xuXG5jb25zdCBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMID0gMzAwMDtcbmxldCBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMO1xuY29uc3QgREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUUgPSA1MDtcbmxldCBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lID0gREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUU7XG5cbmNvbnN0IGFicFNlbGVjdG9yUmVnZXhwID0gLzooLWFicC1bXFx3LV0rfGhhc3xoYXMtdGV4dHx4cGF0aHxub3QpXFwoLztcblxubGV0IHRlc3RJbmZvID0gbnVsbDtcblxuZnVuY3Rpb24gdG9DU1NTdHlsZURlY2xhcmF0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZXN0XCIpLCB7c3R5bGU6IHZhbHVlfSkuc3R5bGU7XG59XG5cbi8qKlxuICogRW5hYmxlcyB0ZXN0IG1vZGUsIHdoaWNoIHRyYWNrcyBhZGRpdGlvbmFsIG1ldGFkYXRhIGFib3V0IHRoZSBpbm5lclxuICogd29ya2luZ3MgZm9yIHRlc3QgcHVycG9zZXMuIFRoaXMgYWxzbyBhbGxvd3Mgb3ZlcnJpZGluZyBpbnRlcm5hbFxuICogY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubWluSW52b2NhdGlvbkludGVydmFsIE92ZXJyaWRlcyBob3cgbG9uZ1xuICogICBtdXN0IGJlIHdhaXRlZCBiZXR3ZWVuIGZpbHRlciBwcm9jZXNzaW5nIHJ1bnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLm1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgT3ZlcnJpZGVzIGhvd1xuICogICBsb25nIHRoZSB0aHJlYWQgbWF5IHNwZW5kIHByb2Nlc3NpbmcgZmlsdGVycyBiZWZvcmUgaXQgbXVzdCB5aWVsZFxuICogICBpdHMgdGhyZWFkXG4gKi9cbmV4cG9ydHMuc2V0VGVzdE1vZGUgPSBmdW5jdGlvbiBzZXRUZXN0TW9kZShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5taW5JbnZvY2F0aW9uSW50ZXJ2YWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBvcHRpb25zLm1pbkludm9jYXRpb25JbnRlcnZhbDtcbiAgfVxuICBpZiAodHlwZW9mIG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgPSBvcHRpb25zLm1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWU7XG4gIH1cblxuICB0ZXN0SW5mbyA9IHtcbiAgICBsYXN0UHJvY2Vzc2VkRWxlbWVudHM6IG5ldyBTZXQoKSxcbiAgICBmYWlsZWRBc3NlcnRpb25zOiBbXVxuICB9O1xufTtcblxuZXhwb3J0cy5nZXRUZXN0SW5mbyA9IGZ1bmN0aW9uIGdldFRlc3RJbmZvKCkge1xuICByZXR1cm4gdGVzdEluZm87XG59O1xuXG5leHBvcnRzLmNsZWFyVGVzdE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgbWluSW52b2NhdGlvbkludGVydmFsID0gREVGQVVMVF9NSU5fSU5WT0NBVElPTl9JTlRFUlZBTDtcbiAgbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSA9IERFRkFVTFRfTUFYX1NZQ0hST05PVVNfUFJPQ0VTU0lOR19USU1FO1xuICB0ZXN0SW5mbyA9IG51bGw7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgSWRsZURlYWRsaW5lLlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gaXMgc3luY2hyb25vdXMgYW5kIGRvZXMgTk9UIHJlcXVlc3QgYW4gaWRsZVxuICogY2FsbGJhY2suXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSWRsZURlYWRsaW5lfS5cbiAqIEByZXR1cm4ge0lkbGVEZWFkbGluZX1cbiAqL1xuZnVuY3Rpb24gbmV3SWRsZURlYWRsaW5lKCkge1xuICBsZXQgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHJldHVybiB7XG4gICAgZGlkVGltZW91dDogZmFsc2UsXG4gICAgdGltZVJlbWFpbmluZygpIHtcbiAgICAgIGxldCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICBsZXQgcmVtYWluaW5nID0gbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSAtIGVsYXBzZWQ7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoMCwgcmVtYWluaW5nKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBicm93c2VyIGlzIG5leHQgaWRsZS5cbiAqXG4gKiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgZm9yIGxvbmcgcnVubmluZyB0YXNrcyBvbiB0aGUgVUkgdGhyZWFkXG4gKiB0byBhbGxvdyBvdGhlciBVSSBldmVudHMgdG8gcHJvY2Vzcy5cbiAqXG4gKiBAcmV0dXJuIHtQcm9taXNlLjxJZGxlRGVhZGxpbmU+fVxuICogICAgQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4geW91IGNhbiBjb250aW51ZSBwcm9jZXNzaW5nXG4gKi9cbmZ1bmN0aW9uIHlpZWxkVGhyZWFkKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0SWRsZUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJlcXVlc3RJZGxlQ2FsbGJhY2socmVzb2x2ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlc29sdmUobmV3SWRsZURlYWRsaW5lKCkpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKG9iamVjdCwgbmFtZSwgZGVmYXVsdFZhbHVlRnVuYyA9ICgpID0+IHt9KSB7XG4gIGxldCB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge3ZhbHVlOiB2YWx1ZSA9IGRlZmF1bHRWYWx1ZUZ1bmMoKX0pO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gcG9zaXRpb24gb2Ygbm9kZSBmcm9tIHBhcmVudC5cbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSB0aGUgbm9kZSB0byBmaW5kIHRoZSBwb3NpdGlvbiBvZi5cbiAqIEByZXR1cm4ge251bWJlcn0gT25lLWJhc2VkIGluZGV4IGxpa2UgZm9yIDpudGgtY2hpbGQoKSwgb3IgMCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcG9zaXRpb25JblBhcmVudChub2RlKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGZvciAobGV0IGNoaWxkIG9mIG5vZGUucGFyZW50Tm9kZS5jaGlsZHJlbikge1xuICAgIGlmIChjaGlsZCA9PSBub2RlKSB7XG4gICAgICByZXR1cm4gaW5kZXggKyAxO1xuICAgIH1cblxuICAgIGluZGV4Kys7XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gbWFrZVNlbGVjdG9yKG5vZGUsIHNlbGVjdG9yID0gXCJcIikge1xuICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKCFub2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICBsZXQgbmV3U2VsZWN0b3IgPSBcIjpyb290XCI7XG4gICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICBuZXdTZWxlY3RvciArPSBcIiA+IFwiICsgc2VsZWN0b3I7XG4gICAgfVxuICAgIHJldHVybiBuZXdTZWxlY3RvcjtcbiAgfVxuICBsZXQgaWR4ID0gcG9zaXRpb25JblBhcmVudChub2RlKTtcbiAgaWYgKGlkeCA+IDApIHtcbiAgICBsZXQgbmV3U2VsZWN0b3IgPSBgJHtub2RlLnRhZ05hbWV9Om50aC1jaGlsZCgke2lkeH0pYDtcbiAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgIG5ld1NlbGVjdG9yICs9IFwiID4gXCIgKyBzZWxlY3RvcjtcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VTZWxlY3Rvcihub2RlLnBhcmVudEVsZW1lbnQsIG5ld1NlbGVjdG9yKTtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rvcjtcbn1cblxuZnVuY3Rpb24gcGFyc2VTZWxlY3RvckNvbnRlbnQoY29udGVudCwgc3RhcnRJbmRleCkge1xuICBsZXQgcGFyZW5zID0gMTtcbiAgbGV0IHF1b3RlID0gbnVsbDtcbiAgbGV0IGkgPSBzdGFydEluZGV4O1xuICBmb3IgKDsgaSA8IGNvbnRlbnQubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYyA9IGNvbnRlbnRbaV07XG4gICAgaWYgKGMgPT0gXCJcXFxcXCIpIHtcbiAgICAgIC8vIElnbm9yZSBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgIGkrKztcbiAgICB9XG4gICAgZWxzZSBpZiAocXVvdGUpIHtcbiAgICAgIGlmIChjID09IHF1b3RlKSB7XG4gICAgICAgIHF1b3RlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIidcIiB8fCBjID09ICdcIicpIHtcbiAgICAgIHF1b3RlID0gYztcbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIihcIikge1xuICAgICAgcGFyZW5zKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMgPT0gXCIpXCIpIHtcbiAgICAgIHBhcmVucy0tO1xuICAgICAgaWYgKHBhcmVucyA9PSAwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJlbnMgPiAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHt0ZXh0OiBjb250ZW50LnN1YnN0cmluZyhzdGFydEluZGV4LCBpKSwgZW5kOiBpfTtcbn1cblxuLyoqXG4gKiBTdHJpbmdpZmllZCBzdHlsZSBvYmplY3RzXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBTdHJpbmdpZmllZFN0eWxlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3R5bGUgQ1NTIHN0eWxlIHJlcHJlc2VudGVkIGJ5IGEgc3RyaW5nLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gc3ViU2VsZWN0b3JzIHNlbGVjdG9ycyB0aGUgQ1NTIHByb3BlcnRpZXMgYXBwbHkgdG8uXG4gKi9cblxuLyoqXG4gKiBQcm9kdWNlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdHlsZXNoZWV0IGVudHJ5LlxuICogQHBhcmFtIHtDU1NTdHlsZVJ1bGV9IHJ1bGUgdGhlIENTUyBzdHlsZSBydWxlLlxuICogQHJldHVybiB7U3RyaW5naWZpZWRTdHlsZX0gdGhlIHN0cmluZ2lmaWVkIHN0eWxlLlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlTdHlsZShydWxlKSB7XG4gIGxldCBzdHlsZXMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlLnN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHByb3BlcnR5ID0gcnVsZS5zdHlsZS5pdGVtKGkpO1xuICAgIGxldCB2YWx1ZSA9IHJ1bGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgbGV0IHByaW9yaXR5ID0gcnVsZS5zdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KHByb3BlcnR5KTtcbiAgICBzdHlsZXMucHVzaChgJHtwcm9wZXJ0eX06ICR7dmFsdWV9JHtwcmlvcml0eSA/IFwiICFcIiArIHByaW9yaXR5IDogXCJcIn07YCk7XG4gIH1cbiAgc3R5bGVzLnNvcnQoKTtcbiAgcmV0dXJuIHtcbiAgICBzdHlsZTogc3R5bGVzLmpvaW4oXCIgXCIpLFxuICAgIHN1YlNlbGVjdG9yczogc3BsaXRTZWxlY3RvcihydWxlLnNlbGVjdG9yVGV4dClcbiAgfTtcbn1cblxubGV0IHNjb3BlU3VwcG9ydGVkID0gbnVsbDtcblxuZnVuY3Rpb24gdHJ5UXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgYWxsKSB7XG4gIGxldCBlbGVtZW50cyA9IG51bGw7XG4gIHRyeSB7XG4gICAgZWxlbWVudHMgPSBhbGwgPyBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDpcbiAgICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgc2NvcGVTdXBwb3J0ZWQgPSB0cnVlO1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgLy8gRWRnZSBkb2Vzbid0IHN1cHBvcnQgXCI6c2NvcGVcIlxuICAgIHNjb3BlU3VwcG9ydGVkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGVsZW1lbnRzO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHNlbGVjdG9yLlxuICpcbiAqIElmIGl0IGlzIHJlbGF0aXZlLCB3aWxsIHRyeSA6c2NvcGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBlbGVtZW50IHRvIHF1ZXJ5IHNlbGVjdG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5XG4gKiBAcGFyYW0ge2Jvb2x9IFthbGw9ZmFsc2VdIHRydWUgdG8gcGVyZm9ybSBxdWVyeVNlbGVjdG9yQWxsKClcbiAqXG4gKiBAcmV0dXJucyB7PyhOb2RlfE5vZGVMaXN0KX0gcmVzdWx0IG9mIHRoZSBxdWVyeS4gbnVsbCBpbiBjYXNlIG9mIGVycm9yLlxuICovXG5mdW5jdGlvbiBzY29wZWRRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpIHtcbiAgaWYgKHNlbGVjdG9yWzBdID09IFwiPlwiKSB7XG4gICAgc2VsZWN0b3IgPSBcIjpzY29wZVwiICsgc2VsZWN0b3I7XG4gICAgaWYgKHNjb3BlU3VwcG9ydGVkKSB7XG4gICAgICByZXR1cm4gYWxsID8gc3VidHJlZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6XG4gICAgICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgfVxuICAgIGlmIChzY29wZVN1cHBvcnRlZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ5UXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgYWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGFsbCA/IHN1YnRyZWUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOlxuICAgIHN1YnRyZWUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNjb3BlZFF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIHRydWUpO1xufVxuXG5jbGFzcyBQbGFpblNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3IpIHtcbiAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gL1sjLjpdfFxcWy4rXFxdLy50ZXN0KHNlbGVjdG9yKTtcbiAgICB0aGlzLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMgPSAvW34rXS8udGVzdChzZWxlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBhIHBhaXIgb2Ygc2VsZWN0b3Igc3RyaW5nIGFuZCBzdWJ0cmVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICB5aWVsZCBbcHJlZml4ICsgdGhpcy5fc2VsZWN0b3IsIHN1YnRyZWVdO1xuICB9XG59XG5cbmNvbnN0IGluY29tcGxldGVQcmVmaXhSZWdleHAgPSAvW1xccz4rfl0kLztcblxuY2xhc3MgTm90U2VsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4gPSBuZXcgUGF0dGVybihzZWxlY3RvcnMpO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPblN0eWxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPblN0eWxlcztcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25DaGFyYWN0ZXJEYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uQ2hhcmFjdGVyRGF0YTtcbiAgfVxuXG4gIGdldCBtYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXM7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKSB7XG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBlbGVtZW50XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0aGUgcHJlZml4IGZvciB0aGUgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uLlxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICovXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQgYWN0dWFsUHJlZml4ID0gKCFwcmVmaXggfHwgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpID9cbiAgICAgIHByZWZpeCArIFwiKlwiIDogcHJlZml4O1xuICAgIGxldCBlbGVtZW50cyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgYWN0dWFsUHJlZml4KTtcbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgbmVpdGhlciBhbiBhbmNlc3RvciBub3IgYSBkZXNjZW5kYW50IG9mIG9uZSBvZiB0aGVcbiAgICAgICAgLy8gdGFyZ2V0cywgd2UgY2FuIHNraXAgaXQuXG4gICAgICAgIGlmICh0YXJnZXRzICYmICF0YXJnZXRzLnNvbWUodGFyZ2V0ID0+IGVsZW1lbnQuY29udGFpbnModGFyZ2V0KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY29udGFpbnMoZWxlbWVudCkpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXN0SW5mbykge1xuICAgICAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2lubmVyUGF0dGVybi5tYXRjaGVzKGVsZW1lbnQsIHN1YnRyZWUpKSB7XG4gICAgICAgICAgeWllbGQgZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHlpZWxkIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybi5zZXRTdHlsZXMoc3R5bGVzKTtcbiAgfVxufVxuXG5jbGFzcyBIYXNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybiA9IG5ldyBQYXR0ZXJuKHNlbGVjdG9ycyk7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uU3R5bGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uU3R5bGVzO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcztcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpIHtcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIHNlbGVjdGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG4gICAgbGV0IGVsZW1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBhY3R1YWxQcmVmaXgpO1xuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBuZWl0aGVyIGFuIGFuY2VzdG9yIG5vciBhIGRlc2NlbmRhbnQgb2Ygb25lIG9mIHRoZVxuICAgICAgICAvLyB0YXJnZXRzLCB3ZSBjYW4gc2tpcCBpdC5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHRoaXMuX2lubmVyUGF0dGVybi5ldmFsdWF0ZShlbGVtZW50LCB0YXJnZXRzKSkge1xuICAgICAgICAgIGlmIChzZWxlY3RvciA9PSBudWxsKSB7XG4gICAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIChzY29wZWRRdWVyeVNlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgeWllbGQgZWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlcyhzdHlsZXMpIHtcbiAgICB0aGlzLl9pbm5lclBhdHRlcm4uc2V0U3R5bGVzKHN0eWxlcyk7XG4gIH1cbn1cblxuY2xhc3MgWFBhdGhTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHRleHRDb250ZW50KSB7XG4gICAgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhID0gdHJ1ZTtcbiAgICB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyA9IHRydWU7XG5cbiAgICBsZXQgZXZhbHVhdG9yID0gbmV3IFhQYXRoRXZhbHVhdG9yKCk7XG4gICAgdGhpcy5fZXhwcmVzc2lvbiA9IGV2YWx1YXRvci5jcmVhdGVFeHByZXNzaW9uKHRleHRDb250ZW50LCBudWxsKTtcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpIHtcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICAgIH1cbiAgfVxuXG4gICpnZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBsZXQge09SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFOiBmbGFnfSA9IFhQYXRoUmVzdWx0O1xuICAgIGxldCBlbGVtZW50cyA9IHByZWZpeCA/IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgcHJlZml4KSA6IFtzdWJ0cmVlXTtcbiAgICBmb3IgKGxldCBwYXJlbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLl9leHByZXNzaW9uLmV2YWx1YXRlKHBhcmVudCwgZmxhZywgbnVsbCk7XG4gICAgICBmb3IgKGxldCBpID0gMCwge3NuYXBzaG90TGVuZ3RofSA9IHJlc3VsdDsgaSA8IHNuYXBzaG90TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgeWllbGQgcmVzdWx0LnNuYXBzaG90SXRlbShpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ29udGFpbnNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHRleHRDb250ZW50KSB7XG4gICAgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhID0gdHJ1ZTtcblxuICAgIHRoaXMuX3JlZ2V4cCA9IG1ha2VSZWdFeHBQYXJhbWV0ZXIodGV4dENvbnRlbnQpO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSkge1xuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgc3VidHJlZV07XG4gICAgfVxuICB9XG5cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG5cbiAgICBsZXQgZWxlbWVudHMgPSBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIGFjdHVhbFByZWZpeCk7XG5cbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGxldCBsYXN0Um9vdCA9IG51bGw7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIEZvciBhIGZpbHRlciBsaWtlIGRpdjotYWJwLWNvbnRhaW5zKEhlbGxvKSBhbmQgYSBzdWJ0cmVlIGxpa2VcbiAgICAgICAgLy8gPGRpdiBpZD1cImFcIj48ZGl2IGlkPVwiYlwiPjxkaXYgaWQ9XCJjXCI+SGVsbG88L2Rpdj48L2Rpdj48L2Rpdj5cbiAgICAgICAgLy8gd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGRpdiNhXG4gICAgICAgIGlmIChsYXN0Um9vdCAmJiBsYXN0Um9vdC5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0Um9vdCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9yZWdleHAgJiYgdGhpcy5fcmVnZXhwLnRlc3QoZWxlbWVudC50ZXh0Q29udGVudCkpIHtcbiAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUHJvcHNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5RXhwcmVzc2lvbikge1xuICAgIHRoaXMuZGVwZW5kc09uU3R5bGVzID0gdHJ1ZTtcbiAgICB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyA9IHRydWU7XG5cbiAgICBsZXQgcmVnZXhwU3RyaW5nO1xuICAgIGlmIChwcm9wZXJ0eUV4cHJlc3Npb24ubGVuZ3RoID49IDIgJiYgcHJvcGVydHlFeHByZXNzaW9uWzBdID09IFwiL1wiICYmXG4gICAgICAgIHByb3BlcnR5RXhwcmVzc2lvbltwcm9wZXJ0eUV4cHJlc3Npb24ubGVuZ3RoIC0gMV0gPT0gXCIvXCIpIHtcbiAgICAgIHJlZ2V4cFN0cmluZyA9IHByb3BlcnR5RXhwcmVzc2lvbi5zbGljZSgxLCAtMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVnZXhwU3RyaW5nID0gZmlsdGVyVG9SZWdFeHAocHJvcGVydHlFeHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZWdleHAgPSBuZXcgUmVnRXhwKHJlZ2V4cFN0cmluZywgXCJpXCIpO1xuXG4gICAgdGhpcy5fc3ViU2VsZWN0b3JzID0gW107XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IHN1YlNlbGVjdG9yIG9mIHRoaXMuX3N1YlNlbGVjdG9ycykge1xuICAgICAgaWYgKHN1YlNlbGVjdG9yLnN0YXJ0c1dpdGgoXCIqXCIpICYmXG4gICAgICAgICAgIWluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSB7XG4gICAgICAgIHN1YlNlbGVjdG9yID0gc3ViU2VsZWN0b3Iuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuXG4gICAgICB5aWVsZCBbcXVhbGlmeVNlbGVjdG9yKHN1YlNlbGVjdG9yLCBwcmVmaXgpLCBzdWJ0cmVlXTtcbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgdGhpcy5fc3ViU2VsZWN0b3JzID0gW107XG4gICAgZm9yIChsZXQgc3R5bGUgb2Ygc3R5bGVzKSB7XG4gICAgICBpZiAodGhpcy5fcmVnZXhwLnRlc3Qoc3R5bGUuc3R5bGUpKSB7XG4gICAgICAgIGZvciAobGV0IHN1YlNlbGVjdG9yIG9mIHN0eWxlLnN1YlNlbGVjdG9ycykge1xuICAgICAgICAgIGxldCBpZHggPSBzdWJTZWxlY3Rvci5sYXN0SW5kZXhPZihcIjo6XCIpO1xuICAgICAgICAgIGlmIChpZHggIT0gLTEpIHtcbiAgICAgICAgICAgIHN1YlNlbGVjdG9yID0gc3ViU2VsZWN0b3Iuc3Vic3RyaW5nKDAsIGlkeCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fc3ViU2VsZWN0b3JzLnB1c2goc3ViU2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFBhdHRlcm4ge1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMsIHRleHQsIHJlbW92ZSA9IGZhbHNlLCBjc3MgPSBudWxsKSB7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB0aGlzLnJlbW92ZSA9IHJlbW92ZTtcbiAgICB0aGlzLmNzcyA9IGNzcztcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25TdHlsZXMoKSB7XG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9kZXBlbmRzT25TdHlsZXNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IuZGVwZW5kc09uU3R5bGVzXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldCBtYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMoKSB7XG4gICAgLy8gT2JzZXJ2ZSBjaGFuZ2VzIHRvIGF0dHJpYnV0ZXMgaWYgZWl0aGVyIHRoZXJlJ3MgYSBwbGFpbiBzZWxlY3RvciB0aGF0XG4gICAgLy8gbG9va3MgbGlrZSBhbiBJRCBzZWxlY3RvciwgY2xhc3Mgc2VsZWN0b3IsIG9yIGF0dHJpYnV0ZSBzZWxlY3RvciBpbiBvbmVcbiAgICAvLyBvZiB0aGUgcGF0dGVybnMgKGUuZy4gXCJhW2hyZWY9J2h0dHBzOi8vZXhhbXBsZS5jb20vJ11cIilcbiAgICAvLyBvciB0aGVyZSdzIGEgcHJvcGVydGllcyBzZWxlY3RvciBuZXN0ZWQgaW5zaWRlIGEgaGFzIHNlbGVjdG9yXG4gICAgLy8gKGUuZy4gXCJkaXY6LWFicC1oYXMoOi1hYnAtcHJvcGVydGllcyhjb2xvcjogYmx1ZSkpXCIpXG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzIHx8XG4gICAgICAgICAgICAgICAgICAgIChzZWxlY3RvciBpbnN0YW5jZW9mIEhhc1NlbGVjdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXMpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25DaGFyYWN0ZXJEYXRhKCkge1xuICAgIC8vIE9ic2VydmUgY2hhbmdlcyB0byBjaGFyYWN0ZXIgZGF0YSBvbmx5IGlmIHRoZXJlJ3MgYSBjb250YWlucyBzZWxlY3RvciBpblxuICAgIC8vIG9uZSBvZiB0aGUgcGF0dGVybnMuXG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9kZXBlbmRzT25DaGFyYWN0ZXJEYXRhXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLmRlcGVuZHNPbkNoYXJhY3RlckRhdGFcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IG1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMoKSB7XG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnNcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgbWF0Y2hlc011dGF0aW9uVHlwZXMobXV0YXRpb25UeXBlcykge1xuICAgIGxldCBtdXRhdGlvblR5cGVNYXRjaE1hcCA9IGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tdXRhdGlvblR5cGVNYXRjaE1hcFwiLCAoKSA9PiBuZXcgTWFwKFtcbiAgICAgICAgLy8gQWxsIHR5cGVzIG9mIERPTS1kZXBlbmRlbnQgcGF0dGVybnMgYXJlIGFmZmVjdGVkIGJ5IG11dGF0aW9ucyBvZlxuICAgICAgICAvLyB0eXBlIFwiY2hpbGRMaXN0XCIuXG4gICAgICAgIFtcImNoaWxkTGlzdFwiLCB0cnVlXSxcbiAgICAgICAgW1wiYXR0cmlidXRlc1wiLCB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlc10sXG4gICAgICAgIFtcImNoYXJhY3RlckRhdGFcIiwgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhXVxuICAgICAgXSlcbiAgICApO1xuXG4gICAgZm9yIChsZXQgbXV0YXRpb25UeXBlIG9mIG11dGF0aW9uVHlwZXMpIHtcbiAgICAgIGlmIChtdXRhdGlvblR5cGVNYXRjaE1hcC5nZXQobXV0YXRpb25UeXBlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBDU1Mgc2VsZWN0b3JzIGZvciBhbGwgZWxlbWVudHMgdGhhdFxuICAgKiBtYXRjaCB0aGUgcGF0dGVybi5cbiAgICpcbiAgICogVGhpcyBhbGxvd3MgdHJhbnNmb3JtaW5nIGZyb20gc2VsZWN0b3JzIHRoYXQgbWF5IGNvbnRhaW4gY3VzdG9tXG4gICAqIDotYWJwLSBzZWxlY3RvcnMgdG8gcHVyZSBDU1Mgc2VsZWN0b3JzIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VsZWN0XG4gICAqIGVsZW1lbnRzLlxuICAgKlxuICAgKiBUaGUgc2VsZWN0b3JzIHJldHVybmVkIGZyb20gdGhpcyBmdW5jdGlvbiBtYXkgYmUgaW52YWxpZGF0ZWQgYnkgRE9NXG4gICAqIG11dGF0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb25cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uIE1heSBiZVxuICAgKiB1c2VkIHRvIG9wdGltaXplIHNlYXJjaC5cbiAgICovXG4gICpldmFsdWF0ZShzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IHNlbGVjdG9ycyA9IHRoaXMuc2VsZWN0b3JzO1xuICAgIGZ1bmN0aW9uKiBldmFsdWF0ZUlubmVyKGluZGV4LCBwcmVmaXgsIGN1cnJlbnRTdWJ0cmVlKSB7XG4gICAgICBpZiAoaW5kZXggPj0gc2VsZWN0b3JzLmxlbmd0aCkge1xuICAgICAgICB5aWVsZCBwcmVmaXg7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IFtzZWxlY3RvciwgZWxlbWVudF0gb2Ygc2VsZWN0b3JzW2luZGV4XS5nZXRTZWxlY3RvcnMoXG4gICAgICAgIHByZWZpeCwgY3VycmVudFN1YnRyZWUsIHRhcmdldHNcbiAgICAgICkpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yID09IG51bGwpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHlpZWxkKiBldmFsdWF0ZUlubmVyKGluZGV4ICsgMSwgc2VsZWN0b3IsIGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBKdXN0IGluIGNhc2UgdGhlIGdldFNlbGVjdG9ycygpIGdlbmVyYXRvciBhYm92ZSBoYWQgdG8gcnVuIHNvbWUgaGVhdnlcbiAgICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoKSBjYWxsIHdoaWNoIGRpZG4ndCBwcm9kdWNlIGFueSByZXN1bHRzLCBtYWtlXG4gICAgICAvLyBzdXJlIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBwb2ludCB3aGVyZSBleGVjdXRpb24gY2FuIHBhdXNlLlxuICAgICAgeWllbGQgbnVsbDtcbiAgICB9XG4gICAgeWllbGQqIGV2YWx1YXRlSW5uZXIoMCwgXCJcIiwgc3VidHJlZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgcGF0dGVybiBtYXRjaGVzIGEgc3BlY2lmaWMgZWxlbWVudFxuICAgKiBAcGFyYW0ge05vZGV9IFt0YXJnZXRdIHRoZSBlbGVtZW50IHdlJ3JlIGludGVyZXN0ZWQgaW4gY2hlY2tpbmcgZm9yXG4gICAqIG1hdGNoZXMgb24uXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uXG4gICAqIEByZXR1cm4ge2Jvb2x9XG4gICAqL1xuICBtYXRjaGVzKHRhcmdldCwgc3VidHJlZSkge1xuICAgIGxldCB0YXJnZXRGaWx0ZXIgPSBbdGFyZ2V0XTtcbiAgICBpZiAodGhpcy5tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzKSB7XG4gICAgICB0YXJnZXRGaWx0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3RvckdlbmVyYXRvciA9IHRoaXMuZXZhbHVhdGUoc3VidHJlZSwgdGFyZ2V0RmlsdGVyKTtcbiAgICBmb3IgKGxldCBzZWxlY3RvciBvZiBzZWxlY3RvckdlbmVyYXRvcikge1xuICAgICAgaWYgKHNlbGVjdG9yICYmIHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICBpZiAoc2VsZWN0b3IuZGVwZW5kc09uU3R5bGVzKSB7XG4gICAgICAgIHNlbGVjdG9yLnNldFN0eWxlcyhzdHlsZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0TXV0YXRpb25UeXBlcyhtdXRhdGlvbnMpIHtcbiAgbGV0IHR5cGVzID0gbmV3IFNldCgpO1xuXG4gIGZvciAobGV0IG11dGF0aW9uIG9mIG11dGF0aW9ucykge1xuICAgIHR5cGVzLmFkZChtdXRhdGlvbi50eXBlKTtcblxuICAgIC8vIFRoZXJlIGFyZSBvbmx5IDMgdHlwZXMgb2YgbXV0YXRpb25zOiBcImF0dHJpYnV0ZXNcIiwgXCJjaGFyYWN0ZXJEYXRhXCIsIGFuZFxuICAgIC8vIFwiY2hpbGRMaXN0XCIuXG4gICAgaWYgKHR5cGVzLnNpemUgPT0gMykge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHR5cGVzO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0TXV0YXRpb25UYXJnZXRzKG11dGF0aW9ucykge1xuICBpZiAoIW11dGF0aW9ucykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IHRhcmdldHMgPSBuZXcgU2V0KCk7XG5cbiAgZm9yIChsZXQgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgaWYgKG11dGF0aW9uLnR5cGUgPT0gXCJjaGlsZExpc3RcIikge1xuICAgICAgLy8gV2hlbiBuZXcgbm9kZXMgYXJlIGFkZGVkLCB3ZSdyZSBpbnRlcmVzdGVkIGluIHRoZSBhZGRlZCBub2RlcyByYXRoZXJcbiAgICAgIC8vIHRoYW4gdGhlIHBhcmVudC5cbiAgICAgIGZvciAobGV0IG5vZGUgb2YgbXV0YXRpb24uYWRkZWROb2Rlcykge1xuICAgICAgICB0YXJnZXRzLmFkZChub2RlKTtcbiAgICAgIH1cbiAgICAgIGlmIChtdXRhdGlvbi5yZW1vdmVkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0YXJnZXRzLmFkZChtdXRhdGlvbi50YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRhcmdldHMuYWRkKG11dGF0aW9uLnRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi50YXJnZXRzXTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyUGF0dGVybnMocGF0dGVybnMsIHtzdHlsZXNoZWV0cywgbXV0YXRpb25zfSkge1xuICBpZiAoIXN0eWxlc2hlZXRzICYmICFtdXRhdGlvbnMpIHtcbiAgICByZXR1cm4gcGF0dGVybnMuc2xpY2UoKTtcbiAgfVxuXG4gIGxldCBtdXRhdGlvblR5cGVzID0gbXV0YXRpb25zID8gZXh0cmFjdE11dGF0aW9uVHlwZXMobXV0YXRpb25zKSA6IG51bGw7XG5cbiAgcmV0dXJuIHBhdHRlcm5zLmZpbHRlcihcbiAgICBwYXR0ZXJuID0+IChzdHlsZXNoZWV0cyAmJiBwYXR0ZXJuLmRlcGVuZHNPblN0eWxlcykgfHxcbiAgICAgICAgICAgICAgIChtdXRhdGlvbnMgJiYgcGF0dGVybi5tYXRjaGVzTXV0YXRpb25UeXBlcyhtdXRhdGlvblR5cGVzKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZUF0dHJpYnV0ZXMocGF0dGVybnMpIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZE9ic2VydmVDaGFyYWN0ZXJEYXRhKHBhdHRlcm5zKSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZVN0eWxlcyhwYXR0ZXJucykge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4uZGVwZW5kc09uU3R5bGVzKTtcbn1cblxuLyoqXG4gKiBAY2FsbGJhY2sgaGlkZUVsZW1zRnVuY1xuICogQHBhcmFtIHtOb2RlW119IGVsZW1lbnRzIEVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgc2hvdWxkIGJlIGhpZGRlblxuICogQHBhcmFtIHtzdHJpbmdbXX0gZWxlbWVudEZpbHRlcnNcbiAqICAgVGhlIGZpbHRlciB0ZXh0IHRoYXQgY2F1c2VkIHRoZSBlbGVtZW50cyB0byBiZSBoaWRkZW5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayB1bmhpZGVFbGVtc0Z1bmNcbiAqIEBwYXJhbSB7Tm9kZVtdfSBlbGVtZW50cyBFbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IHNob3VsZCBiZSBoaWRkZW5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayByZW1vdmVFbGVtc0Z1bmNcbiAqIEBwYXJhbSB7Tm9kZVtdfSBlbGVtZW50cyBFbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IHNob3VsZCBiZSByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBlbGVtZW50RmlsdGVyc1xuICogICBUaGUgZmlsdGVyIHRleHQgdGhhdCBjYXVzZWQgdGhlIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWRcbiAqIHJlbW92ZWQgZnJvbSB0aGUgRE9NXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgY3NzRWxlbXNGdW5jXG4gKiBAcGFyYW0ge05vZGVbXX0gZWxlbWVudHMgRWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBzaG91bGRcbiAqIGFwcGx5IGlubGluZSBDU1MgcnVsZXNcbiAqIEBwYXJhbSB7c3RyaW5nW119IGNzc1BhdHRlcm5zIFRoZSBDU1MgcGF0dGVybnMgdG8gYmUgYXBwbGllZFxuICovXG5cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBmcm9udC1lbmQgcHJvY2Vzc2luZyBvZiBlbGVtZW50IGhpZGluZyBlbXVsYXRpb24gZmlsdGVycy5cbiAqL1xuZXhwb3J0cy5FbGVtSGlkZUVtdWxhdGlvbiA9IGNsYXNzIEVsZW1IaWRlRW11bGF0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bW9kdWxlOmNvbnRlbnQvZWxlbUhpZGVFbXVsYXRpb25+aGlkZUVsZW1zRnVuY30gaGlkZUVsZW1zRnVuY1xuICAgKiAgIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgcHJvdmlkZWQgdG8gZG8gdGhlIGFjdHVhbCBlbGVtZW50IGhpZGluZy5cbiAgICogQHBhcmFtIHttb2R1bGU6Y29udGVudC9lbGVtSGlkZUVtdWxhdGlvbn51bmhpZGVFbGVtc0Z1bmN9IHVuaGlkZUVsZW1zRnVuY1xuICAgKiAgIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgcHJvdmlkZWQgdG8gdW5oaWRlIHByZXZpb3VzbHkgaGlkZGVuIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge21vZHVsZTpjb250ZW50L2VsZW1IaWRlRW11bGF0aW9ufnJlbW92ZUVsZW1zRnVuY30gcmVtb3ZlRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byByZW1vdmUgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxuICAgKiBAcGFyYW0ge21vZHVsZTpjb250ZW50L2VsZW1IaWRlRW11bGF0aW9ufmNzc0VsZW1zRnVuY30gY3NzRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byBhcHBseSBpbmxpbmUgQ1NTIHJ1bGVzIHRvIGVsZW1lbnRzXG4gICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGhpZGVFbGVtc0Z1bmMgPSAoKSA9PiB7fSxcbiAgICB1bmhpZGVFbGVtc0Z1bmMgPSAoKSA9PiB7fSxcbiAgICByZW1vdmVFbGVtc0Z1bmMgPSAoKSA9PiB7fSxcbiAgICBjc3NFbGVtc0Z1bmMgPSAoKSA9PiB7fVxuICApIHtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gICAgdGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RJbnZvY2F0aW9uID0gLW1pbkludm9jYXRpb25JbnRlcnZhbDtcbiAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0gbnVsbDtcblxuICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICB0aGlzLmhpZGVFbGVtc0Z1bmMgPSBoaWRlRWxlbXNGdW5jO1xuICAgIHRoaXMudW5oaWRlRWxlbXNGdW5jID0gdW5oaWRlRWxlbXNGdW5jO1xuICAgIHRoaXMucmVtb3ZlRWxlbXNGdW5jID0gcmVtb3ZlRWxlbXNGdW5jO1xuICAgIHRoaXMuY3NzRWxlbXNGdW5jID0gY3NzRWxlbXNGdW5jO1xuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLm9ic2VydmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5oaWRkZW5FbGVtZW50cyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGlzU2FtZU9yaWdpbihzdHlsZXNoZWV0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBuZXcgVVJMKHN0eWxlc2hlZXQuaHJlZikub3JpZ2luID09IHRoaXMuZG9jdW1lbnQubG9jYXRpb24ub3JpZ2luO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgLy8gSW52YWxpZCBVUkwsIGFzc3VtZSB0aGF0IGl0IGlzIGZpcnN0LXBhcnR5LlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSBzZWxlY3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgdGhlIHNlbGVjdG9yIHRvIHBhcnNlXG4gICAqIEByZXR1cm4ge0FycmF5fSBzZWxlY3RvcnMgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyxcbiAgICogb3IgbnVsbCBpbiBjYXNlIG9mIGVycm9ycy5cbiAgICovXG4gIHBhcnNlU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBsZXQgbWF0Y2ggPSBhYnBTZWxlY3RvclJlZ2V4cC5leGVjKHNlbGVjdG9yKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICByZXR1cm4gW25ldyBQbGFpblNlbGVjdG9yKHNlbGVjdG9yKV07XG4gICAgfVxuXG4gICAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuICAgIGlmIChtYXRjaC5pbmRleCA+IDApIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQbGFpblNlbGVjdG9yKHNlbGVjdG9yLnN1YnN0cmluZygwLCBtYXRjaC5pbmRleCkpKTtcbiAgICB9XG5cbiAgICBsZXQgc3RhcnRJbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgIGxldCBjb250ZW50ID0gcGFyc2VTZWxlY3RvckNvbnRlbnQoc2VsZWN0b3IsIHN0YXJ0SW5kZXgpO1xuICAgIGlmICghY29udGVudCkge1xuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZHVlIHRvIHVubWF0Y2hlZCBwYXJlbnRoZXNlcy5cIikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoWzFdID09IFwiLWFicC1wcm9wZXJ0aWVzXCIpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQcm9wc1NlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIi1hYnAtaGFzXCIgfHwgbWF0Y2hbMV0gPT0gXCJoYXNcIikge1xuICAgICAgbGV0IGhhc1NlbGVjdG9ycyA9IHRoaXMucGFyc2VTZWxlY3Rvcihjb250ZW50LnRleHQpO1xuICAgICAgaWYgKGhhc1NlbGVjdG9ycyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IEhhc1NlbGVjdG9yKGhhc1NlbGVjdG9ycykpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIi1hYnAtY29udGFpbnNcIiB8fCBtYXRjaFsxXSA9PSBcImhhcy10ZXh0XCIpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBDb250YWluc1NlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCJ4cGF0aFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChuZXcgWFBhdGhTZWxlY3Rvcihjb250ZW50LnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoICh7bWVzc2FnZX0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICAgIFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGludmFsaWQgYCArXG4gICAgICAgICAgICBgeHBhdGg6ICR7Y29udGVudC50ZXh0fSBgICtcbiAgICAgICAgICAgIGBlcnJvcjogJHttZXNzYWdlfS5gXG4gICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIm5vdFwiKSB7XG4gICAgICBsZXQgbm90U2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKGNvbnRlbnQudGV4dCk7XG4gICAgICBpZiAobm90U2VsZWN0b3JzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGFsbCBvZiB0aGUgaW5uZXIgc2VsZWN0b3JzIGFyZSBQbGFpblNlbGVjdG9ycywgdGhlbiB3ZVxuICAgICAgLy8gZG9uJ3QgYWN0dWFsbHkgbmVlZCB0byB1c2Ugb3VyIHNlbGVjdG9yIGF0IGFsbC4gV2UncmUgYmV0dGVyXG4gICAgICAvLyBvZmYgZGVsZWdhdGluZyB0byB0aGUgYnJvd3NlciA6bm90IGltcGxlbWVudGF0aW9uLlxuICAgICAgaWYgKG5vdFNlbGVjdG9ycy5ldmVyeShzID0+IHMgaW5zdGFuY2VvZiBQbGFpblNlbGVjdG9yKSkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChuZXcgUGxhaW5TZWxlY3RvcihgOm5vdCgke2NvbnRlbnQudGV4dH0pYCkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBOb3RTZWxlY3Rvcihub3RTZWxlY3RvcnMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGlzIGlzIGFuIGVycm9yLCBjYW4ndCBwYXJzZSBzZWxlY3Rvci5cbiAgICAgIGNvbnNvbGUud2FybihuZXcgU3ludGF4RXJyb3IoXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNlbGVjdG9yICR7c2VsZWN0b3J9LCBpbnZhbGlkIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgcHNldWRvLWNsYXNzIDoke21hdGNoWzFdfSgpLmApKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBzdWZmaXggPSB0aGlzLnBhcnNlU2VsZWN0b3Ioc2VsZWN0b3Iuc3Vic3RyaW5nKGNvbnRlbnQuZW5kICsgMSkpO1xuICAgIGlmIChzdWZmaXggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgc2VsZWN0b3JzLnB1c2goLi4uc3VmZml4KTtcblxuICAgIGlmIChzZWxlY3RvcnMubGVuZ3RoID09IDEgJiYgc2VsZWN0b3JzWzBdIGluc3RhbmNlb2YgQ29udGFpbnNTZWxlY3Rvcikge1xuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGNhbid0IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhhdmUgYSBsb25lbHkgOi1hYnAtY29udGFpbnMoKS5cIikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RvcnM7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHJ1bGVzIG91dCBvZiBDU1Mgc3R5bGVzaGVldHNcbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c10gVGhlIGxpc3Qgb2Ygc3R5bGVzaGVldHMgdG9cbiAgICogcmVhZC5cbiAgICogQHJldHVybiB7Q1NTU3R5bGVSdWxlW119XG4gICAqL1xuICBfcmVhZENzc1J1bGVzKHN0eWxlc2hlZXRzKSB7XG4gICAgbGV0IGNzc1N0eWxlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgc3R5bGVzaGVldCBvZiBzdHlsZXNoZWV0cyB8fCBbXSkge1xuICAgICAgLy8gRXhwbGljaXRseSBpZ25vcmUgdGhpcmQtcGFydHkgc3R5bGVzaGVldHMgdG8gZW5zdXJlIGNvbnNpc3RlbnQgYmVoYXZpb3JcbiAgICAgIC8vIGJldHdlZW4gRmlyZWZveCBhbmQgQ2hyb21lLlxuICAgICAgaWYgKCF0aGlzLmlzU2FtZU9yaWdpbihzdHlsZXNoZWV0KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IHJ1bGVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcnVsZXMgPSBzdHlsZXNoZWV0LmNzc1J1bGVzO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gT24gRmlyZWZveCwgdGhlcmUgaXMgYSBjaGFuY2UgdGhhdCBhbiBJbnZhbGlkQWNjZXNzRXJyb3JcbiAgICAgICAgLy8gZ2V0IHRocm93biB3aGVuIGFjY2Vzc2luZyBjc3NSdWxlcy4gSnVzdCBza2lwIHRoZSBzdHlsZXNoZWV0XG4gICAgICAgIC8vIGluIHRoYXQgY2FzZS5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vc2VhcmNoZm94Lm9yZy9tb3ppbGxhLWNlbnRyYWwvcmV2L2Y2NWQ3NTI4ZTM0ZWYxYTc2NjViNGExYTdiN2NkYjEzODhmY2QzYWEvbGF5b3V0L3N0eWxlL1N0eWxlU2hlZXQuY3BwIzY5OVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFydWxlcykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgcnVsZSBvZiBydWxlcykge1xuICAgICAgICBpZiAocnVsZS50eXBlICE9IHJ1bGUuU1RZTEVfUlVMRSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY3NzU3R5bGVzLnB1c2goc3RyaW5naWZ5U3R5bGUocnVsZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3NzU3R5bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyB0aGUgY3VycmVudCBkb2N1bWVudCBhbmQgYXBwbGllcyBhbGwgcnVsZXMgdG8gaXQuXG4gICAqIEBwYXJhbSB7Q1NTU3R5bGVTaGVldFtdfSBbc3R5bGVzaGVldHNdXG4gICAqICAgIFRoZSBsaXN0IG9mIG5ldyBzdHlsZXNoZWV0cyB0aGF0IGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYW5kXG4gICAqICAgIG1hZGUgcmVwcm9jZXNzaW5nIG5lY2Vzc2FyeS4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkbid0IGJlIHBhc3NlZCBpbiBmb3JcbiAgICogICAgdGhlIGluaXRpYWwgcHJvY2Vzc2luZywgYWxsIG9mIGRvY3VtZW50J3Mgc3R5bGVzaGVldHMgd2lsbCBiZSBjb25zaWRlcmVkXG4gICAqICAgIHRoZW4gYW5kIGFsbCBydWxlcywgaW5jbHVkaW5nIHRoZSBvbmVzIG5vdCBkZXBlbmRlbnQgb24gc3R5bGVzLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIFRoZSBsaXN0IG9mIERPTSBtdXRhdGlvbnMgdGhhdCBoYXZlIGJlZW4gYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYW5kXG4gICAqICAgIG1hZGUgcmVwcm9jZXNzaW5nIG5lY2Vzc2FyeS4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkbid0IGJlIHBhc3NlZCBpbiBmb3JcbiAgICogICAgdGhlIGluaXRpYWwgcHJvY2Vzc2luZywgdGhlIGVudGlyZSBkb2N1bWVudCB3aWxsIGJlIGNvbnNpZGVyZWRcbiAgICogICAgdGhlbiBhbmQgYWxsIHJ1bGVzLCBpbmNsdWRpbmcgdGhlIG9uZXMgbm90IGRlcGVuZGVudCBvbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiAgICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgb25jZSBhbGwgZmlsdGVyaW5nIGlzIGNvbXBsZXRlZFxuICAgKi9cbiAgYXN5bmMgX2FkZFNlbGVjdG9ycyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICB0ZXN0SW5mby5sYXN0UHJvY2Vzc2VkRWxlbWVudHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBsZXQgZGVhZGxpbmUgPSBuZXdJZGxlRGVhZGxpbmUoKTtcblxuICAgIGlmIChzaG91bGRPYnNlcnZlU3R5bGVzKHRoaXMucGF0dGVybnMpKSB7XG4gICAgICB0aGlzLl9yZWZyZXNoUGF0dGVyblN0eWxlcygpO1xuICAgIH1cblxuICAgIGxldCBwYXR0ZXJuc1RvQ2hlY2sgPSBmaWx0ZXJQYXR0ZXJucyhcbiAgICAgIHRoaXMucGF0dGVybnMsIHtzdHlsZXNoZWV0cywgbXV0YXRpb25zfVxuICAgICk7XG5cbiAgICBsZXQgdGFyZ2V0cyA9IGV4dHJhY3RNdXRhdGlvblRhcmdldHMobXV0YXRpb25zKTtcblxuICAgIGNvbnN0IGVsZW1lbnRzVG9IaWRlID0gW107XG4gICAgY29uc3QgZWxlbWVudHNUb0hpZGVGaWx0ZXJzID0gW107XG4gICAgY29uc3QgZWxlbWVudHNUb1JlbW92ZUZpbHRlcnMgPSBbXTtcbiAgICBjb25zdCBlbGVtZW50c1RvUmVtb3ZlID0gW107XG4gICAgY29uc3QgZWxlbWVudHNUb0FwcGx5Q1NTID0gW107XG4gICAgY29uc3QgY3NzUGF0dGVybnMgPSBbXTtcbiAgICBsZXQgZWxlbWVudHNUb1VuaGlkZSA9IG5ldyBTZXQodGhpcy5oaWRkZW5FbGVtZW50cy5rZXlzKCkpO1xuICAgIGZvciAobGV0IHBhdHRlcm4gb2YgcGF0dGVybnNUb0NoZWNrKSB7XG4gICAgICBsZXQgZXZhbHVhdGlvblRhcmdldHMgPSB0YXJnZXRzO1xuXG4gICAgICAvLyBJZiB0aGUgcGF0dGVybiBhcHBlYXJzIHRvIGNvbnRhaW4gYW55IHNpYmxpbmcgY29tYmluYXRvcnMsIHdlIGNhbid0XG4gICAgICAvLyBlYXNpbHkgb3B0aW1pemUgYmFzZWQgb24gdGhlIG11dGF0aW9uIHRhcmdldHMuIFNpbmNlIHRoaXMgaXMgYVxuICAgICAgLy8gc3BlY2lhbCBjYXNlLCBza2lwIHRoZSBvcHRpbWl6YXRpb24uIEJ5IHNldHRpbmcgaXQgdG8gbnVsbCBoZXJlIHdlXG4gICAgICAvLyBtYWtlIHN1cmUgd2UgcHJvY2VzcyB0aGUgZW50aXJlIERPTS5cbiAgICAgIGlmIChwYXR0ZXJuLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMpIHtcbiAgICAgICAgZXZhbHVhdGlvblRhcmdldHMgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBsZXQgZ2VuZXJhdG9yID0gcGF0dGVybi5ldmFsdWF0ZSh0aGlzLmRvY3VtZW50LCBldmFsdWF0aW9uVGFyZ2V0cyk7XG4gICAgICBmb3IgKGxldCBzZWxlY3RvciBvZiBnZW5lcmF0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuLnJlbW92ZSkge1xuICAgICAgICAgICAgICBlbGVtZW50c1RvUmVtb3ZlLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9SZW1vdmVGaWx0ZXJzLnB1c2gocGF0dGVybi50ZXh0KTtcbiAgICAgICAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5kZWxldGUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYXR0ZXJuLmNzcykge1xuICAgICAgICAgICAgICBlbGVtZW50c1RvQXBwbHlDU1MucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgICAgY3NzUGF0dGVybnMucHVzaChwYXR0ZXJuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLmhpZGRlbkVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgICAgICBlbGVtZW50c1RvSGlkZS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgICAgICBlbGVtZW50c1RvSGlkZUZpbHRlcnMucHVzaChwYXR0ZXJuLnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9VbmhpZGUuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWFkbGluZS50aW1lUmVtYWluaW5nKCkgPD0gMCkge1xuICAgICAgICAgIGRlYWRsaW5lID0gYXdhaXQgeWllbGRUaHJlYWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9yZW1vdmVFbGVtcyhlbGVtZW50c1RvUmVtb3ZlLCBlbGVtZW50c1RvUmVtb3ZlRmlsdGVycyk7XG4gICAgdGhpcy5fYXBwbHlDU1NUb0VsZW1zKGVsZW1lbnRzVG9BcHBseUNTUywgY3NzUGF0dGVybnMpO1xuICAgIHRoaXMuX2hpZGVFbGVtcyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudHNUb0hpZGVGaWx0ZXJzKTtcblxuICAgIC8vIFRoZSBzZWFyY2ggZm9yIGVsZW1lbnRzIHRvIGhpZGUgaXQgb3B0aW1pemVkIHRvIGZpbmQgbmV3IHRoaW5nc1xuICAgIC8vIHRvIGhpZGUgcXVpY2tseSwgYnkgbm90IGNoZWNraW5nIGFsbCBwYXR0ZXJucyBhbmQgbm90IGNoZWNraW5nXG4gICAgLy8gdGhlIGZ1bGwgRE9NLiBUaGF0J3Mgd2h5IHdlIG5lZWQgdG8gZG8gYSBtb3JlIHRob3JvdWdoIGNoZWNrXG4gICAgLy8gZm9yIGVhY2ggcmVtYWluaW5nIGVsZW1lbnQgdGhhdCBtaWdodCBuZWVkIHRvIGJlIHVuaGlkZGVuLFxuICAgIC8vIGNoZWNraW5nIGFsbCBwYXR0ZXJucy5cbiAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9VbmhpZGUpIHtcbiAgICAgIGlmICghZWxlbS5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAvLyBlbGVtZW50cyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdGhlIERPTSBzaG91bGQgYmUgdW5oaWRkZW5cbiAgICAgICAgLy8gaW4gY2FzZSB0aGV5J3JlIGV2ZXIgcmVhZGRlZCwgYW5kIHRoZW4gZm9yZ290dGVuIGFib3V0IHNvXG4gICAgICAgIC8vIHdlIGRvbid0IGNhdXNlIGEgbWVtb3J5IGxlYWsuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IG1hdGNoZXNBbnkgPSB0aGlzLnBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1hdGNoZXMoXG4gICAgICAgIGVsZW0sIHRoaXMuZG9jdW1lbnRcbiAgICAgICkpO1xuICAgICAgaWYgKG1hdGNoZXNBbnkpIHtcbiAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5kZWxldGUoZWxlbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWFkbGluZS50aW1lUmVtYWluaW5nKCkgPD0gMCkge1xuICAgICAgICBkZWFkbGluZSA9IGF3YWl0IHlpZWxkVGhyZWFkKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3VuaGlkZUVsZW1zKEFycmF5LmZyb20oZWxlbWVudHNUb1VuaGlkZSkpO1xuICB9XG5cbiAgX3JlbW92ZUVsZW1zKGVsZW1lbnRzVG9SZW1vdmUsIGVsZW1lbnRGaWx0ZXJzKSB7XG4gICAgaWYgKGVsZW1lbnRzVG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmVFbGVtc0Z1bmMoZWxlbWVudHNUb1JlbW92ZSwgZWxlbWVudEZpbHRlcnMpO1xuICAgICAgZm9yIChsZXQgZWxlbSBvZiBlbGVtZW50c1RvUmVtb3ZlKSB7XG4gICAgICAgIC8vIHRoZXkncmUgbm90IGhpZGRlbiBhbnltb3JlIChpZiB0aGV5IGV2ZXIgd2VyZSksIHRoZXkncmVcbiAgICAgICAgLy8gcmVtb3ZlZC4gVGhlcmUncyBubyB1bmhpZGluZyB0aGVzZSBvbmVzIVxuICAgICAgICB0aGlzLmhpZGRlbkVsZW1lbnRzLmRlbGV0ZShlbGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYXBwbHlDU1NUb0VsZW1zKGVsZW1lbnRzLCBjc3NQYXR0ZXJucykge1xuICAgIGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmNzc0VsZW1zRnVuYyhlbGVtZW50cywgY3NzUGF0dGVybnMpO1xuICAgIH1cbiAgfVxuXG4gIF9oaWRlRWxlbXMoZWxlbWVudHNUb0hpZGUsIGVsZW1lbnRGaWx0ZXJzKSB7XG4gICAgaWYgKGVsZW1lbnRzVG9IaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuaGlkZUVsZW1zRnVuYyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudEZpbHRlcnMpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50c1RvSGlkZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmhpZGRlbkVsZW1lbnRzLnNldChlbGVtZW50c1RvSGlkZVtpXSwgZWxlbWVudEZpbHRlcnNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91bmhpZGVFbGVtcyhlbGVtZW50c1RvVW5oaWRlKSB7XG4gICAgaWYgKGVsZW1lbnRzVG9VbmhpZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51bmhpZGVFbGVtc0Z1bmMoZWxlbWVudHNUb1VuaGlkZSk7XG4gICAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9VbmhpZGUpIHtcbiAgICAgICAgdGhpcy5oaWRkZW5FbGVtZW50cy5kZWxldGUoZWxlbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lZCBhbnkgc2NoZWR1bGVkIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgYXN5bmNyb25vdXMsIGFuZCBzaG91bGQgbm90IGJlIHJ1biBtdWx0aXBsZVxuICAgKiB0aW1lcyBpbiBwYXJhbGxlbC4gVGhlIGZsYWcgYF9maWx0ZXJpbmdJblByb2dyZXNzYCBpcyBzZXQgYW5kXG4gICAqIHVuc2V0IHNvIHlvdSBjYW4gY2hlY2sgaWYgaXQncyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgb25jZSBhbGwgZmlsdGVyaW5nIGlzIGNvbXBsZXRlZFxuICAgKi9cbiAgYXN5bmMgX3Byb2Nlc3NGaWx0ZXJpbmcoKSB7XG4gICAgaWYgKHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIkVsZW1IaWRlRW11bGF0aW9uIHNjaGVkdWxpbmcgZXJyb3I6IFwiICtcbiAgICAgICAgICAgICAgICAgICBcIlRyaWVkIHRvIHByb2Nlc3MgZmlsdGVyaW5nIGluIHBhcmFsbGVsLlwiKTtcbiAgICAgIGlmICh0ZXN0SW5mbykge1xuICAgICAgICB0ZXN0SW5mby5mYWlsZWRBc3NlcnRpb25zLnB1c2goXG4gICAgICAgICAgXCJUcmllZCB0byBwcm9jZXNzIGZpbHRlcmluZyBpbiBwYXJhbGxlbFwiXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1zID0gdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyB8fCB7fTtcbiAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0gbnVsbDtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gdHJ1ZTtcbiAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgYXdhaXQgdGhpcy5fYWRkU2VsZWN0b3JzKFxuICAgICAgcGFyYW1zLnN0eWxlc2hlZXRzLFxuICAgICAgcGFyYW1zLm11dGF0aW9uc1xuICAgICk7XG4gICAgdGhpcy5fbGFzdEludm9jYXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcpIHtcbiAgICAgIHRoaXMuX3NjaGVkdWxlTmV4dEZpbHRlcmluZygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIG5ldyBjaGFuZ2VzIHRvIHRoZSBsaXN0IG9mIGZpbHRlcnMgZm9yIHRoZSBuZXh0IHRpbWVcbiAgICogZmlsdGVyaW5nIGlzIHJ1bi5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgbmV3IHN0eWxlc2hlZXRzIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIG5ldyBET00gbXV0YXRpb25zIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKi9cbiAgX2FwcGVuZFNjaGVkdWxlZFByb2Nlc3Npbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucykge1xuICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZykge1xuICAgICAgLy8gVGhlcmUgaXNuJ3QgYW55dGhpbmcgc2NoZWR1bGVkIHlldC4gTWFrZSB0aGUgc2NoZWR1bGUuXG4gICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0ge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9O1xuICAgIH1cbiAgICBlbHNlIGlmICghc3R5bGVzaGVldHMgJiYgIW11dGF0aW9ucykge1xuICAgICAgLy8gVGhlIG5ldyByZXF1ZXN0IHdhcyB0byByZXByb2Nlc3MgZXZlcnl0aGluZywgYW5kIHNvIGFueVxuICAgICAgLy8gcHJldmlvdXMgZmlsdGVycyBhcmUgaXJyZWxldmFudC5cbiAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSB7fTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cyB8fFxuICAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zKSB7XG4gICAgICAvLyBUaGUgcHJldmlvdXMgZmlsdGVycyBhcmUgbm90IHRvIGZpbHRlciBldmVyeXRoaW5nLCBzbyB0aGUgbmV3XG4gICAgICAvLyBwYXJhbWV0ZXJzIG1hdHRlci4gUHVzaCB0aGVtIG9udG8gdGhlIGFwcHJvcHJpYXRlIGxpc3RzLlxuICAgICAgaWYgKHN0eWxlc2hlZXRzKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cykge1xuICAgICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzLnB1c2goLi4uc3R5bGVzaGVldHMpO1xuICAgICAgfVxuICAgICAgaWYgKG11dGF0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zKSB7XG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucy5wdXNoKC4uLm11dGF0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyBpcyBhbHJlYWR5IGdvaW5nIHRvIHJlY2hlY2tcbiAgICAgIC8vIGV2ZXJ5dGhpbmcsIHNvIG5vIG5lZWQgdG8gZG8gYW55dGhpbmcgaGVyZS5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGUgZmlsdGVyaW5nIHRvIGJlIHByb2Nlc3NlZCBpbiB0aGUgZnV0dXJlLCBvciBzdGFydFxuICAgKiBwcm9jZXNzaW5nIGltbWVkaWF0ZWx5LlxuICAgKlxuICAgKiBJZiBwcm9jZXNzaW5nIGlzIGFscmVhZHkgc2NoZWR1bGVkLCB0aGlzIGRvZXMgbm90aGluZy5cbiAgICovXG4gIF9zY2hlZHVsZU5leHRGaWx0ZXJpbmcoKSB7XG4gICAgaWYgKHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgfHwgdGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcykge1xuICAgICAgLy8gVGhlIG5leHQgb25lIGhhcyBhbHJlYWR5IGJlZW4gc2NoZWR1bGVkLiBPdXIgbmV3IGV2ZW50cyBhcmVcbiAgICAgIC8vIG9uIHRoZSBxdWV1ZSwgc28gbm90aGluZyBtb3JlIHRvIGRvLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICAvLyBEb2N1bWVudCBpc24ndCBmdWxseSBsb2FkZWQgeWV0LCBzbyBzY2hlZHVsZSBvdXIgZmlyc3RcbiAgICAgIC8vIGZpbHRlcmluZyBhcyBzb29uIGFzIHRoYXQncyBkb25lLlxuICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcIkRPTUNvbnRlbnRMb2FkZWRcIixcbiAgICAgICAgKCkgPT4gdGhpcy5fcHJvY2Vzc0ZpbHRlcmluZygpLFxuICAgICAgICB7b25jZTogdHJ1ZX1cbiAgICAgICk7XG4gICAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9sYXN0SW52b2NhdGlvbiA8XG4gICAgICAgICAgICAgbWluSW52b2NhdGlvbkludGVydmFsKSB7XG4gICAgICAvLyBJdCBoYXNuJ3QgYmVlbiBsb25nIGVub3VnaCBzaW5jZSBvdXIgbGFzdCBmaWx0ZXIuIFNldCB0aGVcbiAgICAgIC8vIHRpbWVvdXQgZm9yIHdoZW4gaXQncyB0aW1lIGZvciB0aGF0LlxuICAgICAgc2V0VGltZW91dChcbiAgICAgICAgKCkgPT4gdGhpcy5fcHJvY2Vzc0ZpbHRlcmluZygpLFxuICAgICAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgLSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9sYXN0SW52b2NhdGlvbilcbiAgICAgICk7XG4gICAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBXZSBjYW4gYWN0dWFsbHkganVzdCBzdGFydCBmaWx0ZXJpbmcgaW1tZWRpYXRlbHkhXG4gICAgICB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlLXJ1biBmaWx0ZXJpbmcgZWl0aGVyIGltbWVkaWF0ZWx5IG9yIHF1ZXVlZC5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgbmV3IHN0eWxlc2hlZXRzIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIG5ldyBET00gbXV0YXRpb25zIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKi9cbiAgcXVldWVGaWx0ZXJpbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucykge1xuICAgIHRoaXMuX2FwcGVuZFNjaGVkdWxlZFByb2Nlc3Npbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucyk7XG4gICAgdGhpcy5fc2NoZWR1bGVOZXh0RmlsdGVyaW5nKCk7XG4gIH1cblxuICBfcmVmcmVzaFBhdHRlcm5TdHlsZXMoc3R5bGVzaGVldCkge1xuICAgIGxldCBhbGxDc3NSdWxlcyA9IHRoaXMuX3JlYWRDc3NSdWxlcyh0aGlzLmRvY3VtZW50LnN0eWxlU2hlZXRzKTtcbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIHRoaXMucGF0dGVybnMpIHtcbiAgICAgIHBhdHRlcm4uc2V0U3R5bGVzKGFsbENzc1J1bGVzKTtcbiAgICB9XG4gIH1cblxuICBvbkxvYWQoZXZlbnQpIHtcbiAgICBsZXQgc3R5bGVzaGVldCA9IGV2ZW50LnRhcmdldC5zaGVldDtcbiAgICBpZiAoc3R5bGVzaGVldCkge1xuICAgICAgdGhpcy5xdWV1ZUZpbHRlcmluZyhbc3R5bGVzaGVldF0pO1xuICAgIH1cbiAgfVxuXG4gIG9ic2VydmUobXV0YXRpb25zKSB7XG4gICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAvLyBJbiB0ZXN0IG1vZGUsIGZpbHRlciBvdXQgYW55IG11dGF0aW9ucyBsaWtlbHkgZG9uZSBieSB1c1xuICAgICAgLy8gKGkuZS4gc3R5bGU9XCJkaXNwbGF5OiBub25lICFpbXBvcnRhbnRcIikuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAgICAvLyBvYnNlcnZlIGhvdyB0aGUgY29kZSByZXNwb25kcyB0byBET00gbXV0YXRpb25zLlxuICAgICAgbXV0YXRpb25zID0gbXV0YXRpb25zLmZpbHRlcihcbiAgICAgICAgKHt0eXBlLCBhdHRyaWJ1dGVOYW1lLCB0YXJnZXQ6IHtzdHlsZTogbmV3VmFsdWV9LCBvbGRWYWx1ZX0pID0+XG4gICAgICAgICAgISh0eXBlID09IFwiYXR0cmlidXRlc1wiICYmIGF0dHJpYnV0ZU5hbWUgPT0gXCJzdHlsZVwiICYmXG4gICAgICAgICAgICBuZXdWYWx1ZS5kaXNwbGF5ID09IFwibm9uZVwiICYmXG4gICAgICAgICAgICB0b0NTU1N0eWxlRGVjbGFyYXRpb24ob2xkVmFsdWUpLmRpc3BsYXkgIT0gXCJub25lXCIpXG4gICAgICApO1xuXG4gICAgICBpZiAobXV0YXRpb25zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKG51bGwsIG11dGF0aW9ucyk7XG4gIH1cblxuICBhcHBseShwYXR0ZXJucykge1xuICAgIGlmICh0aGlzLnBhdHRlcm5zKSB7XG4gICAgICBsZXQgcmVtb3ZlZFBhdHRlcm5zID0gW107XG4gICAgICBmb3IgKGxldCBvbGRQYXR0ZXJuIG9mIHRoaXMucGF0dGVybnMpIHtcbiAgICAgICAgaWYgKCFwYXR0ZXJucy5maW5kKG5ld1BhdHRlcm4gPT4gbmV3UGF0dGVybi50ZXh0ID09IG9sZFBhdHRlcm4udGV4dCkpIHtcbiAgICAgICAgICByZW1vdmVkUGF0dGVybnMucHVzaChvbGRQYXR0ZXJuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGVsZW1lbnRzVG9VbmhpZGUgPSBbXTtcbiAgICAgIGZvciAobGV0IHBhdHRlcm4gb2YgcmVtb3ZlZFBhdHRlcm5zKSB7XG4gICAgICAgIGZvciAobGV0IFtlbGVtZW50LCBmaWx0ZXJdIG9mIHRoaXMuaGlkZGVuRWxlbWVudHMpIHtcbiAgICAgICAgICBpZiAoZmlsdGVyID09IHBhdHRlcm4udGV4dCkge1xuICAgICAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnRzVG9VbmhpZGUubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl91bmhpZGVFbGVtcyhlbGVtZW50c1RvVW5oaWRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBhdHRlcm5zID0gW107XG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgbGV0IHNlbGVjdG9ycyA9IHRoaXMucGFyc2VTZWxlY3RvcihwYXR0ZXJuLnNlbGVjdG9yKTtcbiAgICAgIGlmIChzZWxlY3RvcnMgIT0gbnVsbCAmJiBzZWxlY3RvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnBhdHRlcm5zLnB1c2goXG4gICAgICAgICAgbmV3IFBhdHRlcm4oc2VsZWN0b3JzLCBwYXR0ZXJuLnRleHQsIHBhdHRlcm4ucmVtb3ZlLCBwYXR0ZXJuLmNzcylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYXR0ZXJucy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKCk7XG5cbiAgICAgIGxldCBhdHRyaWJ1dGVzID0gc2hvdWxkT2JzZXJ2ZUF0dHJpYnV0ZXModGhpcy5wYXR0ZXJucyk7XG4gICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoXG4gICAgICAgIHRoaXMuZG9jdW1lbnQsXG4gICAgICAgIHtcbiAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogYXR0cmlidXRlcyAmJiAhIXRlc3RJbmZvLFxuICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHNob3VsZE9ic2VydmVDaGFyYWN0ZXJEYXRhKHRoaXMucGF0dGVybnMpLFxuICAgICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGlmIChzaG91bGRPYnNlcnZlU3R5bGVzKHRoaXMucGF0dGVybnMpKSB7XG4gICAgICAgIGxldCBvbkxvYWQgPSB0aGlzLm9uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5kb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgb25Mb2FkLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLl91bmhpZGVFbGVtcyhBcnJheS5mcm9tKHRoaXMuaGlkZGVuRWxlbWVudHMua2V5cygpKSk7XG4gIH1cbn07XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQWRibG9jayBQbHVzIDxodHRwczovL2FkYmxvY2twbHVzLm9yZy8+LFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEFkYmxvY2sgUGx1cy4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiogQG1vZHVsZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgcGF0dGVybnMgdGhhdFxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnMuY29tcGlsZVBhdHRlcm5zIGNvbXBpbGVQYXR0ZXJucygpfWAgd2lsbCBjb21waWxlXG4gKiBpbnRvIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5jb25zdCBDT01QSUxFX1BBVFRFUk5TX01BWCA9IDEwMDtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBtYXRjaCB0aGUgYF5gIHN1ZmZpeCBpbiBhbiBvdGhlcndpc2UgbGl0ZXJhbFxuICogcGF0dGVybi5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBzZXBhcmF0b3JSZWdFeHAgPSAvW1xceDAwLVxceDI0XFx4MjYtXFx4MkNcXHgyRlxceDNBLVxceDQwXFx4NUItXFx4NUVcXHg2MFxceDdCLVxceDdGXS87XG5cbmxldCBmaWx0ZXJUb1JlZ0V4cCA9XG4vKipcbiAqIENvbnZlcnRzIGZpbHRlciB0ZXh0IGludG8gcmVndWxhciBleHByZXNzaW9uIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgYXMgaW4gRmlsdGVyKClcbiAqIEByZXR1cm4ge3N0cmluZ30gcmVndWxhciBleHByZXNzaW9uIHJlcHJlc2VudGF0aW9uIG9mIGZpbHRlciB0ZXh0XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLmZpbHRlclRvUmVnRXhwID0gZnVuY3Rpb24gZmlsdGVyVG9SZWdFeHAodGV4dCkge1xuICAvLyByZW1vdmUgbXVsdGlwbGUgd2lsZGNhcmRzXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcKisvZywgXCIqXCIpO1xuXG4gIC8vIHJlbW92ZSBsZWFkaW5nIHdpbGRjYXJkXG4gIGlmICh0ZXh0WzBdID09IFwiKlwiKSB7XG4gICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHRyYWlsaW5nIHdpbGRjYXJkXG4gIGlmICh0ZXh0W3RleHQubGVuZ3RoIC0gMV0gPT0gXCIqXCIpIHtcbiAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiB0ZXh0XG4gICAgLy8gcmVtb3ZlIGFuY2hvcnMgZm9sbG93aW5nIHNlcGFyYXRvciBwbGFjZWhvbGRlclxuICAgIC5yZXBsYWNlKC9cXF5cXHwkLywgXCJeXCIpXG4gICAgLy8gZXNjYXBlIHNwZWNpYWwgc3ltYm9sc1xuICAgIC5yZXBsYWNlKC9cXFcvZywgXCJcXFxcJCZcIilcbiAgICAvLyByZXBsYWNlIHdpbGRjYXJkcyBieSAuKlxuICAgIC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIilcbiAgICAvLyBwcm9jZXNzIHNlcGFyYXRvciBwbGFjZWhvbGRlcnMgKGFsbCBBTlNJIGNoYXJhY3RlcnMgYnV0IGFscGhhbnVtZXJpY1xuICAgIC8vIGNoYXJhY3RlcnMgYW5kIF8lLi0pXG4gICAgLnJlcGxhY2UoL1xcXFxcXF4vZywgYCg/OiR7c2VwYXJhdG9yUmVnRXhwLnNvdXJjZX18JClgKVxuICAgIC8vIHByb2Nlc3MgZXh0ZW5kZWQgYW5jaG9yIGF0IGV4cHJlc3Npb24gc3RhcnRcbiAgICAucmVwbGFjZSgvXlxcXFxcXHxcXFxcXFx8LywgXCJeW1xcXFx3XFxcXC1dKzpcXFxcLysoPzpbXlxcXFwvXStcXFxcLik/XCIpXG4gICAgLy8gcHJvY2VzcyBhbmNob3IgYXQgZXhwcmVzc2lvbiBzdGFydFxuICAgIC5yZXBsYWNlKC9eXFxcXFxcfC8sIFwiXlwiKVxuICAgIC8vIHByb2Nlc3MgYW5jaG9yIGF0IGV4cHJlc3Npb24gZW5kXG4gICAgLnJlcGxhY2UoL1xcXFxcXHwkLywgXCIkXCIpO1xufTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBtYXRjaCB0aGUgYHx8YCBwcmVmaXggaW4gYW4gb3RoZXJ3aXNlIGxpdGVyYWxcbiAqIHBhdHRlcm4uXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQgZXh0ZW5kZWRBbmNob3JSZWdFeHAgPSBuZXcgUmVnRXhwKGZpbHRlclRvUmVnRXhwKFwifHxcIikgKyBcIiRcIik7XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBhIGtleXdvcmQgaW4gYSBmaWx0ZXIuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQga2V5d29yZFJlZ0V4cCA9IC9bXmEtejAtOSUqXVthLXowLTklXXsyLH0oPz1bXmEtejAtOSUqXSkvO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgbWF0Y2hpbmcgYWxsIGtleXdvcmRzIGluIGEgZmlsdGVyLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IGFsbEtleXdvcmRzUmVnRXhwID0gbmV3IFJlZ0V4cChrZXl3b3JkUmVnRXhwLCBcImdcIik7XG5cbi8qKlxuICogQSBgQ29tcGlsZWRQYXR0ZXJuc2Agb2JqZWN0IHJlcHJlc2VudHMgdGhlIGNvbXBpbGVkIHZlcnNpb24gb2YgbXVsdGlwbGUgVVJMXG4gKiByZXF1ZXN0IHBhdHRlcm5zLiBJdCBpcyByZXR1cm5lZCBieVxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnMuY29tcGlsZVBhdHRlcm5zIGNvbXBpbGVQYXR0ZXJucygpfWAuXG4gKi9cbmNsYXNzIENvbXBpbGVkUGF0dGVybnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9ucyBmb3IgY2FzZS1zZW5zaXRpdmVcbiAgICogYW5kIGNhc2UtaW5zZW5zaXRpdmUgbWF0Y2hpbmcgcmVzcGVjdGl2ZWx5LlxuICAgKiBAcGFyYW0gez9SZWdFeHB9IFtjYXNlU2Vuc2l0aXZlXVxuICAgKiBAcGFyYW0gez9SZWdFeHB9IFtjYXNlSW5zZW5zaXRpdmVdXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjYXNlU2Vuc2l0aXZlLCBjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICB0aGlzLl9jYXNlU2Vuc2l0aXZlID0gY2FzZVNlbnNpdGl2ZTtcbiAgICB0aGlzLl9jYXNlSW5zZW5zaXRpdmUgPSBjYXNlSW5zZW5zaXRpdmU7XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgd2hldGhlciB0aGUgZ2l2ZW4gVVJMIHJlcXVlc3QgbWF0Y2hlcyB0aGUgcGF0dGVybnMgdXNlZCB0byBjcmVhdGVcbiAgICogdGhpcyBvYmplY3QuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkxSZXF1ZXN0fSByZXF1ZXN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgdGVzdChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuICgodGhpcy5fY2FzZVNlbnNpdGl2ZSAmJlxuICAgICAgICAgICAgIHRoaXMuX2Nhc2VTZW5zaXRpdmUudGVzdChyZXF1ZXN0LmhyZWYpKSB8fFxuICAgICAgICAgICAgKHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZSAmJlxuICAgICAgICAgICAgIHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZS50ZXN0KHJlcXVlc3QubG93ZXJDYXNlSHJlZikpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGVzIHBhdHRlcm5zIGZyb20gdGhlIGdpdmVuIGZpbHRlcnMgaW50byBhIHNpbmdsZVxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnN+Q29tcGlsZWRQYXR0ZXJucyBDb21waWxlZFBhdHRlcm5zfWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOmZpbHRlckNsYXNzZXMuVVJMRmlsdGVyfFxuICogICAgICAgICBTZXQuPG1vZHVsZTpmaWx0ZXJDbGFzc2VzLlVSTEZpbHRlcj59IGZpbHRlcnNcbiAqICAgVGhlIGZpbHRlcnMuIElmIHRoZSBudW1iZXIgb2YgZmlsdGVycyBleGNlZWRzXG4gKiAgIGB7QGxpbmsgbW9kdWxlOnBhdHRlcm5zfkNPTVBJTEVfUEFUVEVSTlNfTUFYIENPTVBJTEVfUEFUVEVSTlNfTUFYfWAsIHRoZVxuICogICBmdW5jdGlvbiByZXR1cm5zIGBudWxsYC5cbiAqXG4gKiBAcmV0dXJucyB7P21vZHVsZTpwYXR0ZXJuc35Db21waWxlZFBhdHRlcm5zfVxuICpcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMuY29tcGlsZVBhdHRlcm5zID0gZnVuY3Rpb24gY29tcGlsZVBhdHRlcm5zKGZpbHRlcnMpIHtcbiAgbGV0IGxpc3QgPSBBcnJheS5pc0FycmF5KGZpbHRlcnMpID8gZmlsdGVycyA6IFtmaWx0ZXJzXTtcblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGZpbHRlcnMgaXMgdG9vIGxhcmdlLCBpdCBtYXkgY2hva2UgZXNwZWNpYWxseSBvbiBsb3ctZW5kXG4gIC8vIHBsYXRmb3Jtcy4gQXMgYSBwcmVjYXV0aW9uLCB3ZSByZWZ1c2UgdG8gY29tcGlsZS4gSWRlYWxseSB3ZSB3b3VsZCBjaGVja1xuICAvLyB0aGUgbGVuZ3RoIG9mIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gc291cmNlIHJhdGhlciB0aGFuIHRoZSBudW1iZXIgb2ZcbiAgLy8gZmlsdGVycywgYnV0IHRoaXMgaXMgZmFyIG1vcmUgc3RyYWlnaHRmb3J3YXJkIGFuZCBwcmFjdGljYWwuXG4gIGlmIChsaXN0Lmxlbmd0aCA+IENPTVBJTEVfUEFUVEVSTlNfTUFYKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgY2FzZVNlbnNpdGl2ZSA9IFwiXCI7XG4gIGxldCBjYXNlSW5zZW5zaXRpdmUgPSBcIlwiO1xuXG4gIGZvciAobGV0IGZpbHRlciBvZiBmaWx0ZXJzKSB7XG4gICAgbGV0IHNvdXJjZSA9IGZpbHRlci51cmxQYXR0ZXJuLnJlZ2V4cFNvdXJjZTtcblxuICAgIGlmIChmaWx0ZXIubWF0Y2hDYXNlKSB7XG4gICAgICBjYXNlU2Vuc2l0aXZlICs9IHNvdXJjZSArIFwifFwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNhc2VJbnNlbnNpdGl2ZSArPSBzb3VyY2UgKyBcInxcIjtcbiAgICB9XG4gIH1cblxuICBsZXQgY2FzZVNlbnNpdGl2ZVJlZ0V4cCA9IG51bGw7XG4gIGxldCBjYXNlSW5zZW5zaXRpdmVSZWdFeHAgPSBudWxsO1xuXG4gIHRyeSB7XG4gICAgaWYgKGNhc2VTZW5zaXRpdmUpIHtcbiAgICAgIGNhc2VTZW5zaXRpdmVSZWdFeHAgPSBuZXcgUmVnRXhwKGNhc2VTZW5zaXRpdmUuc2xpY2UoMCwgLTEpKTtcbiAgICB9XG5cbiAgICBpZiAoY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgICBjYXNlSW5zZW5zaXRpdmVSZWdFeHAgPSBuZXcgUmVnRXhwKGNhc2VJbnNlbnNpdGl2ZS5zbGljZSgwLCAtMSkpO1xuICAgIH1cbiAgfVxuICBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJdCBpcyBwb3NzaWJsZSBpbiB0aGVvcnkgZm9yIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gYmUgdG9vIGxhcmdlXG4gICAgLy8gZGVzcGl0ZSBDT01QSUxFX1BBVFRFUk5TX01BWFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDb21waWxlZFBhdHRlcm5zKGNhc2VTZW5zaXRpdmVSZWdFeHAsIGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCk7XG59O1xuXG4vKipcbiAqIFBhdHRlcm5zIGZvciBtYXRjaGluZyBhZ2FpbnN0IFVSTHMuXG4gKlxuICogSW50ZXJuYWxseSwgdGhpcyBtYXkgYmUgYSBSZWdFeHAgb3IgbWF0Y2ggZGlyZWN0bHkgYWdhaW5zdCB0aGVcbiAqIHBhdHRlcm4gZm9yIHNpbXBsZSBsaXRlcmFsIHBhdHRlcm5zLlxuICovXG5leHBvcnRzLlBhdHRlcm4gPSBjbGFzcyBQYXR0ZXJuIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIHBhdHRlcm4gdGhhdCByZXF1ZXN0cyBVUkxzIHNob3VsZCBiZVxuICAgKiBtYXRjaGVkIGFnYWluc3QgaW4gZmlsdGVyIHRleHQgbm90YXRpb25cbiAgICogQHBhcmFtIHtib29sfSBtYXRjaENhc2UgYHRydWVgIGlmIGNvbXBhcmlzb25zIG11c3QgYmUgY2FzZVxuICAgKiBzZW5zaXRpdmVcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdHRlcm4sIG1hdGNoQ2FzZSkge1xuICAgIHRoaXMubWF0Y2hDYXNlID0gbWF0Y2hDYXNlIHx8IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLm1hdGNoQ2FzZSkge1xuICAgICAgcGF0dGVybiA9IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAocGF0dGVybi5sZW5ndGggPj0gMiAmJlxuICAgICAgICBwYXR0ZXJuWzBdID09IFwiL1wiICYmXG4gICAgICAgIHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLSAxXSA9PSBcIi9cIikge1xuICAgICAgLy8gVGhlIGZpbHRlciBpcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiAtIGNvbnZlcnQgaXQgaW1tZWRpYXRlbHkgdG9cbiAgICAgIC8vIGNhdGNoIHN5bnRheCBlcnJvcnNcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cmluZygxLCBwYXR0ZXJuLmxlbmd0aCAtIDEpO1xuICAgICAgdGhpcy5fcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBQYXR0ZXJucyBsaWtlIC9mb28vYmFyLyogZXhpc3Qgc28gdGhhdCB0aGV5IGFyZSBub3QgdHJlYXRlZCBhcyByZWd1bGFyXG4gICAgICAvLyBleHByZXNzaW9ucy4gV2UgZHJvcCBhbnkgc3VwZXJmbHVvdXMgd2lsZGNhcmRzIGhlcmUgc28gb3VyXG4gICAgICAvLyBvcHRpbWl6YXRpb25zIGNhbiBraWNrIGluLlxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZSgvXlxcKisvLCBcIlwiKS5yZXBsYWNlKC9cXCorJC8sIFwiXCIpO1xuXG4gICAgICAvLyBObyBuZWVkIHRvIGNvbnZlcnQgdGhpcyBmaWx0ZXIgdG8gcmVndWxhciBleHByZXNzaW9uIHlldCwgZG8gaXQgb25cbiAgICAgIC8vIGRlbWFuZFxuICAgICAgdGhpcy5wYXR0ZXJuID0gcGF0dGVybjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhdHRlcm4gaXMgYSBzdHJpbmcgb2YgbGl0ZXJhbCBjaGFyYWN0ZXJzIHdpdGhcbiAgICogbm8gd2lsZGNhcmRzIG9yIGFueSBvdGhlciBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gICAqXG4gICAqIElmIHRoZSBwYXR0ZXJuIGlzIHByZWZpeGVkIHdpdGggYSBgfHxgIG9yIHN1ZmZpeGVkIHdpdGggYSBgXmAgYnV0IG90aGVyd2lzZVxuICAgKiBjb250YWlucyBubyBzcGVjaWFsIGNoYXJhY3RlcnMsIGl0IGlzIHN0aWxsIGNvbnNpZGVyZWQgdG8gYmUgYSBsaXRlcmFsXG4gICAqIHBhdHRlcm4uXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNMaXRlcmFsUGF0dGVybigpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMucGF0dGVybiAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgIS9bKl58XS8udGVzdCh0aGlzLnBhdHRlcm4ucmVwbGFjZSgvXlxcfHsxLDJ9LywgXCJcIikucmVwbGFjZSgvW3xeXSQvLCBcIlwiKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRvIGJlIHVzZWQgd2hlbiB0ZXN0aW5nIGFnYWluc3QgdGhpcyBwYXR0ZXJuLlxuICAgKlxuICAgKiBudWxsIGlmIHRoZSBwYXR0ZXJuIGlzIG1hdGNoZWQgd2l0aG91dCB1c2luZyByZWd1bGFyIGV4cHJlc3Npb25zLlxuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgZ2V0IHJlZ2V4cCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3JlZ2V4cCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLl9yZWdleHAgPSB0aGlzLmlzTGl0ZXJhbFBhdHRlcm4oKSA/XG4gICAgICAgIG51bGwgOiBuZXcgUmVnRXhwKGZpbHRlclRvUmVnRXhwKHRoaXMucGF0dGVybikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVnZXhwO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdHRlcm4gaW4gcmVndWxhciBleHByZXNzaW9uIG5vdGF0aW9uLiBUaGlzIHdpbGwgaGF2ZSBhIHZhbHVlXG4gICAqIGV2ZW4gaWYgYHJlZ2V4cGAgcmV0dXJucyBudWxsLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IHJlZ2V4cFNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVnZXhwID8gdGhpcy5fcmVnZXhwLnNvdXJjZSA6IGZpbHRlclRvUmVnRXhwKHRoaXMucGF0dGVybik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIFVSTCByZXF1ZXN0IG1hdGNoZXMgdGhpcyBmaWx0ZXIncyBwYXR0ZXJuLlxuICAgKiBAcGFyYW0ge21vZHVsZTp1cmwuVVJMUmVxdWVzdH0gcmVxdWVzdCBUaGUgVVJMIHJlcXVlc3QgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIFVSTCByZXF1ZXN0IG1hdGNoZXMuXG4gICAqL1xuICBtYXRjaGVzTG9jYXRpb24ocmVxdWVzdCkge1xuICAgIGxldCBsb2NhdGlvbiA9IHRoaXMubWF0Y2hDYXNlID8gcmVxdWVzdC5ocmVmIDogcmVxdWVzdC5sb3dlckNhc2VIcmVmO1xuICAgIGxldCByZWdleHAgPSB0aGlzLnJlZ2V4cDtcbiAgICBpZiAocmVnZXhwKSB7XG4gICAgICByZXR1cm4gcmVnZXhwLnRlc3QobG9jYXRpb24pO1xuICAgIH1cblxuICAgIGxldCBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuO1xuICAgIGxldCBzdGFydHNXaXRoQW5jaG9yID0gcGF0dGVyblswXSA9PSBcInxcIjtcbiAgICBsZXQgc3RhcnRzV2l0aEV4dGVuZGVkQW5jaG9yID0gc3RhcnRzV2l0aEFuY2hvciAmJiBwYXR0ZXJuWzFdID09IFwifFwiO1xuICAgIGxldCBlbmRzV2l0aFNlcGFyYXRvciA9IHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLSAxXSA9PSBcIl5cIjtcbiAgICBsZXQgZW5kc1dpdGhBbmNob3IgPSAhZW5kc1dpdGhTZXBhcmF0b3IgJiZcbiAgICAgICAgcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwifFwiO1xuXG4gICAgaWYgKHN0YXJ0c1dpdGhFeHRlbmRlZEFuY2hvcikge1xuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDIpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzdGFydHNXaXRoQW5jaG9yKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMSk7XG4gICAgfVxuXG4gICAgaWYgKGVuZHNXaXRoU2VwYXJhdG9yIHx8IGVuZHNXaXRoQW5jaG9yKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zbGljZSgwLCAtMSk7XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gbG9jYXRpb24uaW5kZXhPZihwYXR0ZXJuKTtcblxuICAgIHdoaWxlIChpbmRleCAhPSAtMSkge1xuICAgICAgLy8gVGhlIFwifHxcIiBwcmVmaXggcmVxdWlyZXMgdGhhdCB0aGUgdGV4dCB0aGF0IGZvbGxvd3MgZG9lcyBub3Qgc3RhcnRcbiAgICAgIC8vIHdpdGggYSBmb3J3YXJkIHNsYXNoLlxuICAgICAgaWYgKChzdGFydHNXaXRoRXh0ZW5kZWRBbmNob3IgP1xuICAgICAgICAgICBsb2NhdGlvbltpbmRleF0gIT0gXCIvXCIgJiZcbiAgICAgICAgICAgZXh0ZW5kZWRBbmNob3JSZWdFeHAudGVzdChsb2NhdGlvbi5zdWJzdHJpbmcoMCwgaW5kZXgpKSA6XG4gICAgICAgICAgIHN0YXJ0c1dpdGhBbmNob3IgP1xuICAgICAgICAgICBpbmRleCA9PSAwIDpcbiAgICAgICAgICAgdHJ1ZSkgJiZcbiAgICAgICAgICAoZW5kc1dpdGhTZXBhcmF0b3IgP1xuICAgICAgICAgICAhbG9jYXRpb25baW5kZXggKyBwYXR0ZXJuLmxlbmd0aF0gfHxcbiAgICAgICAgICAgc2VwYXJhdG9yUmVnRXhwLnRlc3QobG9jYXRpb25baW5kZXggKyBwYXR0ZXJuLmxlbmd0aF0pIDpcbiAgICAgICAgICAgZW5kc1dpdGhBbmNob3IgP1xuICAgICAgICAgICBpbmRleCA9PSBsb2NhdGlvbi5sZW5ndGggLSBwYXR0ZXJuLmxlbmd0aCA6XG4gICAgICAgICAgIHRydWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0dGVybiA9PSBcIlwiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpbmRleCA9IGxvY2F0aW9uLmluZGV4T2YocGF0dGVybiwgaW5kZXggKyAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhdHRlcm4gaGFzIGtleXdvcmRzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaGFzS2V5d29yZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0dGVybiAmJiBrZXl3b3JkUmVnRXhwLnRlc3QodGhpcy5wYXR0ZXJuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwga2V5d29yZHMgdGhhdCBjb3VsZCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwYXR0ZXJuXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICovXG4gIGtleXdvcmRDYW5kaWRhdGVzKCkge1xuICAgIGlmICghdGhpcy5wYXR0ZXJuKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGF0dGVybi50b0xvd2VyQ2FzZSgpLm1hdGNoKGFsbEtleXdvcmRzUmVnRXhwKTtcbiAgfVxufTtcbiIsIi8qIEBAcGFja2FnZV9uYW1lIC0gdkBAdmVyc2lvbiAtIEBAdGltZXN0YW1wICovXG4vKiAtKi0gTW9kZTogaW5kZW50LXRhYnMtbW9kZTogbmlsOyBqcy1pbmRlbnQtbGV2ZWw6IDIgLSotICovXG4vKiB2aW06IHNldCBzdHM9MiBzdz0yIGV0IHR3PTgwOiAqL1xuLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICogTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpc1xuICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5pZiAoIShnbG9iYWxUaGlzLmNocm9tZSAmJiBnbG9iYWxUaGlzLmNocm9tZS5ydW50aW1lICYmIGdsb2JhbFRoaXMuY2hyb21lLnJ1bnRpbWUuaWQpKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2NyaXB0IHNob3VsZCBvbmx5IGJlIGxvYWRlZCBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlwiKTtcbn1cblxuaWYgKCEoZ2xvYmFsVGhpcy5icm93c2VyICYmIGdsb2JhbFRoaXMuYnJvd3Nlci5ydW50aW1lICYmIGdsb2JhbFRoaXMuYnJvd3Nlci5ydW50aW1lLmlkKSkge1xuICBjb25zdCBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgPSBcIlRoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cIjtcblxuICAvLyBXcmFwcGluZyB0aGUgYnVsayBvZiB0aGlzIHBvbHlmaWxsIGluIGEgb25lLXRpbWUtdXNlIGZ1bmN0aW9uIGlzIGEgbWlub3JcbiAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gIC8vIGNvbnRlbnRzIG9mIGEgZnVuY3Rpb24gdW50aWwgdGhlIGZpcnN0IHRpbWUgaXQncyBjYWxsZWQsIGFuZCBzaW5jZSBpdCB3aWxsXG4gIC8vIG5ldmVyIGFjdHVhbGx5IG5lZWQgdG8gYmUgY2FsbGVkLCB0aGlzIGFsbG93cyB0aGUgcG9seWZpbGwgdG8gYmUgaW5jbHVkZWRcbiAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG4gIGNvbnN0IHdyYXBBUElzID0gZXh0ZW5zaW9uQVBJcyA9PiB7XG4gICAgLy8gTk9URTogYXBpTWV0YWRhdGEgaXMgYXNzb2NpYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgYXBpLW1ldGFkYXRhLmpzb24gZmlsZVxuICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAvLyBKU09OIGZpbGUuXG4gICAgY29uc3QgYXBpTWV0YWRhdGEgPSByZXF1aXJlKFwiLi4vYXBpLW1ldGFkYXRhLmpzb25cIik7XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoYXBpTWV0YWRhdGEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXBpLW1ldGFkYXRhLmpzb24gaGFzIG5vdCBiZWVuIGluY2x1ZGVkIGluIGJyb3dzZXItcG9seWZpbGxcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgKiBub3QgZXhpc3Qgd2hlbiBhY2Nlc3NlZCwgYnV0IGJlaGF2ZXMgZXhhY3RseSBhcyBhbiBvcmRpbmFyeSBXZWFrTWFwXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY3JlYXRlSXRlbVxuICAgICAqICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgdmFsdWUgZm9yIGFueVxuICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZXMsIGFzIGl0cyBvbmx5IGFyZ3VtZW50LCB0aGUga2V5IGJlaW5nIGNyZWF0ZWQuXG4gICAgICovXG4gICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgIGNvbnN0cnVjdG9yKGNyZWF0ZUl0ZW0sIGl0ZW1zID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1cGVyKGl0ZW1zKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgIH1cblxuICAgICAgZ2V0KGtleSkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBvYmplY3Qgd2l0aCBhIGB0aGVuYCBtZXRob2QsIGFuZCBjYW5cbiAgICAgKiB0aGVyZWZvcmUgYmUgYXNzdW1lZCB0byBiZWhhdmUgYXMgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdGhlbmFibGUuXG4gICAgICovXG4gICAgY29uc3QgaXNUaGVuYWJsZSA9IHZhbHVlID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAqIHRoZSBnaXZlbiBwcm9taXNlIGJhc2VkIG9uIGhvdyBpdCBpcyBjYWxsZWQ6XG4gICAgICpcbiAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICogICB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aXRoIHRoYXQgdmFsdWUuXG4gICAgICogLSBJZiB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggZXhhY3RseSBvbmUgYXJndW1lbnQsIHRoZSBwcm9taXNlIGlzXG4gICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAqIC0gT3RoZXJ3aXNlLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGVcbiAgICAgKiAgIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHByb21pc2VcbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc29sdXRpb24gYW5kIHJlamVjdGlvbiBmdW5jdGlvbnMgb2YgYVxuICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVzb2x2ZVxuICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlc29sdXRpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZWplY3Rpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICogICAgICAgIFRoZSBnZW5lcmF0ZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAvLyBJbiBjYXNlIHdlIGVuY291bnRlciBhIGJyb3dzZXIgZXJyb3IgaW4gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCB3ZSBkb24ndFxuICAgICAgLy8gd2FudCB0byBsb3NlIHRoZSBzdGFjayB0cmFjZSBsZWFkaW5nIHVwIHRvIHRoaXMgcG9pbnQuIEZvciB0aGF0IHJlYXNvbixcbiAgICAgIC8vIHdlIG5lZWQgdG8gaW5zdGFudGlhdGUgdGhlIGVycm9yIG91dHNpZGUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICByZXR1cm4gKC4uLmNhbGxiYWNrQXJncykgPT4ge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgcHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnIHx8XG4gICAgICAgICAgICAgICAgICAgKGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJnc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJncyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IHBsdXJhbGl6ZUFyZ3VtZW50cyA9IChudW1BcmdzKSA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gZm9yIGEgbWV0aG9kIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1ldGFkYXRhLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiAgICAgICAgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB3aGljaCBpcyBiZWluZyB3cmFwcGVkLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5taW5BcmdzXG4gICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBmZXdlciB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICogICAgICAgIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIG1vcmUgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICogICAgICAgVGhlIGdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBBc3luY0Z1bmN0aW9uID0gKG5hbWUsIG1ldGFkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNGdW5jdGlvbldyYXBwZXIodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUaGlzIEFQSSBtZXRob2QgaGFzIGN1cnJlbnRseSBubyBjYWxsYmFjayBvbiBDaHJvbWUsIGJ1dCBpdCByZXR1cm4gYSBwcm9taXNlIG9uIEZpcmVmb3gsXG4gICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgLy8gdG8gbm90IHBhc3NpbmcgdGhlIGNhbGxiYWNrIGlmIHRoZSBmaXJzdCBjYWxsIGZhaWxzLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGNiRXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke25hbWV9IEFQSSBtZXRob2QgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhlIGNhbGxiYWNrIHBhcmFtZXRlciwgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuXG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIEFQSSBtZXRob2QgbWV0YWRhdGEsIHNvIHRoYXQgdGhlIG5leHQgQVBJIGNhbGxzIHdpbGwgbm90IHRyeSB0b1xuICAgICAgICAgICAgICAvLyB1c2UgdGhlIHVuc3VwcG9ydGVkIGNhbGxiYWNrIGFueW1vcmUuXG4gICAgICAgICAgICAgIG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgIG1ldGFkYXRhLm5vQ2FsbGJhY2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7cmVzb2x2ZSwgcmVqZWN0fSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYW4gZXhpc3RpbmcgbWV0aG9kIG9mIHRoZSB0YXJnZXQgb2JqZWN0LCBzbyB0aGF0IGNhbGxzIHRvIGl0IGFyZVxuICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgKiBhcyBpdHMgZmlyc3QgYXJndW1lbnQsIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YCBvYmplY3QsIGZvbGxvd2VkIGJ5IGVhY2ggb2ZcbiAgICAgKiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgb3JpZ2luYWwgdGFyZ2V0IG9iamVjdCB0aGF0IHRoZSB3cmFwcGVkIG1ldGhvZCBiZWxvbmdzIHRvLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAqICAgICAgICBUaGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuIFRoaXMgaXMgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZSBQcm94eVxuICAgICAqICAgICAgICBvYmplY3Qgd2hpY2ggaXMgY3JlYXRlZCB0byB3cmFwIHRoZSBtZXRob2QuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAqICAgICAgICBUaGUgd3JhcHBlciBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgYSBkaXJlY3QgaW52b2NhdGlvblxuICAgICAqICAgICAgICBvZiB0aGUgd3JhcHBlZCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8ZnVuY3Rpb24+fVxuICAgICAqICAgICAgICBBIFByb3h5IG9iamVjdCBmb3IgdGhlIGdpdmVuIG1ldGhvZCwgd2hpY2ggaW52b2tlcyB0aGUgZ2l2ZW4gd3JhcHBlclxuICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBNZXRob2QgPSAodGFyZ2V0LCBtZXRob2QsIHdyYXBwZXIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJveHkobWV0aG9kLCB7XG4gICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVyLmNhbGwodGhpc09iaiwgdGFyZ2V0LCAuLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgaGFzT3duUHJvcGVydHkgPSBGdW5jdGlvbi5jYWxsLmJpbmQoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhbiBvYmplY3QgaW4gYSBQcm94eSB3aGljaCBpbnRlcmNlcHRzIGFuZCB3cmFwcyBjZXJ0YWluIG1ldGhvZHNcbiAgICAgKiBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHdyYXBwZXJzYCBhbmQgYG1ldGFkYXRhYCBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAqICAgICAgICBUaGUgdGFyZ2V0IG9iamVjdCB0byB3cmFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFt3cmFwcGVycyA9IHt9XVxuICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBzcGVjaWFsIGNhc2VzLiBBbnlcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgKiAgICAgICAgbWV0aG9kIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZS4gVGhlc2VcbiAgICAgKiAgICAgICAgd3JhcHBlciBtZXRob2RzIGFyZSBpbnZva2VkIGFzIGRlc2NyaWJlZCBpbiB7QHNlZSB3cmFwTWV0aG9kfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbbWV0YWRhdGEgPSB7fV1cbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyBtZXRhZGF0YSB1c2VkIHRvIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVcbiAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgKiAgICAgICAgdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlIHdoaWNoIGhhcyBhIGNvcnJlc3BvbmRpbmcgbWV0YWRhdGEgb2JqZWN0XG4gICAgICogICAgICAgIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgbWV0YWRhdGFgIHRyZWUgaXMgcmVwbGFjZWQgd2l0aCBhblxuICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgKiAgICAgICAge0BzZWUgd3JhcEFzeW5jRnVuY3Rpb259XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwT2JqZWN0ID0gKHRhcmdldCwgd3JhcHBlcnMgPSB7fSwgbWV0YWRhdGEgPSB7fSkgPT4ge1xuICAgICAgbGV0IGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgaGFzKHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0IHx8IHByb3AgaW4gY2FjaGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0KHByb3h5VGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEocHJvcCBpbiB0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB2YWx1ZSA9IHRhcmdldFtwcm9wXTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBvYmplY3QuIENoZWNrIGlmIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFueSB3cmFwcGluZy5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3cmFwcGVyc1twcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzcGVjaWFsLWNhc2Ugd3JhcHBlciBmb3IgdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcnNbcHJvcF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBhc3luYyBtZXRob2QgdGhhdCB3ZSBoYXZlIG1ldGFkYXRhIGZvci4gQ3JlYXRlIGFcbiAgICAgICAgICAgICAgLy8gUHJvbWlzZSB3cmFwcGVyIGZvciBpdC5cbiAgICAgICAgICAgICAgbGV0IHdyYXBwZXIgPSB3cmFwQXN5bmNGdW5jdGlvbihwcm9wLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIHRoYXQgd2UgZG9uJ3Qga25vdyBvciBjYXJlIGFib3V0LiBSZXR1cm4gdGhlXG4gICAgICAgICAgICAgIC8vIG9yaWdpbmFsIG1ldGhvZCwgYm91bmQgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgKGhhc093blByb3BlcnR5KHdyYXBwZXJzLCBwcm9wKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgd2UgbmVlZCB0byBkbyBzb21lIHdyYXBwaW5nIGZvciB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgIC8vIG9mLiBDcmVhdGUgYSBzdWItb2JqZWN0IHdyYXBwZXIgZm9yIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGNoaWxkXG4gICAgICAgICAgICAvLyBtZXRhZGF0YS5cbiAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBcIipcIikpIHtcbiAgICAgICAgICAgIC8vIFdyYXAgYWxsIHByb3BlcnRpZXMgaW4gKiBuYW1lc3BhY2UuXG4gICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtcIipcIl0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueSB3cmFwcGluZyBmb3IgdGhpcyBwcm9wZXJ0eSxcbiAgICAgICAgICAgIC8vIHNvIGp1c3QgZm9yd2FyZCBhbGwgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwge1xuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0KHByb3h5VGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wLCBkZXNjKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoY2FjaGUsIHByb3ApO1xuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgLy8gUGVyIGNvbnRyYWN0IG9mIHRoZSBQcm94eSBBUEksIHRoZSBcImdldFwiIHByb3h5IGhhbmRsZXIgbXVzdCByZXR1cm4gdGhlXG4gICAgICAvLyBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGlmIHRoYXQgdmFsdWUgaXMgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZFxuICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAvLyBwcm90b3R5cGUgc2V0IHRvIGB0YXJnZXRgIGluc3RlYWQgb2YgdXNpbmcgYHRhcmdldGAgZGlyZWN0bHkuXG4gICAgICAvLyBPdGhlcndpc2Ugd2UgY2Fubm90IHJldHVybiBhIGN1c3RvbSBvYmplY3QgZm9yIEFQSXMgdGhhdFxuICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgcHJveHkgaGFuZGxlcnMgdGhlbXNlbHZlcyB3aWxsIHN0aWxsIHVzZSB0aGUgb3JpZ2luYWwgYHRhcmdldGBcbiAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAvLyBkZXJlZmVyZW5jZWQgdmlhIHRoZSBvcmlnaW5hbCB0YXJnZXRzLlxuICAgICAgbGV0IHByb3h5VGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZSh0YXJnZXQpO1xuICAgICAgcmV0dXJuIG5ldyBQcm94eShwcm94eVRhcmdldCwgaGFuZGxlcnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgKiB3cmFwcGluZyBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCB0aG9zZSBtZXNzYWdlcyBhcmUgcGFzc2VkLlxuICAgICAqXG4gICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgKiBtYXAuIFN1YnNlcXVlbnQgY2FsbHMgdG8gYGFkZExpc3RlbmVyYCwgYGhhc0xpc3RlbmVyYCwgb3IgYHJlbW92ZUxpc3RlbmVyYFxuICAgICAqIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB3cmFwcGVyLCBzbyB0aGF0ICBhdHRlbXB0cyB0byByZW1vdmUgYVxuICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RGVmYXVsdFdlYWtNYXA8ZnVuY3Rpb24sIGZ1bmN0aW9uPn0gd3JhcHBlck1hcFxuICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAqICAgICAgICBmb3IgYSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiB3aGVuIG9uZSBkb2VzIG5vdCBleGlzdCwgYW5kIHJldHJpZXZlXG4gICAgICogICAgICAgIGFuIGV4aXN0aW5nIG9uZSB3aGVuIGl0IGRvZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBFdmVudCA9IHdyYXBwZXJNYXAgPT4gKHtcbiAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgdGFyZ2V0LmFkZExpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSwgLi4uYXJncyk7XG4gICAgICB9LFxuXG4gICAgICBoYXNMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZUxpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIG9uUmVxdWVzdEZpbmlzaGVkIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgd2lsbCByZXR1cm4gYVxuICAgICAgICogYGdldENvbnRlbnQoKWAgcHJvcGVydHkgd2hpY2ggcmV0dXJucyBhIGBQcm9taXNlYCByYXRoZXIgdGhhbiB1c2luZyBhXG4gICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gb25SZXF1ZXN0RmluaXNoZWQocmVxKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KHJlcSwge30gLyogd3JhcHBlcnMgKi8sIHtcbiAgICAgICAgICBnZXRDb250ZW50OiB7XG4gICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbGlzdGVuZXIod3JhcHBlZFJlcSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb25NZXNzYWdlV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhIG1lc3NhZ2UgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCBtYXkgc2VuZCByZXNwb25zZXMgYmFzZWQgb25cbiAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAqIGNhbGxiYWNrLiBJZiB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gcmV0dXJucyBhIFByb21pc2UsIHRoZSByZXNwb25zZSBpc1xuICAgICAgICogc2VudCB3aGVuIHRoZSBwcm9taXNlIGVpdGhlciByZXNvbHZlcyBvciByZWplY3RzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Kn0gbWVzc2FnZVxuICAgICAgICogICAgICAgIFRoZSBtZXNzYWdlIHNlbnQgYnkgdGhlIG90aGVyIGVuZCBvZiB0aGUgY2hhbm5lbC5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAqICAgICAgICBEZXRhaWxzIGFib3V0IHRoZSBzZW5kZXIgb2YgdGhlIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBzZW5kUmVzcG9uc2VcbiAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAqICAgICAgICB0aGF0IHZhbHVlIGFzIGEgcmVzcG9uc2UuXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICogICAgICAgIHlpZWxkIGEgcmVzcG9uc2UuIEZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICBsZXQgc2VuZFJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgIHdyYXBwZWRTZW5kUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyKG1lc3NhZ2UsIHNlbmRlciwgd3JhcHBlZFNlbmRSZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3VsdCA9IFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTtcblxuICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgZGlkbid0IHJldHVybmVkIHRydWUgb3IgYSBQcm9taXNlLCBvciBjYWxsZWRcbiAgICAgICAgLy8gd3JhcHBlZFNlbmRSZXNwb25zZSBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gZXhpdCBlYXJsaWVyXG4gICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgc21hbGwgaGVscGVyIHRvIHNlbmQgdGhlIG1lc3NhZ2UgaWYgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgICAgLy8gYW5kIGFuIGVycm9yIGlmIHRoZSBwcm9taXNlIHJlamVjdHMgKGEgd3JhcHBlZCBzZW5kTWVzc2FnZSBoYXNcbiAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgLy8gcHJvbWlzZSkuXG4gICAgICAgIGNvbnN0IHNlbmRQcm9taXNlZFJlc3VsdCA9IChwcm9taXNlKSA9PiB7XG4gICAgICAgICAgcHJvbWlzZS50aGVuKG1zZyA9PiB7XG4gICAgICAgICAgICAvLyBzZW5kIHRoZSBtZXNzYWdlIHZhbHVlLlxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgLy8gU2VuZCBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGlmIHRoZSByZWplY3RlZCB2YWx1ZVxuICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICBfX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X186IHRydWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgLy8gUHJpbnQgYW4gZXJyb3Igb24gdGhlIGNvbnNvbGUgaWYgdW5hYmxlIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzZW5kIG9uTWVzc2FnZSByZWplY3RlZCByZXBseVwiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHNlbmQgdGhlIHJlc29sdmVkIHZhbHVlIGFzIGFcbiAgICAgICAgLy8gcmVzdWx0LCBvdGhlcndpc2Ugd2FpdCB0aGUgcHJvbWlzZSByZWxhdGVkIHRvIHRoZSB3cmFwcGVkU2VuZFJlc3BvbnNlXG4gICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cbiAgICAgICAgaWYgKGlzUmVzdWx0VGhlbmFibGUpIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQoc2VuZFJlc3BvbnNlUHJvbWlzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXQgQ2hyb21lIGtub3cgdGhhdCB0aGUgbGlzdGVuZXIgaXMgcmVwbHlpbmcuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrID0gKHtyZWplY3QsIHJlc29sdmV9LCByZXBseSkgPT4ge1xuICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHdoZW4gbm9uZSBvZiB0aGUgbGlzdGVuZXJzIHJlcGxpZWQgdG8gdGhlIHNlbmRNZXNzYWdlIGNhbGwgYW5kIHJlc29sdmVcbiAgICAgICAgLy8gdGhlIHByb21pc2UgdG8gdW5kZWZpbmVkIGFzIGluIEZpcmVmb3guXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS93ZWJleHRlbnNpb24tcG9seWZpbGwvaXNzdWVzLzEzMFxuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlID09PSBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZXBseSAmJiByZXBseS5fX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X18pIHtcbiAgICAgICAgLy8gQ29udmVydCBiYWNrIHRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpbnRvXG4gICAgICAgIC8vIGFuIEVycm9yIGluc3RhbmNlLlxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcGx5Lm1lc3NhZ2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUocmVwbHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2UgPSAobmFtZSwgbWV0YWRhdGEsIGFwaU5hbWVzcGFjZU9iaiwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZENiID0gd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2suYmluZChudWxsLCB7cmVzb2x2ZSwgcmVqZWN0fSk7XG4gICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICBhcGlOYW1lc3BhY2VPYmouc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICBkZXZ0b29sczoge1xuICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBydW50aW1lOiB7XG4gICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgb25NZXNzYWdlRXh0ZXJuYWw6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHttaW5BcmdzOiAxLCBtYXhBcmdzOiAzfSksXG4gICAgICB9LFxuICAgICAgdGFiczoge1xuICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7bWluQXJnczogMiwgbWF4QXJnczogM30pLFxuICAgICAgfSxcbiAgICB9O1xuICAgIGNvbnN0IHNldHRpbmdNZXRhZGF0YSA9IHtcbiAgICAgIGNsZWFyOiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgICBnZXQ6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICAgIHNldDoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgIH07XG4gICAgYXBpTWV0YWRhdGEucHJpdmFjeSA9IHtcbiAgICAgIG5ldHdvcms6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICAgIHNlcnZpY2VzOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgICB3ZWJzaXRlczoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgIH07XG5cbiAgICByZXR1cm4gd3JhcE9iamVjdChleHRlbnNpb25BUElzLCBzdGF0aWNXcmFwcGVycywgYXBpTWV0YWRhdGEpO1xuICB9O1xuXG4gIC8vIFRoZSBidWlsZCBwcm9jZXNzIGFkZHMgYSBVTUQgd3JhcHBlciBhcm91bmQgdGhpcyBmaWxlLCB3aGljaCBtYWtlcyB0aGVcbiAgLy8gYG1vZHVsZWAgdmFyaWFibGUgYXZhaWxhYmxlLlxuICBtb2R1bGUuZXhwb3J0cyA9IHdyYXBBUElzKGNocm9tZSk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuYnJvd3Nlcjtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuY29uc3QgRVJST1JfTk9fQ09OTkVDVElPTiA9IFwiQ291bGQgbm90IGVzdGFibGlzaCBjb25uZWN0aW9uLiBcIiArXG4gICAgICBcIlJlY2VpdmluZyBlbmQgZG9lcyBub3QgZXhpc3QuXCI7XG5jb25zdCBFUlJPUl9DTE9TRURfQ09OTkVDVElPTiA9IFwiQSBsaXN0ZW5lciBpbmRpY2F0ZWQgYW4gYXN5bmNocm9ub3VzIFwiICtcbiAgICAgIFwicmVzcG9uc2UgYnkgcmV0dXJuaW5nIHRydWUsIGJ1dCB0aGUgbWVzc2FnZSBjaGFubmVsIGNsb3NlZCBiZWZvcmUgYSBcIiArXG4gICAgICBcInJlc3BvbnNlIHdhcyByZWNlaXZlZFwiO1xuLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTU3ODY5N1xuY29uc3QgRVJST1JfTUFOQUdFUl9ESVNDT05ORUNURUQgPSBcIk1lc3NhZ2UgbWFuYWdlciBkaXNjb25uZWN0ZWRcIjtcblxuLyoqXG4gKiBSZWNvbnN0cnVjdHMgYW4gZXJyb3IgZnJvbSBhIHNlcmlhbGl6YWJsZSBlcnJvciBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JEYXRhIC0gRXJyb3Igb2JqZWN0XG4gKlxuICogQHJldHVybnMge0Vycm9yfSBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVNlcmlhbGl6YWJsZUVycm9yKGVycm9yRGF0YSkge1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihlcnJvckRhdGEubWVzc2FnZSk7XG4gIGVycm9yLmNhdXNlID0gZXJyb3JEYXRhLmNhdXNlO1xuICBlcnJvci5uYW1lID0gZXJyb3JEYXRhLm5hbWU7XG4gIGVycm9yLnN0YWNrID0gZXJyb3JEYXRhLnN0YWNrO1xuXG4gIHJldHVybiBlcnJvcjtcbn1cblxuLyoqXG4gKiBGaWx0ZXJzIG91dCBgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlYCBlcnJvcnMgdG8gZG8gd2l0aCB0aGUgcmVjZWl2aW5nIGVuZFxuICogbm8gbG9uZ2VyIGV4aXN0aW5nLlxuICpcbiAqIEBwYXJhbSB7UHJvbWlzZX0gcHJvbWlzZSBUaGUgcHJvbWlzZSB0aGF0IHNob3VsZCBoYXZlIFwibm8gY29ubmVjdGlvblwiIGVycm9yc1xuICogICBpZ25vcmVkLiBHZW5lcmFsbHkgdGhpcyB3b3VsZCBiZSB0aGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogICBgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlYC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IFRoZSBzYW1lIHByb21pc2UsIGJ1dCB3aWxsIHJlc29sdmUgd2l0aCBgdW5kZWZpbmVkYCBpbnN0ZWFkXG4gKiAgIG9mIHJlamVjdGluZyBpZiB0aGUgcmVjZWl2aW5nIGVuZCBubyBsb25nZXIgZXhpc3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWdub3JlTm9Db25uZWN0aW9uRXJyb3IocHJvbWlzZSkge1xuICByZXR1cm4gcHJvbWlzZS5jYXRjaChlcnJvciA9PiB7XG4gICAgaWYgKHR5cGVvZiBlcnJvciA9PSBcIm9iamVjdFwiICYmXG4gICAgICAgIChlcnJvci5tZXNzYWdlID09IEVSUk9SX05PX0NPTk5FQ1RJT04gfHxcbiAgICAgICAgIGVycm9yLm1lc3NhZ2UgPT0gRVJST1JfQ0xPU0VEX0NPTk5FQ1RJT04gfHxcbiAgICAgICAgIGVycm9yLm1lc3NhZ2UgPT0gRVJST1JfTUFOQUdFUl9ESVNDT05ORUNURUQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3I7XG4gIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgc2VyaWFsaXphYmxlIGVycm9yIG9iamVjdCBmcm9tIGdpdmVuIGVycm9yXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgLSBFcnJvclxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHNlcmlhbGl6YWJsZSBlcnJvciBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU2VyaWFsaXphYmxlRXJyb3IoZXJyb3IpIHtcbiAgcmV0dXJuIHtcbiAgICBjYXVzZTogZXJyb3IuY2F1c2UgaW5zdGFuY2VvZiBFcnJvciA/XG4gICAgICB0b1NlcmlhbGl6YWJsZUVycm9yKGVycm9yLmNhdXNlKSA6XG4gICAgICBlcnJvci5jYXVzZSxcbiAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgc3RhY2s6IGVycm9yLnN0YWNrXG4gIH07XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2FsbC9lcnJvcnMuanNcIjtcblxubGV0IGNvbGxhcHNlZFNlbGVjdG9ycyA9IG5ldyBTZXQoKTtcbmxldCBvYnNlcnZlcnMgPSBuZXcgV2Vha01hcCgpO1xuXG5mdW5jdGlvbiBnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgaWYgKGVsZW1lbnQuZGF0YSkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQuZGF0YTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQubG9jYWxOYW1lID09IFwicGFyYW1cIiAmJiBjaGlsZC5uYW1lID09IFwibW92aWVcIiAmJiBjaGlsZC52YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IFVSTChjaGlsZC52YWx1ZSwgZG9jdW1lbnQuYmFzZVVSSSkuaHJlZjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmN1cnJlbnRTcmMgfHwgZWxlbWVudC5zcmM7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCkge1xuICAvLyBTZXR0aW5nIHRoZSBcImRpc3BsYXlcIiBDU1MgcHJvcGVydHkgdG8gXCJub25lXCIgZG9lc24ndCBoYXZlIGFueSBlZmZlY3Qgb25cbiAgLy8gPGZyYW1lPiBlbGVtZW50cyAoaW4gZnJhbWVzZXRzKS4gU28gd2UgaGF2ZSB0byBoaWRlIGl0IGlubGluZSB0aHJvdWdoXG4gIC8vIHRoZSBcInZpc2liaWxpdHlcIiBDU1MgcHJvcGVydHkuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcImZyYW1lXCIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElmIHRoZSA8dmlkZW8+IG9yIDxhdWRpbz4gZWxlbWVudCBjb250YWlucyBhbnkgPHNvdXJjZT4gY2hpbGRyZW4sXG4gIC8vIHdlIGNhbm5vdCBhZGRyZXNzIGl0IGluIENTUyBieSB0aGUgc291cmNlIFVSTDsgaW4gdGhhdCBjYXNlIHdlXG4gIC8vIGRvbid0IFwiY29sbGFwc2VcIiBpdCB1c2luZyBhIENTUyBzZWxlY3RvciBidXQgcmF0aGVyIGhpZGUgaXQgZGlyZWN0bHkgYnlcbiAgLy8gc2V0dGluZyB0aGUgc3R5bGU9XCIuLi5cIiBhdHRyaWJ1dGUuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcInZpZGVvXCIgfHwgZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJhdWRpb1wiKSB7XG4gICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkLmxvY2FsTmFtZSA9PSBcInNvdXJjZVwiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBzZWxlY3RvciA9IFwiXCI7XG4gIGZvciAobGV0IGF0dHIgb2YgW1wic3JjXCIsIFwic3Jjc2V0XCJdKSB7XG4gICAgbGV0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgaWYgKHZhbHVlICYmIGF0dHIgaW4gZWxlbWVudCkge1xuICAgICAgc2VsZWN0b3IgKz0gXCJbXCIgKyBhdHRyICsgXCI9XCIgKyBDU1MuZXNjYXBlKHZhbHVlKSArIFwiXVwiO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZWxlY3RvciA/IGVsZW1lbnQubG9jYWxOYW1lICsgc2VsZWN0b3IgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZUVsZW1lbnQoZWxlbWVudCwgcHJvcGVydGllcykge1xuICBsZXQge3N0eWxlfSA9IGVsZW1lbnQ7XG5cbiAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwiZnJhbWVcIikge1xuICAgICAgcHJvcGVydGllcyA9IFtbXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCJdXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm9wZXJ0aWVzID0gW1tcImRpc3BsYXlcIiwgXCJub25lXCJdXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcykge1xuICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICB9XG5cbiAgaWYgKG9ic2VydmVycy5oYXMoZWxlbWVudCkpIHtcbiAgICBvYnNlcnZlcnMuZ2V0KGVsZW1lbnQpLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcykge1xuICAgICAgaWYgKHN0eWxlLmdldFByb3BlcnR5VmFsdWUoa2V5KSAhPSB2YWx1ZSB8fFxuICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkoa2V5KSAhPSBcImltcG9ydGFudFwiKSB7XG4gICAgICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIG9ic2VydmVyLm9ic2VydmUoXG4gICAgZWxlbWVudCwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wic3R5bGVcIl1cbiAgICB9XG4gICk7XG4gIG9ic2VydmVycy5zZXQoZWxlbWVudCwgb2JzZXJ2ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5oaWRlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBvYnNlcnZlciA9IG9ic2VydmVycy5nZXQoZWxlbWVudCk7XG4gIGlmIChvYnNlcnZlcikge1xuICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICBvYnNlcnZlcnMuZGVsZXRlKGVsZW1lbnQpO1xuICB9XG5cbiAgbGV0IHByb3BlcnR5ID0gZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJmcmFtZVwiID8gXCJ2aXNpYmlsaXR5XCIgOiBcImRpc3BsYXlcIjtcbiAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzZWxlY3RvciA9IGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCk7XG4gIGlmICghc2VsZWN0b3IpIHtcbiAgICBoaWRlRWxlbWVudChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbGxhcHNlZFNlbGVjdG9ycy5oYXMoc2VsZWN0b3IpKSB7XG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiBcImV3ZTppbmplY3QtY3NzXCIsXG4gICAgICAgIHNlbGVjdG9yXG4gICAgICB9KVxuICAgICk7XG4gICAgY29sbGFwc2VkU2VsZWN0b3JzLmFkZChzZWxlY3Rvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscykge1xuICAvLyBSZXNvdXJjZXMgKGUuZy4gaW1hZ2VzKSBsb2FkZWQgaW50byBhYm91dDpibGFuayBmcmFtZXNcbiAgLy8gYXJlIChzb21ldGltZXMpIGxvYWRlZCB3aXRoIHRoZSBmcmFtZUlkIG9mIHRoZSBtYWluX2ZyYW1lLlxuICBmb3IgKGxldCBmcmFtZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lW3NyYz0nYWJvdXQ6YmxhbmsnXVwiKSkge1xuICAgIGlmICghZnJhbWUuY29udGVudERvY3VtZW50KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIGZyYW1lLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgLy8gVXNlIGhpZGVFbGVtZW50LCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGNvcnJlY3QgZnJhbWVJZFxuICAgICAgLy8gZm9yIHRoZSBcImV3ZTppbmplY3QtY3NzXCIgbWVzc2FnZS5cbiAgICAgIGlmICh1cmxzLmhhcyhnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSkpIHtcbiAgICAgICAgaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEVsZW1lbnRDb2xsYXBzaW5nKCkge1xuICBsZXQgZGVmZXJyZWQgPSBudWxsO1xuXG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlcikgPT4ge1xuICAgIGlmICghbWVzc2FnZSB8fCBtZXNzYWdlLnR5cGUgIT0gXCJld2U6Y29sbGFwc2VcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGluZ1wiKSB7XG4gICAgICBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgIGRlZmVycmVkID0gbmV3IE1hcCgpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgLy8gVW5kZXIgc29tZSBjb25kaXRpb25zIGEgaG9zdGlsZSBzY3JpcHQgY291bGQgdHJ5IHRvIHRyaWdnZXJcbiAgICAgICAgICAvLyB0aGUgZXZlbnQgYWdhaW4uIFNpbmNlIHdlIHNldCBkZWZlcnJlZCB0byBgbnVsbGAsIHRoZW5cbiAgICAgICAgICAvLyB3ZSBhc3N1bWUgdGhhdCB3ZSBzaG91bGQganVzdCByZXR1cm4gaW5zdGVhZCBvZiB0aHJvd2luZ1xuICAgICAgICAgIC8vIGEgVHlwZUVycm9yLlxuICAgICAgICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGxldCBbc2VsZWN0b3IsIHVybHNdIG9mIGRlZmVycmVkKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgIGlmICh1cmxzLmhhcyhnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSkpIHtcbiAgICAgICAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGVmZXJyZWQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbGV0IHVybHMgPSBkZWZlcnJlZC5nZXQobWVzc2FnZS5zZWxlY3RvcikgfHwgbmV3IFNldCgpO1xuICAgICAgZGVmZXJyZWQuc2V0KG1lc3NhZ2Uuc2VsZWN0b3IsIHVybHMpO1xuICAgICAgdXJscy5hZGQobWVzc2FnZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChtZXNzYWdlLnNlbGVjdG9yKSkge1xuICAgICAgICBpZiAoZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkgPT0gbWVzc2FnZS51cmwpIHtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhtZXNzYWdlLnNlbGVjdG9yLCBuZXcgU2V0KFttZXNzYWdlLnVybF0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vYWxsL2Vycm9ycy5qc1wiO1xuXG5jb25zdCBNQVhfRVJST1JfVEhSRVNIT0xEID0gMzA7XG5jb25zdCBNQVhfUVVFVUVEX0VWRU5UUyA9IDIwO1xuY29uc3QgRVZFTlRfSU5URVJWQUxfTVMgPSAxMDA7XG5cbmxldCBlcnJvckNvdW50ID0gMDtcbmxldCBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG5sZXQgZXZlbnRQcm9jZXNzaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xubGV0IGV2ZW50UXVldWUgPSBbXTtcblxuZnVuY3Rpb24gaXNFdmVudFRydXN0ZWQoZXZlbnQpIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihldmVudCkgPT09IEN1c3RvbUV2ZW50LnByb3RvdHlwZSAmJlxuICAgICFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChldmVudCwgXCJkZXRhaWxcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFsbG93bGlzdERvbWFpbihldmVudCkge1xuICBpZiAoIWlzRXZlbnRUcnVzdGVkKGV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJld2U6YWxsb3dsaXN0LXBhZ2VcIixcbiAgICAgIHRpbWVzdGFtcDogZXZlbnQuZGV0YWlsLnRpbWVzdGFtcCxcbiAgICAgIHNpZ25hdHVyZTogZXZlbnQuZGV0YWlsLnNpZ25hdHVyZSxcbiAgICAgIG9wdGlvbnM6IGV2ZW50LmRldGFpbC5vcHRpb25zXG4gICAgfSlcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc05leHRFdmVudCgpIHtcbiAgaWYgKGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIGxldCBldmVudCA9IGV2ZW50UXVldWUuc2hpZnQoKTtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBhbGxvd2xpc3RpbmdSZXN1bHQgPSBhd2FpdCBhbGxvd2xpc3REb21haW4oZXZlbnQpO1xuICAgICAgICBpZiAoYWxsb3dsaXN0aW5nUmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJkb21haW5fYWxsb3dsaXN0aW5nX3N1Y2Nlc3NcIikpO1xuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvbWFpbiBhbGxvd2xpc3RpbmcgcmVqZWN0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yQ291bnQrKztcbiAgICAgICAgaWYgKGVycm9yQ291bnQgPj0gTUFYX0VSUk9SX1RIUkVTSE9MRCkge1xuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFldmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgc3RvcFByb2Nlc3NpbmdJbnRlcnZhbCgpO1xuICAgIH1cbiAgfVxuICBmaW5hbGx5IHtcbiAgICBldmVudFByb2Nlc3NpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Eb21haW5BbGxvd2xpc3RpbmdSZXF1ZXN0KGV2ZW50KSB7XG4gIGlmIChldmVudFF1ZXVlLmxlbmd0aCA+PSBNQVhfUVVFVUVEX0VWRU5UUykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGV2ZW50UXVldWUucHVzaChldmVudCk7XG4gIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCkge1xuICBpZiAoIWV2ZW50UHJvY2Vzc2luZ0ludGVydmFsKSB7XG4gICAgcHJvY2Vzc05leHRFdmVudCgpO1xuICAgIGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwocHJvY2Vzc05leHRFdmVudCwgRVZFTlRfSU5URVJWQUxfTVMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKSB7XG4gIGNsZWFySW50ZXJ2YWwoZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwpO1xuICBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wT25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xuICBldmVudFF1ZXVlID0gW107XG4gIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0T25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50SGlkaW5nVHJhY2VyIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSBuZXcgTWFwKHNlbGVjdG9ycyk7XG5cbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudHJhY2UoKSwgMTAwMCk7XG4gICAgfSk7XG5cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4gdGhpcy50cmFjZSgpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgbG9nKGZpbHRlcnMsIHNlbGVjdG9ycyA9IFtdKSB7XG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKFxuICAgICAge3R5cGU6IFwiZXdlOnRyYWNlLWVsZW0taGlkZVwiLCBmaWx0ZXJzLCBzZWxlY3RvcnN9XG4gICAgKSk7XG4gIH1cblxuICB0cmFjZSgpIHtcbiAgICBsZXQgZmlsdGVycyA9IFtdO1xuICAgIGxldCBzZWxlY3RvcnMgPSBbXTtcblxuICAgIGZvciAobGV0IFtzZWxlY3RvciwgZmlsdGVyXSBvZiB0aGlzLnNlbGVjdG9ycykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZGVsZXRlKHNlbGVjdG9yKTtcbiAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUudG9TdHJpbmcoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbHRlcnMubGVuZ3RoID4gMCB8fCBzZWxlY3RvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5sb2coZmlsdGVycywgc2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHtjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlfSk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2FsbC9lcnJvcnMuanNcIjtcblxuY29uc3QgQUxMT1dFRF9ET01BSU5TID0gbmV3IFNldChbXG4gIFwiYWJwY2hpbmEub3JnXCIsXG4gIFwiYWJwaW5kby5ibG9nc3BvdC5jb21cIixcbiAgXCJhYnB2bi5jb21cIixcbiAgXCJhZGJsb2NrLmVlXCIsXG4gIFwiYWRibG9jay5nYXJkYXIubmV0XCIsXG4gIFwiYWRibG9ja3BsdXMubWVcIixcbiAgXCJhZGJsb2NrcGx1cy5vcmdcIixcbiAgXCJhYnB0ZXN0cGFnZXMub3JnXCIsXG4gIFwiY29tbWVudGNhbWFyY2hlLm5ldFwiLFxuICBcImRyb2l0LWZpbmFuY2VzLmNvbW1lbnRjYW1hcmNoZS5jb21cIixcbiAgXCJlYXN5bGlzdC50b1wiLFxuICBcImV5ZW8uY29tXCIsXG4gIFwiZmFuYm95LmNvLm56XCIsXG4gIFwiZmlsdGVybGlzdHMuY29tXCIsXG4gIFwiZm9ydW1zLmxhbmlrLnVzXCIsXG4gIFwiZ2l0ZWUuY29tXCIsXG4gIFwiZ2l0ZWUuaW9cIixcbiAgXCJnaXRodWIuY29tXCIsXG4gIFwiZ2l0aHViLmlvXCIsXG4gIFwiZ2l0bGFiLmNvbVwiLFxuICBcImdpdGxhYi5pb1wiLFxuICBcImd1cnVkLmVlXCIsXG4gIFwiaHVnb2xlc2NhcmdvdC5jb21cIixcbiAgXCJpLWRvbnQtY2FyZS1hYm91dC1jb29raWVzLmV1XCIsXG4gIFwiam91cm5hbGRlc2ZlbW1lcy5mclwiLFxuICBcImpvdXJuYWxkdW5ldC5jb21cIixcbiAgXCJsaW50ZXJuYXV0ZS5jb21cIixcbiAgXCJzcGFtNDA0LmNvbVwiLFxuICBcInN0YW5ldi5vcmdcIixcbiAgXCJ2b2lkLmdyXCIsXG4gIFwieGZpbGVzLm5vYWRzLml0XCIsXG4gIFwiem9zby5yb1wiXG5dKTtcblxuZnVuY3Rpb24gaXNEb21haW5BbGxvd2VkKGRvbWFpbikge1xuICBpZiAoZG9tYWluLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zdWJzdHJpbmcoMCwgZG9tYWluLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoQUxMT1dFRF9ET01BSU5TLmhhcyhkb21haW4pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbGV0IGluZGV4ID0gZG9tYWluLmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBkb21haW4gPSBkb21haW4uc3Vic3RyKGluZGV4ICsgMSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZUxpbmtzRW5hYmxlZCh1cmwpIHtcbiAgbGV0IHtwcm90b2NvbCwgaG9zdG5hbWV9ID0gbmV3IFVSTCh1cmwpO1xuICByZXR1cm4gaG9zdG5hbWUgPT0gXCJsb2NhbGhvc3RcIiB8fFxuICAgIHByb3RvY29sID09IFwiaHR0cHM6XCIgJiYgaXNEb21haW5BbGxvd2VkKGhvc3RuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVN1YnNjcmliZUxpbmtzKCkge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4ge1xuICAgIGlmIChldmVudC5idXR0b24gPT0gMiB8fCAhZXZlbnQuaXNUcnVzdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxpbmsgPSBldmVudC50YXJnZXQ7XG4gICAgd2hpbGUgKCEobGluayBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50KSkge1xuICAgICAgbGluayA9IGxpbmsucGFyZW50Tm9kZTtcblxuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcXVlcnlTdHJpbmcgPSBudWxsO1xuICAgIGlmIChsaW5rLnByb3RvY29sID09IFwiaHR0cDpcIiB8fCBsaW5rLnByb3RvY29sID09IFwiaHR0cHM6XCIpIHtcbiAgICAgIGlmIChsaW5rLmhvc3QgPT0gXCJzdWJzY3JpYmUuYWRibG9ja3BsdXMub3JnXCIgJiYgbGluay5wYXRobmFtZSA9PSBcIi9cIikge1xuICAgICAgICBxdWVyeVN0cmluZyA9IGxpbmsuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBGaXJlZm94IGRvZXNuJ3Qgc2VlbSB0byBwb3B1bGF0ZSB0aGUgXCJzZWFyY2hcIiBwcm9wZXJ0eSBmb3JcbiAgICAgIC8vIGxpbmtzIHdpdGggbm9uLXN0YW5kYXJkIFVSTCBzY2hlbWVzIHNvIHdlIG5lZWQgdG8gZXh0cmFjdCB0aGUgcXVlcnlcbiAgICAgIC8vIHN0cmluZyBtYW51YWxseS5cbiAgICAgIGxldCBtYXRjaCA9IC9eYWJwOlxcLypzdWJzY3JpYmVcXC8qXFw/KC4qKS9pLmV4ZWMobGluay5ocmVmKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBxdWVyeVN0cmluZyA9IG1hdGNoWzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcXVlcnlTdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdGl0bGUgPSBudWxsO1xuICAgIGxldCB1cmwgPSBudWxsO1xuICAgIGZvciAobGV0IHBhcmFtIG9mIHF1ZXJ5U3RyaW5nLnNwbGl0KFwiJlwiKSkge1xuICAgICAgbGV0IHBhcnRzID0gcGFyYW0uc3BsaXQoXCI9XCIsIDIpO1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAyIHx8ICEvXFxTLy50ZXN0KHBhcnRzWzFdKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAocGFydHNbMF0pIHtcbiAgICAgICAgY2FzZSBcInRpdGxlXCI6XG4gICAgICAgICAgdGl0bGUgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG9jYXRpb25cIjpcbiAgICAgICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXVybCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIHRpdGxlID0gdXJsO1xuICAgIH1cblxuICAgIHRpdGxlID0gdGl0bGUudHJpbSgpO1xuICAgIHVybCA9IHVybC50cmltKCk7XG4gICAgaWYgKCEvXihodHRwcz98ZnRwKTovLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHt0eXBlOiBcImV3ZTpzdWJzY3JpYmUtbGluay1jbGlja2VkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLCB1cmx9KVxuICAgICk7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LCB0cnVlKTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vYWxsL2Vycm9ycy5qc1wiO1xuXG5sZXQgaXNBY3RpdmUgPSBmYWxzZTtcblxuZnVuY3Rpb24gbm90aWZ5QWN0aXZlKCkge1xuICBpZiAoaXNBY3RpdmUpIHtcbiAgICBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IFwiZXdlOmNkcC1zZXNzaW9uLWFjdGl2ZVwiXG4gICAgICB9KVxuICAgICk7XG4gICAgaXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuICBzY2hlZHVsZUNoZWNrQWN0aXZlKCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlQ2hlY2tBY3RpdmUoKSB7XG4gIHNldFRpbWVvdXQobm90aWZ5QWN0aXZlLCAxMDAwKTtcbn1cblxuZnVuY3Rpb24gbWFya0FjdGl2ZSgpIHtcbiAgaXNBY3RpdmUgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnROb3RpZnlBY3RpdmUoKSB7XG4gIHNjaGVkdWxlQ2hlY2tBY3RpdmUoKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIG1hcmtBY3RpdmUsIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbWFya0FjdGl2ZSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBtYXJrQWN0aXZlLCB0cnVlKTtcbn1cbiIsImNvbnN0IHJhbmRvbVVVSUQgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCAmJiBjcnlwdG8ucmFuZG9tVVVJRC5iaW5kKGNyeXB0byk7XG5leHBvcnQgZGVmYXVsdCB7XG4gIHJhbmRvbVVVSURcbn07IiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gSW4gdGhlIGJyb3dzZXIgd2UgdGhlcmVmb3JlXG4vLyByZXF1aXJlIHRoZSBjcnlwdG8gQVBJIGFuZCBkbyBub3Qgc3VwcG9ydCBidWlsdC1pbiBmYWxsYmFjayB0byBsb3dlciBxdWFsaXR5IHJhbmRvbSBudW1iZXJcbi8vIGdlbmVyYXRvcnMgKGxpa2UgTWF0aC5yYW5kb20oKSkuXG5sZXQgZ2V0UmFuZG9tVmFsdWVzO1xuY29uc3Qgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi5cbiAgICBnZXRSYW5kb21WYWx1ZXMgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pO1xuXG4gICAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCJpbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG4vKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cblxuY29uc3QgYnl0ZVRvSGV4ID0gW107XG5cbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4LnB1c2goKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnNsaWNlKDEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2FmZVN0cmluZ2lmeShhcnIsIG9mZnNldCA9IDApIHtcbiAgLy8gTm90ZTogQmUgY2FyZWZ1bCBlZGl0aW5nIHRoaXMgY29kZSEgIEl0J3MgYmVlbiB0dW5lZCBmb3IgcGVyZm9ybWFuY2VcbiAgLy8gYW5kIHdvcmtzIGluIHdheXMgeW91IG1heSBub3QgZXhwZWN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkL3B1bGwvNDM0XG4gIHJldHVybiBieXRlVG9IZXhbYXJyW29mZnNldCArIDBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDNdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA1XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDZdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgN11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA4XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDldXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTNdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTVdXTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICBjb25zdCB1dWlkID0gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0KTsgLy8gQ29uc2lzdGVuY3kgY2hlY2sgZm9yIHZhbGlkIFVVSUQuICBJZiB0aGlzIHRocm93cywgaXQncyBsaWtlbHkgZHVlIHRvIG9uZVxuICAvLyBvZiB0aGUgZm9sbG93aW5nOlxuICAvLyAtIE9uZSBvciBtb3JlIGlucHV0IGFycmF5IHZhbHVlcyBkb24ndCBtYXAgdG8gYSBoZXggb2N0ZXQgKGxlYWRpbmcgdG9cbiAgLy8gXCJ1bmRlZmluZWRcIiBpbiB0aGUgdXVpZClcbiAgLy8gLSBJbnZhbGlkIGlucHV0IHZhbHVlcyBmb3IgdGhlIFJGQyBgdmVyc2lvbmAgb3IgYHZhcmlhbnRgIGZpZWxkc1xuXG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICB9XG5cbiAgcmV0dXJuIHV1aWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTsiLCJpbXBvcnQgbmF0aXZlIGZyb20gJy4vbmF0aXZlLmpzJztcbmltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHsgdW5zYWZlU3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBpZiAobmF0aXZlLnJhbmRvbVVVSUQgJiYgIWJ1ZiAmJiAhb3B0aW9ucykge1xuICAgIHJldHVybiBuYXRpdmUucmFuZG9tVVVJRCgpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gdW5zYWZlU3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gXCJ1dWlkXCI7XG5cbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9hbGwvZXJyb3JzLmpzXCI7XG5cbmxldCBzZXNzaW9uSWQgPSBudWxsO1xuXG5mdW5jdGlvbiBvbkJUQUFEZXRlY3Rpb25FdmVudChldmVudCkge1xuICBpZiAoIXNlc3Npb25JZCkge1xuICAgIHNlc3Npb25JZCA9IHV1aWR2NCgpO1xuICB9XG5cbiAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgIHR5cGU6IFwiZXdlOmJsb2NrdGhyb3VnaC1hY2NlcHRhYmxlLWFkcy1kZXRlY3Rpb24tZXZlbnRcIixcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgYWI6IGV2ZW50LmRldGFpbC5hYixcbiAgICAgICAgYWNjZXB0YWJsZTogZXZlbnQuZGV0YWlsLmFjY2VwdGFibGUsXG4gICAgICAgIHNlc3Npb25JZFxuICAgICAgfVxuICAgIH0pXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoaW5nQmxvY2t0aHJvdWdoVGFnKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkJUQUFEZXRlY3Rpb25cIiwgb25CVEFBRGV0ZWN0aW9uRXZlbnQpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcblxuaW1wb3J0IHtFbGVtSGlkZUVtdWxhdGlvbn1cbiAgZnJvbSBcImFkYmxvY2twbHVzY29yZS9saWIvY29udGVudC9lbGVtSGlkZUVtdWxhdGlvbi5qc1wiO1xuXG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vYWxsL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHtzdGFydEVsZW1lbnRDb2xsYXBzaW5nLCBoaWRlRWxlbWVudCwgdW5oaWRlRWxlbWVudH1cbiAgZnJvbSBcIi4vZWxlbWVudC1jb2xsYXBzaW5nLmpzXCI7XG5pbXBvcnQge3N0YXJ0T25lQ2xpY2tBbGxvd2xpc3Rpbmd9IGZyb20gXCIuL2FsbG93bGlzdGluZy5qc1wiO1xuaW1wb3J0IHtFbGVtZW50SGlkaW5nVHJhY2VyfSBmcm9tIFwiLi9lbGVtZW50LWhpZGluZy10cmFjZXIuanNcIjtcbmltcG9ydCB7c3Vic2NyaWJlTGlua3NFbmFibGVkLCBoYW5kbGVTdWJzY3JpYmVMaW5rc30gZnJvbSBcIi4vc3Vic2NyaWJlLWxpbmtzLmpzXCI7XG5pbXBvcnQge3N0YXJ0Tm90aWZ5QWN0aXZlfSBmcm9tIFwiLi9jZHAtc2Vzc2lvbi5qc1wiO1xuaW1wb3J0IHtzdGFydFdhdGNoaW5nQmxvY2t0aHJvdWdoVGFnfSBmcm9tIFwiLi9ibG9ja3Rocm91Z2gtdGFnLmpzXCI7XG5cbmxldCB0cmFjZXI7XG5sZXQgZWxlbUhpZGVFbXVsYXRpb247XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRDb250ZW50RmVhdHVyZXMoKSB7XG4gIGlmIChzdWJzY3JpYmVMaW5rc0VuYWJsZWQod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgaGFuZGxlU3Vic2NyaWJlTGlua3MoKTtcbiAgfVxuXG4gIGxldCByZXNwb25zZSA9IGF3YWl0IGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7dHlwZTogXCJld2U6Y29udGVudC1oZWxsb1wifSlcbiAgKTtcblxuICBpZiAocmVzcG9uc2UpIHtcbiAgICBhd2FpdCBhcHBseUNvbnRlbnRGZWF0dXJlcyhyZXNwb25zZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29udGVudEZlYXR1cmVzKCkge1xuICBpZiAodHJhY2VyKSB7XG4gICAgdHJhY2VyLmRpc2Nvbm5lY3QoKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNvbnRlbnRGZWF0dXJlcyhyZXNwb25zZSkge1xuICBpZiAocmVzcG9uc2UudHJhY2VkU2VsZWN0b3JzKSB7XG4gICAgdHJhY2VyID0gbmV3IEVsZW1lbnRIaWRpbmdUcmFjZXIocmVzcG9uc2UudHJhY2VkU2VsZWN0b3JzKTtcbiAgfVxuXG4gIGNvbnN0IGhpZGVFbGVtZW50cyA9IChlbGVtZW50cywgZmlsdGVycykgPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgIGhpZGVFbGVtZW50KGVsZW1lbnQsIHJlc3BvbnNlLmNzc1Byb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIGlmICh0cmFjZXIpIHtcbiAgICAgIHRyYWNlci5sb2coZmlsdGVycyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHVuaGlkZUVsZW1lbnRzID0gZWxlbWVudHMgPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgIHVuaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbW92ZUVsZW1lbnRzID0gKGVsZW1lbnRzLCBmaWx0ZXJzKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlmICh0cmFjZXIpIHtcbiAgICAgIHRyYWNlci5sb2coZmlsdGVycyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGFwcGx5SW5saW5lQ1NTID0gKGVsZW1lbnRzLCBjc3NQYXR0ZXJucykgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBjc3NQYXR0ZXJuc1tpXTtcblxuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGF0dGVybi5jc3MpKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgXCJpbXBvcnRhbnRcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRyYWNlcikge1xuICAgICAgY29uc3QgZmlsdGVyVGV4dHMgPSBjc3NQYXR0ZXJucy5tYXAocGF0dGVybiA9PiBwYXR0ZXJuLnRleHQpO1xuICAgICAgdHJhY2VyLmxvZyhmaWx0ZXJUZXh0cyk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChyZXNwb25zZS5lbXVsYXRlZFBhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoIWVsZW1IaWRlRW11bGF0aW9uKSB7XG4gICAgICBlbGVtSGlkZUVtdWxhdGlvbiA9IG5ldyBFbGVtSGlkZUVtdWxhdGlvbihoaWRlRWxlbWVudHMsIHVuaGlkZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRWxlbWVudHMsIGFwcGx5SW5saW5lQ1NTKTtcbiAgICB9XG4gICAgZWxlbUhpZGVFbXVsYXRpb24uYXBwbHkocmVzcG9uc2UuZW11bGF0ZWRQYXR0ZXJucyk7XG4gIH1cbiAgZWxzZSBpZiAoZWxlbUhpZGVFbXVsYXRpb24pIHtcbiAgICBlbGVtSGlkZUVtdWxhdGlvbi5hcHBseShyZXNwb25zZS5lbXVsYXRlZFBhdHRlcm5zKTtcbiAgfVxuXG4gIGlmIChyZXNwb25zZS5ub3RpZnlBY3RpdmUpIHtcbiAgICBzdGFydE5vdGlmeUFjdGl2ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uTWVzc2FnZShtZXNzYWdlKSB7XG4gIGlmICh0eXBlb2YgbWVzc2FnZSA9PSBcIm9iamVjdFwiICYmIG1lc3NhZ2UgIT0gbnVsbCAmJlxuICAgIG1lc3NhZ2UudHlwZSAmJiBtZXNzYWdlLnR5cGUgPT0gXCJld2U6YXBwbHktY29udGVudC1mZWF0dXJlc1wiKSB7XG4gICAgcmVtb3ZlQ29udGVudEZlYXR1cmVzKCk7XG4gICAgYXBwbHlDb250ZW50RmVhdHVyZXMobWVzc2FnZSk7XG4gIH1cbn1cbmJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIob25NZXNzYWdlKTtcblxuc3RhcnRFbGVtZW50Q29sbGFwc2luZygpO1xuc3RhcnRPbmVDbGlja0FsbG93bGlzdGluZygpO1xuaW5pdENvbnRlbnRGZWF0dXJlcygpO1xuc3RhcnRXYXRjaGluZ0Jsb2NrdGhyb3VnaFRhZygpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9