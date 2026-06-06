# Task 224: Add Standard print-color-adjust CSS Property

**Task**: task-224  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P3  
**Status**: not_started  
**Estimated**: 0.25 hours  
**Carryover**: audit-29-F5  

## Objective

Add the standard `print-color-adjust: exact` CSS property alongside the deprecated vendor-prefixed versions in the `@media print` block.

## Context

At `styles.css:227`:
```css
* { color-adjust: exact; -webkit-print-color-adjust: exact; }
```

Both `color-adjust` and `-webkit-print-color-adjust` show deprecation warnings in Chrome DevTools. The standard replacement is `print-color-adjust`. All three should be present for maximum compatibility:

```css
* { print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact; }
```

## Steps

1. Add `print-color-adjust: exact;` as the first declaration (standard property first)
2. Keep `-webkit-print-color-adjust: exact;` for Safari/older Chrome
3. Keep `color-adjust: exact;` for very old browsers (or remove if unused)

## Verification

- [ ] No `color-adjust` deprecation warnings in Chrome DevTools
- [ ] Print output still shows colors correctly
- [ ] Safari print output unaffected
