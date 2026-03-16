#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const schemaDir = path.join(__dirname, '..', 'data', 'schema');
const dataDir = path.join(__dirname, '..', 'data', 'jurisdictions');

const serviceSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'service.schema.json'), 'utf8'));
const rulesetSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'ruleset.schema.json'), 'utf8'));
const agencySchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'agency.schema.json'), 'utf8'));
const jurisdictionSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'jurisdiction.schema.json'), 'utf8'));

const validateService = ajv.compile(serviceSchema);
const validateRuleset = ajv.compile(rulesetSchema);
const validateAgency = ajv.compile(agencySchema);
const validateJurisdiction = ajv.compile(jurisdictionSchema);

let errors = 0;
let validated = 0;

function findFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (entry.name.match(pattern)) {
      results.push(fullPath);
    }
  }
  return results;
}

function validateFile(filePath, validate, schemaName) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  let data;
  try {
    data = yaml.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`  FAIL ${relativePath}: invalid YAML - ${e.message}`);
    errors++;
    return;
  }

  if (!data) {
    console.error(`  FAIL ${relativePath}: empty file`);
    errors++;
    return;
  }

  const valid = validate(data);
  validated++;
  if (!valid) {
    console.error(`  FAIL ${relativePath}:`);
    for (const err of validate.errors) {
      console.error(`    ${err.instancePath || '/'} ${err.message}`);
    }
    errors++;
  }

  return data;
}

// Validate services and their embedded rulesets
console.log('Validating services...');
const serviceFiles = findFiles(dataDir, /\.yaml$/);
for (const file of serviceFiles) {
  const dirName = path.basename(path.dirname(file));
  if (dirName === 'services') {
    const data = validateFile(file, validateService, 'service');
    if (data && data.ruleset) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      const valid = validateRuleset(data.ruleset);
      validated++;
      if (!valid) {
        console.error(`  FAIL ${relativePath} (ruleset):`);
        for (const err of validateRuleset.errors) {
          console.error(`    ${err.instancePath || '/'} ${err.message}`);
        }
        errors++;
      }
    }
  } else if (dirName === 'agencies') {
    validateFile(file, validateAgency, 'agency');
  } else if (path.basename(file) === '_jurisdiction.yaml') {
    validateFile(file, validateJurisdiction, 'jurisdiction');
  }
}

console.log(`\n${validated} files validated, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
