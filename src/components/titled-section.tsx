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

  return (
    <section className="a11ywb-titled-section">
      <HeadingTag className="a11ywb-titled-section__title">{title}</HeadingTag>

      <div className="a11ywb-titled-section__contents">{children}</div>
    </section>
  );
};

export default TitledSection;
