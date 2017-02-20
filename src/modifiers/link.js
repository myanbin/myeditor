import { Entity, RichUtils } from 'draft-js'

const insertLink = (editorState, data) => {
  const entityKey = Entity.create('link', 'MUTABLE', data);
  return RichUtils.toggleLink(editorState, editorState.getSelection(), entityKey);
}

const findLinkEntities = (contentBlock, callback) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'link'
      );
    },
    callback,
  );
}

export { findLinkEntities, insertLink }