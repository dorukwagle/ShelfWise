"use strict";
BigInt.prototype.toJSON = function () {
    return Number(this);
};
