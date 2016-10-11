var count = 0;

function Dummy(dummyParam) {
    this.dummyParam = dummyParam;
    count++;
}

Dummy.prototype.getCount = function () {
    return count;
};

module.exports = Dummy;