interface BigInt {
    toJSON: () => Number;
}

BigInt.prototype.toJSON = function () {
    return Number(this);
};