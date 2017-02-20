import { Entity } from 'draft-js'

const findMentionEntities = (contentBlock, callback) => {
  const text = contentBlock.getText();
  const MENTION_REGEX = /[@][\w]+/g;
  let match, start;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    start = match.index;
    callback(start, start + match[0].length);
  }
}

export { findMentionEntities }