/**
 * RulesetViewer - Displays eligibility rules in a legal document / query builder style
 *
 * Features:
 * - Full-page view: Legal document style with sections and conditions
 * - Compact view: Summary card for validation results
 * - Interactive: Expand/collapse nested conditions
 */

class RulesetViewer {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    this.options = {
      mode: 'full', // 'full' or 'compact'
      editable: false,
      showSources: true,
      ...options
    };
    this.ruleset = null;
    this.validationResult = null;
  }

  /**
   * Load and render a ruleset
   */
  render(ruleset, validationResult = null) {
    this.ruleset = ruleset;
    this.validationResult = validationResult;

    if (this.options.mode === 'full') {
      this.renderFullView();
    } else {
      this.renderCompactView();
    }
  }

  /**
   * Full-page legal document style view
   */
  renderFullView() {
    const html = `
      <article class="ruleset-viewer ruleset-viewer--full">
        <header class="ruleset-header">
          <div class="ruleset-meta">
            <span class="ruleset-jurisdiction">${this.ruleset.jurisdiction || 'Federal'}</span>
            <span class="ruleset-effective">Effective: ${this.ruleset.effective_date || 'Current'}</span>
          </div>
          <h1 class="ruleset-title">${this.ruleset.name || this.ruleset.service_id}</h1>
          ${this.ruleset.description ? `<p class="ruleset-description">${this.ruleset.description}</p>` : ''}
        </header>

        <section class="ruleset-body">
          <h2 class="ruleset-section-title">Eligibility Requirements</h2>
          <p class="ruleset-intro">To be eligible, an applicant <strong>must meet all</strong> of the following requirements:</p>

          <ol class="rules-list">
            ${this.ruleset.rules.map((rule, index) => this.renderRule(rule, index + 1)).join('')}
          </ol>
        </section>

        ${this.options.showSources && this.ruleset.source_urls ? `
          <footer class="ruleset-footer">
            <h3>Sources</h3>
            <ul class="sources-list">
              ${this.ruleset.source_urls.map(url => `<li><a href="${url}" target="_blank" rel="noopener">${url}</a></li>`).join('')}
            </ul>
          </footer>
        ` : ''}
      </article>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render a single rule as a legal-style clause
   */
  renderRule(rule, number, depth = 0) {
    const status = this.getValidationStatus(rule.id);
    const statusClass = status ? `rule--${status}` : '';
    const indent = depth > 0 ? 'rule--nested' : '';

    return `
      <li class="rule ${statusClass} ${indent}" data-rule-id="${rule.id}">
        <div class="rule-header">
          <span class="rule-number">${this.formatNumber(number, depth)}</span>
          <span class="rule-label">${rule.label || this.formatKey(rule.key)}</span>
          ${status ? `<span class="rule-status rule-status--${status}">${this.formatStatus(status)}</span>` : ''}
        </div>

        <div class="rule-condition">
          ${this.renderCondition(rule)}
        </div>

        ${rule.description ? `
          <div class="rule-description">
            ${rule.description}
          </div>
        ` : ''}

        ${rule.source_url && this.options.showSources ? `
          <div class="rule-source">
            <a href="${rule.source_url}" target="_blank" rel="noopener">Source</a>
          </div>
        ` : ''}

        ${rule.conditions && rule.conditions.length > 0 ? `
          <div class="rule-nested">
            <p class="rule-nested-intro">AND must also satisfy:</p>
            <ol class="rules-list rules-list--nested">
              ${rule.conditions.map((c, i) => this.renderRule(c, i + 1, depth + 1)).join('')}
            </ol>
          </div>
        ` : ''}

        ${rule.any_of && rule.any_of.length > 0 ? `
          <div class="rule-alternatives">
            <p class="rule-alternatives-intro">OR satisfy <strong>any one</strong> of the following:</p>
            <ul class="alternatives-list">
              ${rule.any_of.map((alt, i) => this.renderAlternative(alt, i + 1, depth + 1)).join('')}
            </ul>
          </div>
        ` : ''}
      </li>
    `;
  }

  /**
   * Render an alternative condition (for any_of)
   */
  renderAlternative(alt, number, depth) {
    const status = this.getValidationStatus(alt.id);
    const statusClass = status ? `alternative--${status}` : '';

    return `
      <li class="alternative ${statusClass}" data-rule-id="${alt.id}">
        <div class="alternative-condition">
          <span class="alternative-marker">OR</span>
          ${this.renderCondition(alt)}
          ${alt.description ? `<span class="alternative-description">- ${alt.description}</span>` : ''}
          ${status ? `<span class="rule-status rule-status--${status}">${this.formatStatus(status)}</span>` : ''}
        </div>
      </li>
    `;
  }

  /**
   * Render the condition expression in query-builder style
   */
  renderCondition(rule) {
    const key = `<span class="condition-key">${this.formatKey(rule.key)}</span>`;
    const op = `<span class="condition-operator">${this.formatOperator(rule.operator)}</span>`;

    let value = '';

    if (rule.operator === 'in' || rule.operator === 'not_in') {
      const values = rule.values || [];
      value = `<span class="condition-value condition-value--list">[${values.map(v => `<span class="condition-value-item">${this.formatValue(v)}</span>`).join(', ')}]</span>`;
    } else if (rule.operator === 'between') {
      value = `<span class="condition-value">${rule.min}</span> <span class="condition-operator">and</span> <span class="condition-value">${rule.max}</span>`;
    } else if (rule.operator === 'exists' || rule.operator === 'not_exists') {
      value = '';
    } else {
      value = `<span class="condition-value">${this.formatValue(rule.value)}${rule.unit ? ` <span class="condition-unit">${rule.unit}</span>` : ''}</span>`;
    }

    return `<code class="condition-expression">${key} ${op} ${value}</code>`;
  }

  /**
   * Compact view for validation results
   */
  renderCompactView() {
    const passedCount = this.validationResult?.passed?.length || 0;
    const failedCount = this.validationResult?.failed?.length || 0;
    const totalCount = passedCount + failedCount;
    const status = failedCount === 0 ? 'eligible' : 'ineligible';

    const html = `
      <div class="ruleset-viewer ruleset-viewer--compact ruleset-viewer--${status}">
        <div class="compact-header">
          <h3 class="compact-title">${this.ruleset.name || this.ruleset.service_id}</h3>
          <span class="compact-status compact-status--${status}">
            ${status === 'eligible' ? 'Potentially Eligible' : 'Not Eligible'}
          </span>
        </div>

        <div class="compact-summary">
          <span class="compact-stat compact-stat--passed">${passedCount} passed</span>
          <span class="compact-stat compact-stat--failed">${failedCount} failed</span>
        </div>

        ${failedCount > 0 ? `
          <div class="compact-failures">
            <h4>Requirements not met:</h4>
            <ul>
              ${this.validationResult.failed.map(f => `
                <li class="compact-failure">
                  <span class="compact-failure-label">${f.label || this.formatKey(f.key)}</span>
                  <span class="compact-failure-message">${f.message || 'Requirement not satisfied'}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <button class="compact-expand" data-action="expand">
          View full requirements
        </button>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Get validation status for a specific rule
   */
  getValidationStatus(ruleId) {
    if (!this.validationResult) return null;

    if (this.validationResult.passed?.some(r => r.id === ruleId)) {
      return 'passed';
    }
    if (this.validationResult.failed?.some(r => r.id === ruleId)) {
      return 'failed';
    }
    if (this.validationResult.skipped?.some(r => r.id === ruleId)) {
      return 'skipped';
    }
    return null;
  }

  /**
   * Format helpers
   */
  formatNumber(num, depth) {
    if (depth === 0) return `${num}.`;
    if (depth === 1) return `(${String.fromCharCode(96 + num)})`;
    return `(${this.toRoman(num).toLowerCase()})`;
  }

  formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatOperator(op) {
    const ops = {
      'equals': '=',
      'not_equals': '!=',
      'less_than': '<',
      'less_than_or_equal': '<=',
      'greater_than': '>',
      'greater_than_or_equal': '>=',
      'in': 'is one of',
      'not_in': 'is not one of',
      'between': 'is between',
      'exists': 'exists',
      'not_exists': 'does not exist',
      'matches': 'matches'
    };
    return ops[op] || op;
  }

  formatValue(val) {
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    if (typeof val === 'string') {
      return val.replace(/_/g, ' ');
    }
    return val;
  }

  formatStatus(status) {
    const statuses = {
      'passed': 'Met',
      'failed': 'Not Met',
      'skipped': 'Skipped'
    };
    return statuses[status] || status;
  }

  toRoman(num) {
    const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  /**
   * Event listeners for interactivity
   */
  attachEventListeners() {
    // Expand/collapse nested rules
    this.container.querySelectorAll('.rule-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const rule = e.target.closest('.rule');
        if (rule.querySelector('.rule-nested, .rule-alternatives')) {
          rule.classList.toggle('rule--collapsed');
        }
      });
    });

    // Expand button in compact view
    this.container.querySelectorAll('[data-action="expand"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.options.mode = 'full';
        this.renderFullView();
      });
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RulesetViewer;
}
