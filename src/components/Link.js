import React from 'react'
import { Entity } from 'draft-js'

const Link = (props) => {
  const entity = Entity.get(props.entityKey);
  const { src } = entity.getData();
  return (
    <a href={src} style={{color: '#0086b3', textDecoration: 'none', borderBottom: '1px solid'}}>
      {props.children}
    </a>
  );
}

export default Link