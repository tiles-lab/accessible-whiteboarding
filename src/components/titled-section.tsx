import * as React from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TitledSectionProps {
  title: string;
  headingLevel: HeadingLevel;
  children: React.ReactNode;
}

export const HeadingTagMap: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

const TitledSection: React.FC<TitledSectionProps> = ({ title, headingLevel, children }) => {
  const HeadingTag = HeadingTagMap[headingLevel] as keyof JSX.IntrinsicElements;
  const headingId = title.replaceAll(' ', '_');
  return (
    <details className="a11ywb-titled-section">
      <summary>
        <HeadingTag id={headingId} className="a11ywb-titled-section__title">
          {title}
        </HeadingTag>
      </summary>

      {children}
    </details>
  );
};

export default TitledSection;
