import { Entity, AtomicBlockUtils } from 'draft-js'

const addImage = (editorState, data) => {
  const entityKey = Entity.create('image', 'IMMUTABLE', data);
  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export { addImage }