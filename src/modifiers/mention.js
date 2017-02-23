import { EditorState } from 'draft-js'

const addMention = (editorState, data) => {
  console.log('addMention ...')
}

const findMentionEntities = (contentBlock, callback, contentState) => {
  const text = contentBlock.getText();
  const MENTION_REGEX = /[@][\w]+/g;
  let match, start;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    start = match.index;
    callback(start, start + match[0].length);
  }
/*
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'mention'
      );
    },
    callback
  );
*/
}

export { findMentionEntities }