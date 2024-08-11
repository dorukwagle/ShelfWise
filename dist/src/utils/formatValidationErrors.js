"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = void 0;
const formatValidationErrors = (validation) => {
    var _a, _b, _c;
    const res = {};
    res.statusCode = 400;
    if (Object.keys(((_b = (_a = validation.error) === null || _a === void 0 ? void 0 : _a.formErrors) === null || _b === void 0 ? void 0 : _b.fieldErrors) || {}).length)
        res.error = (_c = validation.error) === null || _c === void 0 ? void 0 : _c.formErrors.fieldErrors;
    else if (validation.error)
        res.error = { error: validation.error.issues[0].message };
    return res.error ? res : null;
};
exports.formatValidationErrors = formatValidationErrors;
exports.default = exports.formatValidationErrors;
