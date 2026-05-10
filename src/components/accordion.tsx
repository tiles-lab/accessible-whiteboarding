import { Dispatch, FocusEvent, ReactNode, useCallback, useState } from 'react';
import { HeadingLevel, HeadingTagMap } from './titled-section';

type Summary = {
  text: string | undefined;
  className?: string;
  headingLevel?: HeadingLevel;
  description?: string;
  focusAction?: (event: FocusEvent) => void;
  content?: ReactNode;
};

type AccordionProps = {
  id: string;
  defaultOpen: boolean;
  summary: Summary;
  children: ReactNode;
  detailsClassNames?: string[];
  ['data-subtype']?: string;
};

type SummaryHeadingProps = Pick<AccordionProps, 'summary' | 'id'> & {
  open: boolean;
  setOpen: Dispatch<boolean>;
};

const SummaryHeading = (props: SummaryHeadingProps) => {
  const { summary, id, open, setOpen } = props;

  const HeadingTag = summary?.headingLevel
    ? (HeadingTagMap[summary.headingLevel] as keyof JSX.IntrinsicElements)
    : '';

  const handleFocus = useCallback(
    (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
      }

      if (summary.focusAction) {
        summary.focusAction(e);
      }
    },
    [summary.focusAction],
  );

  const button = (
    <button
      aria-expanded={open}
      aria-controls={id}
      onClick={() => setOpen(!open)}
      onFocus={handleFocus}
      className={`a11ywb-accordion-summary__button a11ywb-accordion-summary__button--${open ? 'open' : 'closed'}`}
    >
      {summary.text}
    </button>
  );

  if (HeadingTag) {
    return (
      <HeadingTag style={{ width: '100%' }} onFocus={handleFocus}>
        {button}
      </HeadingTag>
    );
  }

  return button;
};

export const Accordion = (props: AccordionProps) => {
  const { defaultOpen, id, summary, children, detailsClassNames = [] } = props;
  const [open, setOpen] = useState<boolean>(defaultOpen);

  const content_id = `a11ywb-accordion-content-${id}`;

  return (
    <div
      className={`a11ywb-accordion ${detailsClassNames?.join(' ')}`}
      data-subtype={props['data-subtype']}
    >
      <header
        className={summary?.className ?? 'a11ywb-accordion-header'}
        onFocus={summary?.focusAction}
      >
        <SummaryHeading summary={summary} id={content_id} open={open} setOpen={setOpen} />

        {summary?.description && <div dangerouslySetInnerHTML={{ __html: summary.description }} />}
      </header>

      {summary?.content}

      {open && <div id={content_id} children={children} />}
    </div>
  );
};
