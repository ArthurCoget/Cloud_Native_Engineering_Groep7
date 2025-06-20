"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
bcrypt.hash('secret123', 12).then((hash) => {
    console.log('Hashed password:', hash);
});
//# sourceMappingURL=hashpassw.js.map