# Event interface update

The event decision screen now combines narrative, action comparison, committed dice and the applied result. The character generator rules and save format are unchanged.

- Action cards show actual 2d6 probabilities and success/failure effects before selection.
- Negative modifiers and untrained skills are visible; the full formula is expandable.
- Only the selected card contains a commit action. Changing the selection does not roll.
- Saved rolls lock the approach. Restoring a saved session retains the result.
- Result receipts show actual character changes and name the next step.
- Previous chronicle entries are collapsed, with expandable dice and effects.
- Responsive layouts, native keyboard controls and result focus are included.

Validation: 156 Node tests pass, including probabilities across all thirteen career event tables, success/failure, no-roll awards and restored committed checks. The project verification script passes (38 runtime resources and 101 image assignments). Images are intentionally not included. Browser visual QA was unavailable because the managed preview daemon was absent.
