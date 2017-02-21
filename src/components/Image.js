import React from 'react'
import { Entity } from 'draft-js'

export default class Image extends React.Component {
  render() {
    const entity = Entity.get(this.props.block.getEntityAt(0));
    const { src, description } = entity.getData();
    return (
      <div>
        <img src={src} alt={description} style={{maxWidth: '100%'}} />
        <figcaption>{description}</figcaption>
      </div>
    );
  }
}