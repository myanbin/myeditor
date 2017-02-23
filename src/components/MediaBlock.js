import React from 'react'
import Image from './Image'

export default class MediaBlock extends React.Component {
  render() {
    const { contentState, block } = this.props;
    const entity = contentState.getEntity(block.getEntityAt(0));
    const type = entity.getType();
    const { src, description } = entity.getData();
    if (type === 'image') {
      return (
        <Image src={src} description={description} />
      )
    } else if (type === 'video') {
      return (
        <div>This is a Video</div>
      )
    }
  }
}