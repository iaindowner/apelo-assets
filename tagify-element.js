// tagify-element.js
class ApeloTagify extends HTMLElement {
  static get observedAttributes() {
    return ["issues", "placeholder"];
  }

  constructor() {
    super();

    // defaults (overridable via attributes)
    this._issues = ["Green Belt","Heritage","Listed Building","Valued Landscape","Residential"];
    this._placeholder = "Type to search… (e.g., Green Belt, Heritage)";

    // Shadow DOM
    this.root = this.attachShadow({ mode: "open" });

    // host sizing
    this.style.display = "block";
    this.style.width = "100%";

    // container
    this.wrapper = document.createElement("div");
    this.wrapper.className = "search-shell";
    this.wrapper.innerHTML = `
      <div class="label">Search appeals by planning issue or free text</div>
      <input id="issueSearch" />
    `;
    this.root.appendChild(this.wrapper);

    // styles (copied from your working iframe version)
    const style = document.createElement("style");
    style.textContent = `
      :host { display:block; width:100%; }
      .search-shell { max-width:100%; margin:0 auto; }
      .label { font-size:14px; margin-bottom:8px; color:#6b7280; }

      .tagify {
        --tag-padding: 6px 8px;
        --tags-border-color: rgba(0,0,0,.1);
        --tags-hover-border-color: rgba(0,0,0,.2);
        --tag-bg: #f5f6fa;
        --tag-text-color: #111827;
        --tag-remove-btn-bg: transparent;
        --tag-inset-shadow-size: 0;
        overflow: visible;            /* <= important */
        position: relative;           /* helps with stacking */
        width: 100%;
        border-radius: 10px;
        box-shadow: 0 1px 2px rgba(0,0,0,.04);
      }
      .tagify__tag.tag--issue { background: #eef7ff; color: #0a3d91; border-color: rgba(10,61,145,.15); }
      .tagify__tag.tag--free  { background: #fff7ee; color: #8a3d00; border-color: rgba(138,61,0,.15); }

      .tagify__tag .badge {
        font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; margin-left: 6px; opacity: .85;
      }
      .tagify__tag.tag--issue .badge { background: rgba(10,61,145,.12); color: #0a3d91; }
      .tagify__tag.tag--free  .badge { background: rgba(138,61,0,.12); color: #8a3d00; }

      /* Make the OUTER container transparent and non-clipping */
      .tagify__dropdown {
        margin-top: 6px;             /* gap from input */
        border: 0;                   /* no visible border here */
        border-radius: 0;            /* radius handled by wrapper */
        background: transparent;     /* let wrapper provide white bg */
        overflow: visible;           /* don't clip the wrapper */
        box-shadow: none;            /* shadow handled by wrapper */
        z-index: 9999;
      }

      /* Give the INNER wrapper the visual box */
      .tagify__dropdown__wrapper {
        margin: 0;                   /* ensure no negative overlap */
        padding-top: 4px;            /* small breathing space for header */
        background: #fff;            /* the white panel */
        border: 1px solid #e5e7eb;   /* visible border */
        border-radius: 12px;         /* rounded corners here */
        box-shadow: 0 12px 24px rgba(0,0,0,.08);
      background-clip: padding-box;
        overflow: hidden;            /* clip children to the radius */
      }

      .tagify__dropdown__itemsGroup { padding: 6px 0 8px; }
      .tagify__dropdown__itemsGroup::before {
        content: attr(data-title);
        display: block; font-size: 11px; font-weight: 700; letter-spacing: .02em;
        color: #4a5568; background: #f1f3f7;
        padding: 6px 10px; margin: 0 6px 6px; border-radius: 8px;
      }
      .tagify__dropdown__item { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
      .tagify__dropdown__item .hint { font-size: 11px; opacity: .65; }
      .tagify__dropdown__item.free-suggestion strong { color: #8a3d00; }
      .tagify__dropdown__item.free-suggestion .hint { color: #8a3d00; opacity: .85; }

      input#issueSearch { width:100%; box-sizing:border-box; }
    `;

    // Tagify CSS (inside shadow)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@yaireo/tagify/dist/tagify.css";

    this.root.appendChild(link);
    this.root.appendChild(style);

    // Resize host as content grows
    this.ro = new ResizeObserver(() => this.autoSize());
    this.ro.observe(this.wrapper);
  }

