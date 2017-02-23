import React from 'react'

const Mention = (props) => {
  return (
    <span style={{color: '#a71d5d'}}>
      {props.children}
    </span>
  );
}

export default Mention