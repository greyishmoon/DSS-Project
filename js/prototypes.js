// Prototypes and general helper functions

// Round number to x decimal places (and return a number not a string)
// Call using .toFixedNumber(3) for 3 decimal places
Number.prototype.toFixedNumber = function(x, base) {
    var pow = Math.pow(base || 10, x);
    return +(Math.round(this * pow) / pow);
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
