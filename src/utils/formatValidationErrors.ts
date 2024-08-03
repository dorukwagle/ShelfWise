import ModelReturnTypes from "../entities/ModelReturnTypes";

export const formatValidationErrors = <D = {}, E = {}>(validation: any) => {
    const res = {} as ModelReturnTypes<D, E>;
    res.statusCode = 400;

    if (Object.keys(validation.error?.formErrors?.fieldErrors || {}).length)
        res.error = validation.error?.formErrors.fieldErrors;
    else if (validation.error)
        res.error = validation.error;

    return res.error ? res : null;
};

export default formatValidationErrors;
