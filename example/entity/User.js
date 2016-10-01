var count = 0;

function User(email, password, name) {
    this.email = email;
    this.password = password;
    this.name = name;
    count++;
}

User.prototype.getFormattedName = function () {
    return this.name + " <" + this.email + ">";
};

User.prototype.getCount = function () {
    return count;
};

module.exports = User;