import React, { useRef, useEffect } from 'react';

type RichTextInputProps = {
  fieldName: string;
  required?: boolean;
  currentValue?: string;
  label: string;
  extended?: boolean;
};

type ToolbarButton = {
  tag: string;
  display: React.ReactNode;
  title: string;
};

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { tag: 'strong', display: <strong>strong</strong>, title: 'Strong (semantic bold)' },
  { tag: 'em', display: <em>em</em>, title: 'Emphasis (semantic italic)' },
  { tag: 'u', display: <u>u</u>, title: 'Underline' },
  { tag: 's', display: <s>s</s>, title: 'Strikethrough' },
  { tag: 'a', display: 'Link', title: 'Link (anchor)' },
  { tag: 'br', display: '↵ br', title: 'Line break' },
];

const EXTENDED_TOOLBAR_BUTTONS: ToolbarButton[] = [
  { tag: 'ul', display: '• ul', title: 'Unordered list' },
  { tag: 'ol', display: '1. ol', title: 'Ordered list' },
];

export const RichTextInput: React.FC<RichTextInputProps> = ({
  fieldName,
  required,
  currentValue,
  label,
  extended,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = currentValue ?? '<p><br></p>';
    }
  }, []);

  const syncToHidden = () => {
    if (editorRef.current && hiddenInputRef.current) {
      hiddenInputRef.current.value = editorRef.current.innerHTML;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    syncToHidden();
  };

  const findAncestorWithTag = (node: Node | null, tag: string): Element | null => {
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === tag) {
        return node as Element;
      }
      node = node.parentNode;
    }
    return null;
  };

  const unwrapElement = (element: Element) => {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    syncToHidden();
  };

  // Splits `block` at `range`, inserts a new sibling of the same tag after it, returns the new element.
  const splitBlock = (block: Element, range: Range): Element => {
    const newBlock = document.createElement(block.tagName.toLowerCase());
    const splitRange = document.createRange();
    splitRange.setStart(range.startContainer, range.startOffset);
    splitRange.setEnd(block, block.childNodes.length);
    const afterContent = splitRange.extractContents();
    newBlock.appendChild(
      afterContent.textContent?.length ? afterContent : document.createElement('br'),
    );
    if (!block.textContent?.length) {
      block.appendChild(document.createElement('br'));
    }
    block.insertAdjacentElement('afterend', newBlock);
    return newBlock;
  };

  const placeCursorAtStart = (block: Element) => {
    const selection = window.getSelection();
    if (!selection) return;
    const newRange = document.createRange();
    const firstChild = block.firstChild;
    if (firstChild?.nodeType === Node.TEXT_NODE) {
      newRange.setStart(firstChild, 0);
    } else if (firstChild) {
      newRange.setStartBefore(firstChild);
    } else {
      newRange.setStart(block, 0);
    }
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };

  const insertList = (tag: 'ul' | 'ol') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Toggle off if already in this list type: convert each <li> back to a <p>
    const existingList = findAncestorWithTag(selection.anchorNode, tag);
    if (existingList) {
      const parent = existingList.parentNode;
      if (!parent) return;
      for (const li of Array.from(existingList.querySelectorAll('li'))) {
        const p = document.createElement('p');
        while (li.firstChild) p.appendChild(li.firstChild);
        parent.insertBefore(p, existingList);
      }
      parent.removeChild(existingList);
      syncToHidden();
      return;
    }

    // Switch type if already in the other list kind
    const otherTag = tag === 'ul' ? 'ol' : 'ul';
    const otherList = findAncestorWithTag(selection.anchorNode, otherTag);
    if (otherList) {
      const newList = document.createElement(tag);
      while (otherList.firstChild) newList.appendChild(otherList.firstChild);
      otherList.parentNode?.replaceChild(newList, otherList);
      syncToHidden();
      return;
    }

    // Wrap the current paragraph (or selection) in a list with one <li>
    const li = document.createElement('li');
    const list = document.createElement(tag);
    list.appendChild(li);

    const currentP = findAncestorWithTag(selection.anchorNode, 'p');
    if (currentP) {
      while (currentP.firstChild) li.appendChild(currentP.firstChild);
      currentP.parentNode?.replaceChild(list, currentP);
    } else {
      const range = selection.getRangeAt(0);
      li.appendChild(range.extractContents());
      if (!li.textContent?.length) li.appendChild(document.createElement('br'));
      range.insertNode(list);
    }

    // Place cursor at the end of the li content
    const newRange = document.createRange();
    const lastChild = li.lastChild;
    if (lastChild?.nodeType === Node.TEXT_NODE) {
      newRange.setStart(lastChild, (lastChild as Text).length);
    } else if (lastChild) {
      newRange.setStartAfter(lastChild);
    } else {
      newRange.setStart(li, 0);
    }
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    syncToHidden();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Inside a <li>: split into new <li>, or exit list if the current <li> is empty
    const currentLi = findAncestorWithTag(range.startContainer, 'li');
    if (currentLi) {
      const isEmpty = !currentLi.textContent?.replace(/\u200B/g, '').trim().length;
      if (isEmpty) {
        // Exit list mode: insert a <p> after the parent list and remove the empty <li>
        const parentList = currentLi.parentElement;
        currentLi.remove();
        const newP = document.createElement('p');
        newP.appendChild(document.createElement('br'));
        if (parentList && !parentList.children.length) {
          parentList.parentNode?.replaceChild(newP, parentList);
        } else {
          parentList?.insertAdjacentElement('afterend', newP);
        }
        placeCursorAtStart(newP);
      } else {
        const newLi = splitBlock(currentLi, range);
        placeCursorAtStart(newLi);
      }
      syncToHidden();
      return;
    }

    // Inside a <p> (or fallback): split into a new <p>
    const currentP = findAncestorWithTag(range.startContainer, 'p');
    if (currentP) {
      const newP = splitBlock(currentP, range);
      placeCursorAtStart(newP);
    } else {
      const newP = document.createElement('p');
      newP.appendChild(document.createElement('br'));
      range.insertNode(newP);
      placeCursorAtStart(newP);
    }
    syncToHidden();
  };

  const insertAtCursor = (tag: string, attrs?: Record<string, string>) => {
    const selection = window.getSelection();
    if (!selection) return;

    // Toggle off if cursor/selection is already inside this tag
    if (tag !== 'br') {
      const existing = findAncestorWithTag(selection.anchorNode, tag);
      if (existing) {
        unwrapElement(existing);
        return;
      }
    }

    if (tag === 'br') {
      if (selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      syncToHidden();
      return;
    }

    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const element = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    }

    if (range.collapsed) {
      // Insert element with zero-width space so cursor lands inside it
      element.appendChild(document.createTextNode('\u200B'));
      range.insertNode(element);
      range.setStart(element.firstChild!, 1);
      range.collapse(true);
    } else {
      element.appendChild(range.extractContents());
      range.insertNode(element);
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    syncToHidden();
  };

  const handleButtonMouseDown = (e: React.MouseEvent, tag: string) => {
    // Prevent the button from stealing focus/selection from the editor
    e.preventDefault();

    if (tag === 'ul' || tag === 'ol') {
      insertList(tag);
    } else if (tag === 'a') {
      // Save selection before the prompt dialog steals focus
      const selection = window.getSelection();
      const savedRange =
        selection && selection.rangeCount > 0
          ? selection.getRangeAt(0).cloneRange()
          : null;

      const href = window.prompt('Enter URL:');
      if (href && savedRange) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
        insertAtCursor('a', { href });
      }
    } else {
      insertAtCursor(tag);
    }
  };

  const allButtons = extended
    ? [...TOOLBAR_BUTTONS, ...EXTENDED_TOOLBAR_BUTTONS]
    : TOOLBAR_BUTTONS;

  return (
    <div className="ally-wb-rich-text-field">
      <span className="ally-wb-edit-form-label-text">{label}</span>
      <div
        className="ally-wb-rich-text-toolbar"
        role="toolbar"
        aria-label={`${label} text formatting`}
      >
        {allButtons.map(({ tag, display, title }) => (
          <button
            key={tag}
            type="button"
            title={title}
            aria-label={title}
            className="ally-wb-rich-text-btn"
            onMouseDown={(e) => handleButtonMouseDown(e, tag)}
          >
            {display}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="ally-wb-rich-text-editor"
        role="textbox"
        aria-multiline={true}
        aria-label={`${label} content`}
        aria-required={required}
        onKeyDown={handleKeyDown}
        onInput={syncToHidden}
        onPaste={handlePaste}
      />
      <input ref={hiddenInputRef} type="hidden" name={fieldName} defaultValue={currentValue} />
    </div>
  );
};
