"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strToInt = (str) => {
    const res = parseInt(str);
    if (`${res}` !== str)
        return undefined;
    return res;
};
exports.roundToNDecPlaces = (x, n) => Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
