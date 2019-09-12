/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import canStache from 'can-stache';
import canMap from 'can-map';
import canComponent from 'can-component';
import template from './templates/numberbox-component.stache';

const FLOAT_NUMBER_PATTERN = '([0-9]+([.][0-9]+){0,1})';
const INT_NUMBER_PATTERN = '([0-9]+)';
const NEGATIVE_NUMBER_PATTERN = '([-]{0,1})';

export default canComponent.extend({
  tag: 'numberbox-component',
  view: canStache(template),
  leakScope: true,
  viewModel: canMap.extend({
    value: '',
    enableFloat: false,
    enableNegative: false,
    disabled: false,
    additionalClass: '',
    placeholder: '',
    ckeckKey(positivePattern, negativePattern, key) {
      return this.attr('enableNegative') ?
        !!key.match(negativePattern) :
        !!key.match(positivePattern);
    },
    checkIntKey(key) {
      const intPattern = /[0-9]/i;
      const negativeIntPattern = /[0-9-]/;
      return this.ckeckKey(intPattern, negativeIntPattern, key);
    },
    checkFloatKey(key) {
      const floatPattern = /[0-9.]/;
      const negativefloatPattern = /[0-9.-]/;
      return this.ckeckKey(floatPattern, negativefloatPattern, key);
    },
    buildValidationPattern() {
      let validationPattern = '^';

      if (this.attr('enableNegative')) {
        validationPattern += NEGATIVE_NUMBER_PATTERN;
      }

      if (this.attr('enableFloat')) {
        validationPattern += FLOAT_NUMBER_PATTERN;
      } else {
        validationPattern += INT_NUMBER_PATTERN;
      }

      validationPattern += '$';
      return validationPattern;
    },
    validateValue() {
      const validationPattern = this.buildValidationPattern();

      if (!(this.attr('value') || '').match(validationPattern)) {
        this.attr('value', '');
      }
    },
    onInputKeyDown(el, ev) {
      // ENTER key
      if (ev.keyCode === 13) {
        this.attr('value', el.value);
        this.validateValue();
      }
    },
  }),
  events: {
    '.numberbox-input keypress'(el, ev) {
      const key = ev.key;
      const vm = this.viewModel;
      const enableFloat = vm.attr('enableFloat');

      if (!enableFloat) {
        if (!vm.checkIntKey(key)) {
          ev.preventDefault();
        }
      } else if (!vm.checkFloatKey(key)) {
        ev.preventDefault();
      }
    },
    '.numberbox-input blur'() {
      this.viewModel.validateValue();
    },
  },
});

export {FLOAT_NUMBER_PATTERN, INT_NUMBER_PATTERN, NEGATIVE_NUMBER_PATTERN};
