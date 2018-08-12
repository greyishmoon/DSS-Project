// Prototypes and general helper functions

// Round number to x decimal places (and return a number not a string)
// Call using .toFixedNumber(3) for 3 decimal places
// Number.prototype.toFixedNumber = function(x, base) {
//     var pow = Math.pow(base || 10, x);
//     return +(Math.round(this * pow) / pow);
// }

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

// Ractive helpers
var helpers = Ractive.defaults.data;

helpers.percent = function ( num ) {
    return (num * 100).toFixedNumber(1);
};

helpers.roundTo2 = function ( num ) {
    return num.toFixedNumber(2);
};

// EXAMPLE
helpers.sort = function ( array ) {
    return array.slice().sort( function ( a, b ) {
        return a - b;
    });
};
