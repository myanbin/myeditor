import { convertToRaw } from 'draft-js';

const counter = (editorState) => {
  const rawContent = convertToRaw(editorState.getCurrentContent());
  
  let number_of_words       = 0;
  let number_of_paragraphs  = 0;
  let number_of_images      = 0;
  let number_of_videos      = 0;
  let number_of_links       = 0;

  rawContent.blocks.forEach(item => {
    number_of_paragraphs++;
    number_of_words = number_of_words + item.text.length;
  });

  Object.keys(rawContent.entityMap).forEach(item => {
    switch (rawContent.entityMap[item].type) {
      case 'image':
        number_of_images++;
        break;
      case 'video':
        number_of_videos++;
        break;
      case 'link':
        number_of_links++;
        break;
      default:
        break;
    }
  });

  return { number_of_words, number_of_paragraphs, number_of_images, number_of_videos, number_of_links };
}

export { counter }