import * as React from 'react';

export interface TitledSectionProps {
  title: string;
  headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

const HeadingTagMap: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

const TitledSection: React.FC<TitledSectionProps> = ({
  title,
  headingLevel,
  children,
}) => {
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
