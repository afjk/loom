# editor-studio Regression Checklist

Manual regression tests for editor-studio before releases or major packaging changes.

## 1. Startup

- [ ] `cd editor-studio`
- [ ] `npm run dev`
- [ ] App loads without console errors
- [ ] Sample DSL compiles
- [ ] Preview runs
- [ ] Node Editor renders nodes

## 2. DSL Apply / Auto Apply

- [ ] Edit DSL manually
- [ ] Click Apply DSL
- [ ] Graph updates
- [ ] Invalid DSL shows diagnostics/errors
- [ ] Graph is preserved on Auto Apply error if that is current behavior
- [ ] Auto Apply toggle persists across reload

## 3. Graph to DSL Auto Sync

- [ ] Edit a param from Inspector
- [ ] DSL updates if Auto Sync is ON
- [ ] DSL does not update if Auto Sync is OFF
- [ ] Graph operation does not append `# @loomlet.editor` to visible DSL

## 4. Save / Open / Metadata

- [ ] Move nodes
- [ ] Add label/comment
- [ ] Save As
- [ ] Saved file contains exactly one `# @loomlet.editor ...` line
- [ ] Visible DSL editor does not show metadata after save
- [ ] Open saved file
- [ ] Visible DSL editor does not show metadata
- [ ] Node positions restore
- [ ] Labels/comments restore
- [ ] Repeated Save does not duplicate metadata
- [ ] Invalid metadata does not prevent DSL from loading

## 5. Node Editor Layout

- [ ] Maximize Node Editor
- [ ] Restore split
- [ ] Maximize DSL Editor
- [ ] Reload with Node Editor maximized
- [ ] Pan/zoom/drag still work

## 6. Node Search / Focus

- [ ] Select node on canvas
- [ ] Nodes tab selected row updates
- [ ] Selected row scrolls into view
- [ ] Search by id/type/category/label/comment
- [ ] Focus button centers node
- [ ] `/` shortcut focuses search when appropriate
- [ ] Cmd/Ctrl+Shift+F switches/focuses Nodes search

## 7. Inspector Param Editing

- [ ] Edit number param
- [ ] Edit string param
- [ ] Edit boolean param
- [ ] Invalid number handling if applicable
- [ ] Param edit marks dirty
- [ ] Param edit updates preview
- [ ] Inspector edit updates Node Editor control

## 8. Node Labels/Comments

- [ ] Edit label from Inspector
- [ ] Label appears in Node Editor
- [ ] Label appears/searches in Nodes tab
- [ ] Edit comment from Inspector
- [ ] Comment indicator appears/searches in Nodes tab
- [ ] Label/comment do not affect execution graph
- [ ] Label/comment persist through Save/Open
- [ ] Label/comment survive DSL Apply / Auto Apply when node id remains

## 9. Undo / Redo

- [ ] Node move Undo is coalesced
- [ ] Param edit Undo is coalesced for rapid same-param changes
- [ ] Label/comment edit Undo works
- [ ] Add/remove/rename node Undo works
- [ ] DSL editor Cmd/Ctrl+Z still edits text and does not trigger graph Undo

## 10. Input Focus Regression Checks

Recent bugs to explicitly verify are fixed:

- [ ] Inspector label input: continuous typing keeps focus
- [ ] Inspector comment textarea: multiline typing keeps focus
- [ ] Node Editor Rete param input:
  - [ ] Continuous typing keeps focus
  - [ ] Backspace/Delete edits text and does not delete node
- [ ] Node Editor param input does not reset after first character

## 11. Browser/Storage Persistence

- [ ] Bottom panel height persists
- [ ] Split width persists
- [ ] Active bottom tab persists
- [ ] Auto Apply setting persists
- [ ] Maximize mode persists

## 12. Known Non-Goals / Expected Limitations

The following are intentional design decisions and should not be treated as bugs:

- **Node Editor UI vs VS Code extension**: Node Editor is not yet the VS Code extension UI; the extension will have its own visual implementation.
- **Metadata visibility**: Editor metadata is intentionally hidden from the visible DSL but saved to file for node layout and annotation persistence.
- **Development status**: editor-studio is still a development/demo tool and not production software.
- **Browser API support**: Browser File System Access API may not be available in all browsers; fallback download is expected.
