const bcrypt = require('bcrypt');

bcrypt.hash('secret123', 12).then((hash: string) => {
  console.log('Hashed password:', hash);
});