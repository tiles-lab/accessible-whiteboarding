import type { Tag } from '@mirohq/websdk-types';

export interface TagsProps {
  tags?: Tag[];
}

const Tags: React.FC<TagsProps> = ({ tags } = { tags: [] }) => {
  return (
    <div className="a11ywb-tags-box">
      <p>Tags:</p>

      {(!tags || tags.length === 0) && <p>There are no tags.</p>}
      {tags && tags.length > 0 && (
        <ul className="a11ywb-tags">
          {tags.map(tag => (
            <li
              key={tag.id}
              className="a11ywb-tag"
              data-tag-id={tag.id}
              data-color={tag.color}
            >
              {tag.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tags;
