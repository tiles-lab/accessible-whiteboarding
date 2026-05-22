import type { Tag } from '@mirohq/websdk-types';

export interface TagsProps {
  tags?: Tag[];
}

const Tags: React.FC<TagsProps> = ({ tags } = { tags: [] }) => {
  return (
    <div className="a11ywb-tags-box">
      {tags?.length ?
        <>
          <p>Tags:</p>

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
        </> : null}
    </div>
  );
};

export default Tags;
