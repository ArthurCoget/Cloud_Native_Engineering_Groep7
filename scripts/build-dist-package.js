// scripts/build-dist-package.js

const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "../package.json");
const destination = path.join(__dirname, "../dist/package.json");

const fullPackage = require(source);

const distPackage = {
  name: fullPackage.name,
  version: fullPackage.version,
  description: fullPackage.description,
  author: fullPackage.author,
  license: fullPackage.license,
  main: "index.js",
  type: "commonjs",
  scripts: {
    start: "node index.js",
  },
  dependencies: fullPackage.dependencies,
};

fs.writeFileSync(destination, JSON.stringify(distPackage, null, 2));
console.log("✅ package.json copied to dist/");
