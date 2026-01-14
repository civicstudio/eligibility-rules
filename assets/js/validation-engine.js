/**
 * ValidationEngine - Matches user attributes against rulesets
 *
 * Produces validation events similar to Ecto changesets:
 * - valid: boolean
 * - changes: applied attribute values
 * - errors: list of validation failures
 * - data: original ruleset
 *
 * Events can be logged for analytics and debugging.
 */

class ValidationEngine {
  constructor(options = {}) {
    this.options = {
      logEvents: true,
      eventCallback: null,
      ...options
    };
    this.eventLog = [];
  }

  /**
   * Validate user attributes against a ruleset
   * Returns a changeset-style result
   */
  validate(ruleset, attributes) {
    const startTime = Date.now();
    const result = {
      valid: true,
      service_id: ruleset.service_id,
      timestamp: new Date().toISOString(),
      changes: { ...attributes },
      errors: [],
      passed: [],
      failed: [],
      skipped: [],
      data: ruleset
    };

    // Evaluate each rule
    for (const rule of ruleset.rules) {
      this.evaluateRule(rule, attributes, result);
    }

    // Set overall validity
    result.valid = result.failed.length === 0;
    result.duration_ms = Date.now() - startTime;

    // Create and log event
    const event = this.createEvent(result);
    if (this.options.logEvents) {
      this.logEvent(event);
    }

    return result;
  }

  /**
   * Evaluate a single rule against attributes
   */
  evaluateRule(rule, attributes, result) {
    const key = rule.key;
    const value = attributes[key];

    // Check if attribute exists
    if (value === undefined && rule.operator !== 'not_exists') {
      // For required rules, missing value is a failure
      if (rule.requirement !== 'optional') {
        result.skipped.push({
          id: rule.id,
          key: rule.key,
          label: rule.label,
          reason: 'missing_attribute',
          message: `Missing required attribute: ${rule.key}`
        });
      }
      return;
    }

    // Evaluate the condition
    const passed = this.evaluateCondition(rule, value, attributes);

    if (passed) {
      result.passed.push({
        id: rule.id,
        key: rule.key,
        label: rule.label,
        value: value
      });

      // Evaluate nested conditions (AND logic)
      if (rule.conditions) {
        for (const condition of rule.conditions) {
          this.evaluateRule(condition, attributes, result);
        }
      }
    } else {
      // Check for alternatives (OR logic)
      if (rule.any_of && rule.any_of.length > 0) {
        const anyPassed = rule.any_of.some(alt => {
          const altValue = attributes[alt.key];
          return this.evaluateCondition(alt, altValue, attributes);
        });

        if (anyPassed) {
          result.passed.push({
            id: rule.id,
            key: rule.key,
            label: rule.label,
            value: value,
            satisfied_by: 'alternative'
          });
          return;
        }
      }

      // Rule failed
      if (rule.requirement === 'disqualifying') {
        result.failed.push({
          id: rule.id,
          key: rule.key,
          label: rule.label,
          value: value,
          expected: this.describeExpectation(rule),
          message: `Disqualifying condition: ${rule.label || rule.key}`,
          severity: 'disqualifying'
        });
        result.errors.push({
          field: rule.key,
          message: rule.description || `Does not meet ${rule.label || rule.key} requirement`
        });
      } else if (rule.requirement !== 'optional') {
        result.failed.push({
          id: rule.id,
          key: rule.key,
          label: rule.label,
          value: value,
          expected: this.describeExpectation(rule),
          message: `Requirement not met: ${rule.label || rule.key}`
        });
        result.errors.push({
          field: rule.key,
          message: rule.description || `Does not meet ${rule.label || rule.key} requirement`
        });
      }
    }
  }

