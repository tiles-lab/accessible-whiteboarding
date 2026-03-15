import React, { useRef, useEffect } from 'react';

type RichTextInputProps = {
  fieldName: string;
  required?: boolean;
  currentValue?: string;
  label: string;
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

export const RichTextInput: React.FC<RichTextInputProps> = ({
  fieldName,
  required,
  currentValue,
  label,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const newP = document.createElement('p');
    const currentP = findAncestorWithTag(range.startContainer, 'p');

    if (currentP) {
      // Split currentP at the cursor: move everything after the cursor into newP
      const splitRange = document.createRange();
      splitRange.setStart(range.startContainer, range.startOffset);
      splitRange.setEnd(currentP, currentP.childNodes.length);
      const afterContent = splitRange.extractContents();
      newP.appendChild(afterContent.textContent?.length ? afterContent : document.createElement('br'));
      if (!currentP.textContent?.length) {
        currentP.appendChild(document.createElement('br'));
      }
      currentP.insertAdjacentElement('afterend', newP);
    } else {
      newP.appendChild(document.createElement('br'));
      range.insertNode(newP);
    }

    // Place cursor at start of the new paragraph
    const newRange = document.createRange();
    const firstChild = newP.firstChild;
    if (firstChild?.nodeType === Node.TEXT_NODE) {
      newRange.setStart(firstChild, 0);
    } else if (firstChild) {
      newRange.setStartBefore(firstChild);
    } else {
      newRange.setStart(newP, 0);
    }
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
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

    if (tag === 'a') {
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

  return (
    <div className="ally-wb-rich-text-field">
      <span className="ally-wb-edit-form-label-text">{label}</span>
      <div
        className="ally-wb-rich-text-toolbar"
        role="toolbar"
        aria-label={`${label} text formatting`}
      >
        {TOOLBAR_BUTTONS.map(({ tag, display, title }) => (
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
