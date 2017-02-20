import React from 'react'
import { Entity } from 'draft-js'

export default class Link extends React.Component {
  render() {
    const entity = Entity.get(this.props.block.getEntityAt(0));
    const { src } = entity.getData();
    return (
      <a href={src} style={{color: '#0086b3', textDecoration: 'none', borderBottom: '1px solid'}}>
        {this.props.children}
      </a>
    );
  }
}