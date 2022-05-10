"use strict";
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/lambda/api/openapi/validation/index.js
var Pet = validate10;
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.type === void 0 && (missing0 = "type") || data.name === void 0 && (missing0 = "name")) {
        validate10.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== void 0) {
          let data0 = data.id;
          const _errs1 = errors;
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate10.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
          var valid0 = _errs1 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.type !== void 0) {
            const _errs3 = errors;
            if (typeof data.type !== "string") {
              validate10.errors = [{ instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs3 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.name !== void 0) {
              const _errs5 = errors;
              if (typeof data.name !== "string") {
                validate10.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate10.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate10.errors = vErrors;
  return errors === 0;
}
__name(validate10, "validate10");
var Pets_GetPets_RequestParams = validate11;
function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate11.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate11.errors = vErrors;
  return errors === 0;
}
__name(validate11, "validate11");
var Pets_GetPets_RequestQuery = validate12;
function validate12(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate12.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate12.errors = vErrors;
  return errors === 0;
}
__name(validate12, "validate12");
var Pets_GetPets_RequestBody = validate13;
function validate13(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  validate13.errors = [{ instancePath, schemaPath: "#/not", keyword: "not", params: {}, message: "must NOT be valid" }];
  return false;
  validate13.errors = vErrors;
  return errors === 0;
}
__name(validate13, "validate13");
var Pets_GetPets_RequestHeaders = validate14;
function validate14(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate14.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate14.errors = vErrors;
  return errors === 0;
}
__name(validate14, "validate14");
var Pets_GetPets_ResponseBody = validate15;
function validate15(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (Array.isArray(data)) {
      var valid0 = true;
      const len0 = data.length;
      for (let i0 = 0; i0 < len0; i0++) {
        let data0 = data[i0];
        const _errs1 = errors;
        const _errs2 = errors;
        if (errors === _errs2) {
          if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
            let missing0;
            if (data0.id === void 0 && (missing0 = "id") || data0.type === void 0 && (missing0 = "type") || data0.name === void 0 && (missing0 = "name")) {
              validate15.errors = [{ instancePath: instancePath + "/" + i0, schemaPath: "Pet/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
              return false;
            } else {
              if (data0.id !== void 0) {
                let data1 = data0.id;
                const _errs4 = errors;
                if (!(typeof data1 == "number" && isFinite(data1))) {
                  validate15.errors = [{ instancePath: instancePath + "/" + i0 + "/id", schemaPath: "Pet/properties/id/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                  return false;
                }
                var valid2 = _errs4 === errors;
              } else {
                var valid2 = true;
              }
              if (valid2) {
                if (data0.type !== void 0) {
                  const _errs6 = errors;
                  if (typeof data0.type !== "string") {
                    validate15.errors = [{ instancePath: instancePath + "/" + i0 + "/type", schemaPath: "Pet/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  var valid2 = _errs6 === errors;
                } else {
                  var valid2 = true;
                }
                if (valid2) {
                  if (data0.name !== void 0) {
                    const _errs8 = errors;
                    if (typeof data0.name !== "string") {
                      validate15.errors = [{ instancePath: instancePath + "/" + i0 + "/name", schemaPath: "Pet/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    var valid2 = _errs8 === errors;
                  } else {
                    var valid2 = true;
                  }
                }
              }
            }
          } else {
            validate15.errors = [{ instancePath: instancePath + "/" + i0, schemaPath: "Pet/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
            return false;
          }
        }
        var valid0 = _errs1 === errors;
        if (!valid0) {
          break;
        }
      }
    } else {
      validate15.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
      return false;
    }
  }
  validate15.errors = vErrors;
  return errors === 0;
}
__name(validate15, "validate15");
var Pets_GetPetById_RequestParams = validate16;
function validate16(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id")) {
        validate16.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== void 0) {
          let data0 = data.id;
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate16.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
        }
      }
    } else {
      validate16.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate16.errors = vErrors;
  return errors === 0;
}
__name(validate16, "validate16");
var Pets_GetPetById_RequestQuery = validate17;
function validate17(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate17.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate17.errors = vErrors;
  return errors === 0;
}
__name(validate17, "validate17");
var Pets_GetPetById_RequestBody = validate18;
function validate18(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  validate18.errors = [{ instancePath, schemaPath: "#/not", keyword: "not", params: {}, message: "must NOT be valid" }];
  return false;
  validate18.errors = vErrors;
  return errors === 0;
}
__name(validate18, "validate18");
var Pets_GetPetById_RequestHeaders = validate19;
function validate19(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (!(data && typeof data == "object" && !Array.isArray(data))) {
    validate19.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
    return false;
  }
  validate19.errors = vErrors;
  return errors === 0;
}
__name(validate19, "validate19");
var Pets_GetPetById_ResponseBody = validate20;
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const _errs0 = errors;
  if (errors === _errs0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.type === void 0 && (missing0 = "type") || data.name === void 0 && (missing0 = "name")) {
        validate20.errors = [{ instancePath, schemaPath: "Pet/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        if (data.id !== void 0) {
          let data0 = data.id;
          const _errs2 = errors;
          if (!(typeof data0 == "number" && isFinite(data0))) {
            validate20.errors = [{ instancePath: instancePath + "/id", schemaPath: "Pet/properties/id/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
            return false;
          }
          var valid1 = _errs2 === errors;
        } else {
          var valid1 = true;
        }
        if (valid1) {
          if (data.type !== void 0) {
            const _errs4 = errors;
            if (typeof data.type !== "string") {
              validate20.errors = [{ instancePath: instancePath + "/type", schemaPath: "Pet/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid1 = _errs4 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.name !== void 0) {
              const _errs6 = errors;
              if (typeof data.name !== "string") {
                validate20.errors = [{ instancePath: instancePath + "/name", schemaPath: "Pet/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid1 = _errs6 === errors;
            } else {
              var valid1 = true;
            }
          }
        }
      }
    } else {
      validate20.errors = [{ instancePath, schemaPath: "Pet/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate20.errors = vErrors;
  return errors === 0;
}
__name(validate20, "validate20");
"use strict";
export {
  Pet,
  Pets_GetPetById_RequestBody,
  Pets_GetPetById_RequestHeaders,
  Pets_GetPetById_RequestParams,
  Pets_GetPetById_RequestQuery,
  Pets_GetPetById_ResponseBody,
  Pets_GetPets_RequestBody,
  Pets_GetPets_RequestHeaders,
  Pets_GetPets_RequestParams,
  Pets_GetPets_RequestQuery,
  Pets_GetPets_ResponseBody
};