  /**
   * Evaluate a condition expression
   */
  evaluateCondition(rule, value, attributes) {
    const { operator } = rule;

    switch (operator) {
      case 'equals':
        return value === rule.value;

      case 'not_equals':
        return value !== rule.value;

      case 'less_than':
        return Number(value) < Number(rule.value);

      case 'less_than_or_equal':
        return Number(value) <= Number(rule.value);

      case 'greater_than':
        return Number(value) > Number(rule.value);

      case 'greater_than_or_equal':
        return Number(value) >= Number(rule.value);

      case 'in':
        return rule.values?.includes(value);

      case 'not_in':
        return !rule.values?.includes(value);

      case 'between':
        const num = Number(value);
        return num >= Number(rule.min) && num <= Number(rule.max);

      case 'exists':
        return value !== undefined && value !== null;

      case 'not_exists':
        return value === undefined || value === null;

      case 'matches':
        return new RegExp(rule.value).test(String(value));

      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Describe what was expected for error messages
   */
  describeExpectation(rule) {
    const { operator, value, values, min, max, unit } = rule;
    const unitStr = unit ? ` ${unit}` : '';

    switch (operator) {
      case 'equals':
        return `${value}${unitStr}`;
      case 'not_equals':
        return `not ${value}${unitStr}`;
      case 'less_than':
        return `< ${value}${unitStr}`;
      case 'less_than_or_equal':
        return `<= ${value}${unitStr}`;
      case 'greater_than':
        return `> ${value}${unitStr}`;
      case 'greater_than_or_equal':
        return `>= ${value}${unitStr}`;
      case 'in':
        return `one of [${values?.join(', ')}]`;
      case 'not_in':
        return `not one of [${values?.join(', ')}]`;
      case 'between':
        return `between ${min} and ${max}${unitStr}`;
      case 'exists':
        return 'exists';
      case 'not_exists':
        return 'does not exist';
      default:
        return rule.value;
    }
  }

  /**
   * Create a validation event for logging
   */
  createEvent(result) {
    return {
      type: 'validation',
      timestamp: result.timestamp,
      service_id: result.service_id,
      valid: result.valid,
      passed_count: result.passed.length,
      failed_count: result.failed.length,
      skipped_count: result.skipped.length,
      duration_ms: result.duration_ms,
      errors: result.errors.map(e => ({
        field: e.field,
        message: e.message
      })),
      // Don't log actual attribute values for privacy
      attributes_provided: Object.keys(result.changes)
    };
  }

  /**
   * Log a validation event
   */
  logEvent(event) {
    this.eventLog.push(event);

    // Call custom callback if provided
    if (this.options.eventCallback) {
      this.options.eventCallback(event);
    }

    // Also log to console in development
    if (typeof console !== 'undefined') {
      console.log('[ValidationEvent]', event);
    }
  }

  /**
   * Get all logged events
   */
  getEventLog() {
    return [...this.eventLog];
  }

  /**
   * Clear the event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Export events as JSON for external logging
   */
  exportEvents() {
    return JSON.stringify(this.eventLog, null, 2);
  }
}

/**
 * ValidationResult - Helper class for working with validation results
 * Similar to Ecto.Changeset interface
 */
class ValidationResult {
  constructor(result) {
    this.result = result;
  }

  get valid() {
    return this.result.valid;
  }

  get errors() {
    return this.result.errors;
  }

  get changes() {
    return this.result.changes;
  }

  /**
   * Check if a specific field has an error
   */
  hasError(field) {
    return this.result.errors.some(e => e.field === field);
  }

  /**
   * Get error message for a field
   */
  getError(field) {
    const error = this.result.errors.find(e => e.field === field);
    return error?.message || null;
  }

  /**
   * Get all errors as a map
   */
  getErrorsMap() {
    const map = {};
    for (const error of this.result.errors) {
      if (!map[error.field]) {
        map[error.field] = [];
      }
      map[error.field].push(error.message);
    }
    return map;
  }

  /**
   * Check if eligible (alias for valid)
   */
  isEligible() {
    return this.valid;
  }

  /**
   * Get summary of results
   */
  getSummary() {
    return {
      eligible: this.valid,
      service: this.result.service_id,
      passed: this.result.passed.length,
      failed: this.result.failed.length,
      skipped: this.result.skipped.length
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ValidationEngine, ValidationResult };
}
