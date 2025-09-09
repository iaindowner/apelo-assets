<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@yaireo/tagify/dist/tagify.css"/>
<style>
  :root {
    --bg: #0f1220;
    --chip-issue-bg: #eef7ff;
    --chip-issue-text: #0a3d91;
    --chip-free-bg: #fff7ee;
    --chip-free-text: #8a3d00;
    --dd-sect-bg: #f1f3f7;
    --dd-sect-text: #4a5568;
    --focus-glow: #a78bfa; /* light purple */
  }
  body { margin: 0; padding: 14px; background: transparent; font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; }
  .search-shell { max-width: 100%; margin: 0 auto; }

.tagify {
    --tag-padding: 6px 8px;
    --tags-border-color: rgba(0,0,0,.1);
    --tags-hover-border-color: rgba(0,0,0,.2);
    --tag-bg: #f5f6fa;
    --tag-text-color: #111827;
    --tag-remove-btn-bg: transparent;
    --tag-inset-shadow-size: 0;
    --tag-border-radius: 999px;     /* make tags pill-shaped */
    overflow: visible;              /* <= important */
    position: relative;             /* helps with stacking */
    width: 100%;
    border-radius: 999px;           /* fully rounded search bar */
    box-shadow: 0 1px 2px rgba(0,0,0,.04);
    transition: box-shadow .15s ease, border-color .15s ease;
  }
  .tagify:focus-within {
    animation: glow-cycle 8s linear infinite;
    border-color: rgba(167,139,250,.35);
  }

  @keyframes glow-cycle {
    0%   { box-shadow: 0 0 8px 0 #ff00ff; }
    25%  { box-shadow: 0 0 8px 0 #38bdf8; }
    50%  { box-shadow: 0 0 8px 0 #1db954; }
    75% { box-shadow: 0 0 8px 0 #a78bfa; }
      100%   { box-shadow: 0 0 8px 0 #ff00ff; }
  }
  .tagify__tag {
    border-radius: 999px !important;
  }
  .tagify__tag x.tagify__tag__removeBtn {
    border-radius: 999px;
  }

  .tagify__tag.tag--issue { background: var(--chip-issue-bg); color: var(--chip-issue-text); border-color: rgba(10,61,145,.15); }
  .tagify__tag.tag--free  { background: var(--chip-free-bg);  color: var(--chip-free-text);  border-color: rgba(138,61,0,.15); }

  .tagify__tag .badge {
    font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; margin-left: 6px; opacity: .85;
  }
  .tagify__tag.tag--issue .badge { background: rgba(10,61,145,.12); color: var(--chip-issue-text); }
  .tagify__tag.tag--free  .badge { background: rgba(138,61,0,.12); color: var(--chip-free-text); }

  /* Make the OUTER container transparent and non-clipping */
.tagify__dropdown {
    position: absolute !important;   /* anchor to the .tagify wrapper */
    left: 0 !important;
    right: 0 !important;
    top: calc(100% + 8px) !important; /* always below */
    bottom: auto !important;
    transform: none !important;       /* cancel any translate from Tagify */
    margin: 0 !important;
    border: 0;
    border-radius: 0;
    background: transparent;
    overflow: visible;
    box-shadow: none;
    z-index: 9999;
  }

  /* Even if Tagify tries to place above, keep it below */
  .tagify__dropdown--above,
  .tagify__dropdown[placement^="top"] {
    top: calc(100% + 8px) !important;
    bottom: auto !important;
    transform: none !important;
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
  max-height: 50vh;
  overflow: auto;
  width: 100%;
}
  .tagify__dropdown__itemsGroup { padding: 6px 0 8px; }
  .tagify__dropdown__itemsGroup::before {
    content: attr(data-title);
    display: block; font-size: 11px; font-weight: 700; letter-spacing: .02em;
    color: var(--dd-sect-text); background: var(--dd-sect-bg);
    padding: 6px 10px; margin: 0 6px 6px; border-radius: 8px;
  }
  .tagify__dropdown__item { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
  .tagify__dropdown__item .hint { font-size: 11px; opacity: .65; }
  .tagify__dropdown__item.free-suggestion strong { color: var(--chip-free-text); }
  .tagify__dropdown__item.free-suggestion .hint { color: var(--chip-free-text); opacity: .85; }
    
    #issueSearch {
  width: 100%;
  box-sizing: border-box;
}
</style>
</head>
<body>
  <div class="search-shell">
    <input id="issueSearch" placeholder="Type to search… (e.g., Green Belt, Heritage)" />
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@yaireo/tagify"></script>
  <script>

   // --- Static “Issues” for design/testing ---
const ISSUES = [
  { name:"Green Belt",                      flag:"green_belt" },
  { name:"Housing Land Supply",             flag:"housing_land_supply" },
  { name:"Biodiversity Net Gain (BNG)",     flag:"bng" },
  { name:"Heritage",                        flag:"heritage" },
  { name:"Listed Building",                 flag:"listed_building" },
  { name:"Conservation Area",               flag:"conservation_area" },
  { name:"National Landscape (AONB)",       flag:"aonb_national_landscape" },
  { name:"Sequential Test",                 flag:"sequential_test" },
  { name:"Flood Risk",                      flag:"flood_risk" },
  { name:"Affordable Housing",              flag:"affordable_housing" },
  { name:"Self-build & Custom Housing",     flag:"self_build_custom_housing" },
  { name:"General Permitted Development",   flag:"gpdo" },
  { name:"Class Q (Agricultural to Dwellings)",         flag:"class_q" },
  { name:"Householder Appeal",              flag:"householder" },
  { name:"Extensions to Dwellings",         flag:"extensions_dwelling" },
  { name:"Residential",                     flag:"type_residential" },
  { name:"Commercial",                      flag:"type_commercial" },
  { name:"Mixed Use",                       flag:"type_mixed_use" },
  { name:"New Dwellings",                   flag:"new_residential_dwellings" },
  { name:"Enforcement",                     flag:"enforcement" },
  { name:"Renewables (Solar/Wind etc.)",    flag:"renewables" },
  { name:"Tourism", flag:"tourism" },
  { name:"Habitats Regulations (HRA)",      flag:"hra" },
  { name:"Highways",                        flag:"highways" },
  { name:"Traveller/Gypsy Sites",           flag:"traveller_sites" }
];
const baseWhitelist = ISSUES.map(x => ({ value:x.name, name:x.name, flag:x.flag, group:"Issues", type:"issue" }));

const input = document.getElementById('issueSearch');

function tagTemplate(tagData){
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
}

function dropdownItemTemplate(item){
  const isFree = item.type === 'free';
  const cls    = `tagify__dropdown__item ${isFree ? 'free-suggestion' : ''}`;
  const main   = item.name || item.value;
  const hint   = item.type === 'issue' ? 'Planning issue' : 'Free text search';
  return `
    <div ${this.getAttributes(item)} class="${cls}" tabindex="0" role="option">
      <strong>${main}</strong>
      <span class="hint">${hint}</span>
    </div>`;
}

// Helper used by custom dropdown renderer
function escapeHTML(s){
  return typeof s === 'string'
    ? s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;").replace(/`|'/g,"&#039;")
    : s;
}

const tagify = new Tagify(input, {
  enforceWhitelist: false,     // allow free text
  skipInvalid: true,
  addTagOnBlur: false,         // never auto-chip on blur
  pasteAsTags: false,          // <- do NOT convert pasted text into tags
  delimiters: null,            // <- do not split pasted text into tags
  tagTextProp: 'name',
  dropdown: {
    enabled: 0,
    closeOnSelect: false,
    maxItems: 50,
    fuzzySearch: true,
    highlightFirst: true,
    searchKeys: ['name','value'],
    placeAbove: false,
    position: 'input'
  },
  templates: { tag: tagTemplate, dropdownItem: dropdownItemTemplate },
  whitelist: baseWhitelist
});

tagify.on('dropdown:show', () => {
  const dd = tagify.DOM && tagify.DOM.dropdown;
  if (dd) {
    dd.classList.remove('tagify__dropdown--above');
    dd.setAttribute('placement', 'bottom');
    dd.style.transform = 'none';
    dd.style.bottom = 'auto';
    // Let CSS control the final position:
    dd.style.top = '';
    dd.style.left = '';
    dd.style.right = '';
  }
});
let suppressAutoOpen = false;
// Grouped dropdown renderer (bind to the instance)
tagify.dropdown.createListHTML = (suggestionsList) => {
  const t = tagify;
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

// --- helper to recompute suggestions ---
function buildSuggestions(q){
  const query = (q || '').trim().toLowerCase();
  const base  = query
    ? baseWhitelist.filter(i => i.name.toLowerCase().includes(query))
    : baseWhitelist.slice();

  const hasExact = query && base.some(i => i.name.toLowerCase() === query);
  if (query && !hasExact) {
    base.push({
      value: q, name: `Search “${q}”`, raw: q,
      group: 'Free text', type: 'free', class: 'free-suggestion'
    });
  }
  return base;
}

function refreshWhitelist(q, {show=false} = {}){
  const suggestions = buildSuggestions(q);
  tagify.settings.whitelist = suggestions;
  if (show) tagify.dropdown.show(q);
}
      
      function resetSuggestions({ open = false } = {}) {
  // clear any typed text
  if (typeof tagify.setInputValue === 'function') tagify.setInputValue('');
  if (tagify.DOM?.input) tagify.DOM.input.textContent = '';

  // refresh the whitelist
  refreshWhitelist('', { show: false });

  // (re)open only if the input is focused & requested
  const isFocused =
    document.activeElement === tagify.DOM.input ||
    tagify.DOM.scope.contains(document.activeElement);

  if (open && isFocused && !suppressAutoOpen) {
    // let Tagify finish its own "add" housekeeping, then show
    setTimeout(() => tagify.dropdown.show(''), 0);
  } else {
    tagify.dropdown.hide();
  }
}

// Figure out the parent window's origin (Wix serves the iframe from filesusr.com)
function getParentOrigin() {
  try {
    const ref = document.referrer || '';
    const o = new URL(ref).origin;
    // if Wix strips/referrer is empty, fall back to wildcard to ensure delivery
    return o || '*';
  } catch (_) {
    return '*';
  }
}

// Notify parent page with the full set of FREE-TEXT chips
function getFreeTerms(){
  return (tagify.value || [])
    .filter(t => t.type === 'free' || t.free)
    .map(t => (t.value || t.name || '').trim())
    .filter(Boolean);
}
function getIssueFlags(){
  return (tagify.value || [])
    .filter(t => t.type === 'issue' && t.flag)
    .map(t => String(t.flag))
    .filter(Boolean);
}
function getAllTermsAndFlags(){
  return { terms: getFreeTerms(), flags: getIssueFlags() };
}

function sendSearchPayload(){
  const { terms, flags } = getAllTermsAndFlags();
  const payload = JSON.stringify({ terms, flags });
  if (payload === window.__lastSearchPayloadJSON) return;
  window.__lastSearchPayloadJSON = payload;
  try {
    window.parent?.postMessage({ type:'ISSUE_TEXT_QUERY', terms, flags }, getParentOrigin());
  } catch (_) {}
}
const sendSearchPayloadDebounced = debounce(sendSearchPayload, 150);

// Simple debounce to coalesce rapid event bursts (dropdown:select -> add, etc.)
function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Treat non-exact values as FREE, exact issues as ISSUE
tagify.settings.transformTag = (tagData) => {
  const raw = (tagData.raw ?? tagData.value ?? tagData.name ?? '').toString().trim();
  const match = ISSUES.find(n => n.name.toLowerCase() === raw.toLowerCase());
  tagData.value = raw;
  tagData.name  = raw;
  if (match) {
    tagData.type = 'issue';
    tagData.free = false;
    tagData.flag = match.flag;
  } else {
    tagData.type = 'free';
    tagData.free = true;
    delete tagData.flag;
  }
};

// Validate: allow all (design-only)
tagify.settings.validate = () => true;

// INPUT: live suggestions + free-text option
tagify.on('input', (e) => {
  suppressAutoOpen = false;
  const q = (e.detail.value || '').trim();
  refreshWhitelist(q, { show: true });
  sendSearchPayloadDebounced();
});

// PASTE: behave like typing (no chips)
tagify.DOM.input.addEventListener('paste', (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text') || '';

  // Put the raw text into Tagify's input area (no tag)
  if (typeof tagify.setInputValue === 'function') {
    tagify.setInputValue(text);
  } else {
    tagify.DOM.input.textContent = text;
  }

  // Fire a native input event so Tagify updates its internal state
  tagify.DOM.input.dispatchEvent(new Event('input', { bubbles: true }));

  // Show the dropdown for that text immediately
  refreshWhitelist(text, { show: true });
});

// Keyboard: Enter adds free tag when no suggestion is active; Escape blurs (even if dropdown is open)
tagify.DOM.scope.addEventListener('keydown', (e) => {
  // ESC: blur and hide dropdown regardless of state
  if (e.key === 'Escape') {
    e.preventDefault();
    try { tagify.dropdown.hide(); } catch (_) {}
    if (tagify.DOM?.input) tagify.DOM.input.blur();
    return;
  }

  // ENTER flow
  if (e.key !== 'Enter' || e.isComposing) return;

  // If a suggestion is highlighted, let Tagify handle it (will trigger 'add' later)
  const hasHighlighted = !!document.querySelector('.tagify__dropdown__item--active');
  if (hasHighlighted) return;

  // Otherwise, add a tag based on raw input (issue if exact match, else free)
  const raw = (tagify.DOM.input.textContent || '').trim();
  if (!raw) return;

  const isExactIssue = ISSUES.some(n => n.name.toLowerCase() === raw.toLowerCase());
  e.preventDefault();
  tagify.addTags([{ value: raw, name: raw, type: isExactIssue ? 'issue' : 'free', free: !isExactIssue }]);
  sendSearchPayload();
  suppressAutoOpen = true;

  // fully reset after adding
  resetSuggestions({ open: false });
});
      
// DROPDOWN SELECT: ensure free suggestion turns into clean free chip text
tagify.on('dropdown:select', (e) => {
  const item = e.detail.data || {};
  if (item.type === 'free') {
    const raw = item.raw || item.value || item.name || '';
    setTimeout(() => {
      const last = tagify.value[tagify.value.length - 1];
      if (last) {
        last.value = raw;
        last.name  = raw;
        last.type  = 'free';
        last.free  = true;
        tagify.loadOriginalValues(tagify.value);
      }
      sendSearchPayload(); // send immediately on confirm
      suppressAutoOpen = true;
      // NEW: reset after confirming via dropdown
      // fully reset & keep dropdown open
      resetSuggestions({ open: false });
    }, 0);
  } else {
    // If a normal issue was selected, also reset
    suppressAutoOpen = true;
    setTimeout(() => {
      resetSuggestions({ open: false });
      sendSearchPayload();
    }, 0);
  }
});

// BLUR: don't auto-chip & don't delete pasted/typed text; just reset the dropdown list
tagify.on('blur', () => {
  suppressAutoOpen = false;
  const q = (tagify.DOM.input.textContent || '').trim(); // keep whatever is typed/pasted
  tagify.dropdown.hide();
  // Reset the suggestions to the base (or to whatever matches current input)
  refreshWhitelist(q, { show: false });
});

// FOCUS: when the user focuses back in, re-open the dropdown
tagify.on('focus', () => {
  suppressAutoOpen = false;
  const q = (tagify.DOM.input.textContent || '').trim();
  refreshWhitelist(q, { show: true });
});
      
tagify.on('add', () => {
  // Defer so any dropdown-to-free conversion finishes, then send the full terms list
  setTimeout(() => {
    sendSearchPayload();
    suppressAutoOpen = true;
    resetSuggestions({ open: false });
  }, 0);
});
tagify.on('remove', () => {
  setTimeout(() => {
    sendSearchPayloadDebounced();
    resetSuggestions({ open: false });
  }, 0);
});
  </script>
</body>
</html>
