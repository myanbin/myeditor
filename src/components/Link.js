import React from 'react';

const Link = (props) => {
  const entity = props.contentState.getEntity(props.entityKey);
  const { src } = entity.getData();
  return (
    <a href={src} style={{color: '#0086b3', textDecoration: 'none', borderBottom: '1px solid'}}>
      {props.children}
    </a>
  );
}

export default Link