  async connectedCallback() {
    // apply placeholder
    this.root.getElementById("issueSearch")
      .setAttribute("placeholder", this._placeholder);

    // load Tagify script once
    await this.ensureScript("https://cdn.jsdelivr.net/npm/@yaireo/tagify/dist/tagify.min.js");

    // init Tagify with same behavior as your working HTML
    this.initTagify();
    this.autoSize();
  }

  disconnectedCallback() {
    this.ro?.disconnect();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "issues") {
      try { this._issues = JSON.parse(newVal); } catch {}
      if (this.tagify) {
        this.baseWhitelist = this._issues.map(n => ({ value:n, name:n, group:"Issues", type:"issue" }));
        this.refreshWhitelist("", { show:false });
      }
    }
    if (name === "placeholder") {
      this._placeholder = newVal || this._placeholder;
      const inp = this.root.getElementById("issueSearch");
      if (inp) inp.setAttribute("placeholder", this._placeholder);
    }
  }

  autoSize() {
    const h = this.wrapper.scrollHeight;
    this.style.height = h + "px";
  }

  ensureScript(src) {
    return new Promise((res, rej) => {
      if (window.Tagify) return res();
      let s = document.querySelector(`script[data-apelo="${src}"]`);
      if (!s) {
        s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.setAttribute("data-apelo", src);
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      } else {
        s.onload ? (s.onload = () => res()) : res();
      }
    });
  }

  initTagify() {
    const input = this.root.getElementById("issueSearch");

    const tagTemplate = function (tagData) {
      const isFree = tagData.type === 'free' || tagData.free === true;
      const cls    = isFree ? 'tag--free' : 'tag--issue';
      const badge  = isFree ? 'Free text' : 'Issue';
      const name   = tagData.name || tagData.value;

      return `
        <tag title="${name}" contenteditable="false" spellcheck="false" tabindex="-1"
             class="tagify__tag ${cls}" ${this.getAttributes(tagData)}>
          <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
          <div>
            <span class="tagify__tag-text">${name}</span>
            <span class="badge">${badge}</span>
          </div>
        </tag>`;
    };

    const dropdownItemTemplate = function (item) {
      const isFree = item.type === 'free';
      const cls    = `tagify__dropdown__item ${isFree ? 'free-suggestion' : ''}`;
      const main   = item.name || item.value;
      const hint   = isFree ? 'Free text search' : 'Planning issue';
      return `
        <div ${this.getAttributes(item)} class="${cls}" tabindex="0" role="option">
          <strong>${main}</strong>
          <span class="hint">${hint}</span>
        </div>`;
    };

    const escapeHTML = (s) =>
      typeof s === "string"
        ? s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;").replace(/`|'/g,"&#039;")
        : s;

    // base whitelist from attribute or default
    this.baseWhitelist = (this._issues || []).map(name => ({
      value: name, name, group: "Issues", type: "issue"
    }));

    this.tagify = new window.Tagify(input, {
      enforceWhitelist: false,     // allow free text
      skipInvalid: true,
      addTagOnBlur: false,         // don't chip on blur
      pasteAsTags: false,          // pasted text acts like typing
      delimiters: null,            // don't split pasted text
      tagTextProp: 'name',
      dropdown: {
        enabled: 0,
        closeOnSelect: false,
        maxItems: 50,
        fuzzySearch: true,
        highlightFirst: true,
        searchKeys: ['name','value']
      },
      templates: { tag: tagTemplate, dropdownItem: dropdownItemTemplate },
      whitelist: this.baseWhitelist
    });

    // grouped dropdown renderer (same as working HTML)
    this.tagify.dropdown.createListHTML = (suggestionsList) => {
      const t = this.tagify;
      const grouped = suggestionsList.reduce((acc, s) => {
        const grp = s.group || 'Other';
        (acc[grp] ||= []).push(s);
        return acc;
      }, {});
      const renderItems = (items) =>
        items.map((s) => {
          if (typeof s === 'string' || typeof s === 'number') s = { value: String(s) };
          const mapped = t.dropdown.getMappedValue.call(t, s);
          s.value = mapped && typeof mapped === 'string' ? escapeHTML(mapped) : mapped;
          return t.settings.templates.dropdownItem.apply(t, [s]);
        }).join('');
      return Object.entries(grouped)
        .map(([title, items]) =>
          `<div class="tagify__dropdown__itemsGroup" data-title="${title}">${renderItems(items)}</div>`)
        .join('');
    };

    // helpers (same logic as your working HTML)
    this.buildSuggestions = (q) => {
      const query = (q || '').trim().toLowerCase();
      const base  = query
        ? this.baseWhitelist.filter(i => i.name.toLowerCase().includes(query))
        : this.baseWhitelist.slice();

      const hasExact = query && base.some(i => i.name.toLowerCase() === query);
      if (query && !hasExact) {
        base.push({
          value: q, name: `Search “${q}”`, raw: q,
          group: 'Free text', type: 'free', class: 'free-suggestion'
        });
      }
      return base;
    };

    this.refreshWhitelist = (q, { show=false } = {}) => {
      const suggestions = this.buildSuggestions(q);
      this.tagify.settings.whitelist = suggestions;
      if (show) this.tagify.dropdown.show(q);
    };

    this.resetSuggestions = ({ open = false } = {}) => {
      if (typeof this.tagify.setInputValue === 'function') this.tagify.setInputValue('');
      if (this.tagify.DOM?.input) this.tagify.DOM.input.textContent = '';

      this.refreshWhitelist('', { show:false });

      // (re)open only if the input is focused & requested
      const isFocused =
        document.activeElement === this.tagify.DOM.input ||
        this.tagify.DOM.scope.contains(document.activeElement);

      if (open && isFocused) {
        setTimeout(() => this.tagify.dropdown.show(''), 0);
      } else {
        this.tagify.dropdown.hide();
      }
    };

    // semantics
    this.tagify.settings.transformTag = (tagData) => {
      const raw = (tagData.raw ?? tagData.value ?? tagData.name ?? '').toString().trim();
      const isExactIssue = (this._issues || []).some(n => n.toLowerCase() === raw.toLowerCase());
      tagData.value = raw;
      tagData.name  = raw;
      tagData.type  = isExactIssue ? 'issue' : 'free';
      tagData.free  = !isExactIssue;
    };

    this.tagify.settings.validate = () => true;

    // EVENTS (mirror working HTML)

    // input: live suggestions + free-text option
    this.tagify.on('input', (e) => {
      const q = (e.detail.value || '').trim();
      this.refreshWhitelist(q, { show: true });
      this.dispatchEvent(new CustomEvent('inputChange', { detail: { query:q }, bubbles:true }));
    });

    // paste: behave like typing
    this.tagify.DOM.input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text') || '';
      if (typeof this.tagify.setInputValue === 'function') this.tagify.setInputValue(text);
      else this.tagify.DOM.input.textContent = text;
      this.tagify.DOM.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.refreshWhitelist(text, { show: true });
    });

    // enter: add as free/issue if nothing highlighted; keep dropdown open
    this.tagify.DOM.scope.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.isComposing) return;

      const hasHighlighted = !!this.root.querySelector('.tagify__dropdown__item--active');
      if (hasHighlighted) return;

      const raw = (this.tagify.DOM.input.textContent || '').trim();
      if (!raw) return;

      const isExactIssue = (this._issues || []).some(n => n.toLowerCase() === raw.toLowerCase());
      e.preventDefault();
      this.tagify.addTags([{ value: raw, name: raw, type: isExactIssue ? 'issue' : 'free', free: !isExactIssue }]);

      this.resetSuggestions({ open: true });
    });

    // dropdown select: normalize free-suggestion to clean free chip, then reset/open
    this.tagify.on('dropdown:select', (e) => {
      const item = e.detail.data || {};
      if (item.type === 'free') {
        const raw = item.raw || item.value || item.name || '';
        setTimeout(() => {
          const last = this.tagify.value[this.tagify.value.length - 1];
          if (last) {
            last.value = raw;
            last.name  = raw;
            last.type  = 'free';
            last.free  = true;
            this.tagify.loadOriginalValues(this.tagify.value);
          }
          this.resetSuggestions({ open: true });
        }, 0);
      } else {
        setTimeout(() => this.resetSuggestions({ open: true }), 0);
      }
    });

    // blur: do not auto-chip; just reset the list
    this.tagify.on('blur', () => {
      const q = (this.tagify.DOM.input.textContent || '').trim();
      this.tagify.dropdown.hide();
      this.refreshWhitelist(q, { show: false });
    });

    // keep dropdown open after add/remove
    this.tagify.on('add', () => this.resetSuggestions({ open: true }));
    this.tagify.on('remove', () => this.resetSuggestions({ open: true }));

    // initial size
    this.autoSize();
  }

  emitTags() {
    const value = (this.tagify?.value || []).map(t => ({ value:t.value, type:t.type }));
    this.dispatchEvent(new CustomEvent("tagsChange", { detail: { value }, bubbles:true }));
  }
}

customElements.define("apelo-tagify", ApeloTagify);