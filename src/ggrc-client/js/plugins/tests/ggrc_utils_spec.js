/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import * as aclUtils from '../utils/acl-utils';
import {
  getMappableTypes,
  isMappableType,
  getAssigneeType,
} from '../ggrc_utils';
import Mappings from '../../models/mappers/mappings';

'use strict';

describe('getMappableTypes() method', function () {
  beforeAll(function () {
    let canonicalMappings = {};
    let OBJECT_TYPES = [
      'DataAsset', 'Facility', 'Market', 'OrgGroup', 'Vendor', 'Process',
      'Product', 'Project', 'System', 'Regulation', 'Policy', 'Contract',
      'Standard', 'Program', 'Issue', 'Control', 'Requirement',
      'Objective', 'Audit', 'Assessment', 'AccessGroup',
      'Document', 'Risk', 'Threat',
    ];
    OBJECT_TYPES.forEach(function (item) {
      canonicalMappings[item] = {};
    });
    spyOn(Mappings, 'get_canonical_mappings_for')
      .and.returnValue(canonicalMappings);
  });

  it('always returns whitelisted items', function () {
    let whitelisted = ['Hello', 'World'];
    let result = getMappableTypes('AssessmentTemplate', {
      whitelist: whitelisted,
    });
    expect(_.intersection(result, whitelisted)).toEqual(whitelisted);
  });
  it('always remove forbidden items', function () {
    let forbidden = ['Policy', 'Process', 'Product', 'Program'];
    let list = getMappableTypes('DataAsset');
    let result = getMappableTypes('DataAsset', {
      forbidden: forbidden,
    });
    expect(_.difference(list, result).sort()).toEqual(forbidden.sort());
  });
  it('always leave whitelisted and remove forbidden items', function () {
    let forbidden = ['Policy', 'Process', 'Product', 'Program'];
    let whitelisted = ['Hello', 'World'];
    let list = getMappableTypes('DataAsset');
    let result = getMappableTypes('DataAsset', {
      forbidden: forbidden,
      whitelist: whitelisted,
    });
    let input = _.difference(list, result).concat(_.difference(result, list));
    let output = forbidden.concat(whitelisted);

    expect(input.sort()).toEqual(output.sort());
  });
});

describe('isMappableType() method', function () {
  it('returns false for AssessmentTemplate and  any type', function () {
    let result = isMappableType('AssessmentTemplate', 'Program');
    expect(result).toBe(false);
  });
  it('returns true for Program and Control', function () {
    let result = isMappableType('Program', 'Control');
    expect(result).toBe(true);
  });
});

describe('getAssigneeType() method', function () {
  let instance;

  beforeAll(function () {
    instance = {
      type: 'Assessment',
      id: 2147483647,
      access_control_list: [],
    };

    spyOn(aclUtils, 'getRolesForType').and.returnValue([
      {
        id: 1, object_type: 'Assessment', name: 'Admin',
      },
      {
        id: 3, object_type: 'Assessment', name: 'Verifiers',
      },
      {
        id: 4, object_type: 'Assessment', name: 'Creators',
      },
      {
        id: 5, object_type: 'Assessment', name: 'Assignees',
      },
    ]);
  });

  it('should return null. Empty ACL', function () {
    let userType = getAssigneeType(instance);
    expect(userType).toBeNull();
  });

  it('should return null. User is not in role', function () {
    let userType;
    instance.access_control_list = [
      {ac_role_id: 3, person: {id: 4}},
      {ac_role_id: 1, person: {id: 5}},
    ];

    userType = getAssigneeType(instance);
    expect(userType).toBeNull();
  });

  it('should return Verifiers type', function () {
    let userType;
    instance.access_control_list = [
      {ac_role_id: 3, person: {id: 1}},
      {ac_role_id: 1, person: {id: 3}},
    ];

    userType = getAssigneeType(instance);
    expect(userType).toEqual('Verifiers');
  });

  it('should return Verifiers and Creators types', function () {
    let userType;
    instance.access_control_list = [
      {ac_role_id: 3, person: {id: 1}},
      {ac_role_id: 1, person: {id: 3}},
      {ac_role_id: 4, person: {id: 1}},
      {ac_role_id: 3, person: {id: 5}},
    ];

    userType = getAssigneeType(instance);
    expect(userType.indexOf('Verifiers') > -1).toBeTruthy();
    expect(userType.indexOf('Creators') > -1).toBeTruthy();
  });

  it('should return Verifiers and Creators and Assigness types', function () {
    let userType;
    instance.access_control_list = [
      {ac_role_id: 3, person: {id: 1}},
      {ac_role_id: 1, person: {id: 3}},
      {ac_role_id: 4, person: {id: 1}},
      {ac_role_id: 3, person: {id: 5}},
      {ac_role_id: 5, person: {id: 1}},
    ];

    userType = getAssigneeType(instance);
    expect(userType.indexOf('Verifiers') > -1).toBeTruthy();
    expect(userType.indexOf('Creators') > -1).toBeTruthy();
    expect(userType.indexOf('Assignees') > -1).toBeTruthy();
  });

  it('should return string with types separated by commas', function () {
    let userType;
    let expectedString = 'Verifiers,Creators,Assignees';
    instance.access_control_list = [
      {ac_role_id: 3, person: {id: 1}},
      {ac_role_id: 1, person: {id: 3}},
      {ac_role_id: 4, person: {id: 1}},
      {ac_role_id: 3, person: {id: 5}},
      {ac_role_id: 5, person: {id: 1}},
    ];

    userType = getAssigneeType(instance);
    expect(userType).toEqual(expectedString);
  });
});
