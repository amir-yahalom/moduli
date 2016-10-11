var count = 0;

function NestedModule(dummyParam) {
    this.dummyParam = dummyParam;
    count++;
}

NestedModule.prototype.getCount = function () {
    return count;
};

module.exports = NestedModule;