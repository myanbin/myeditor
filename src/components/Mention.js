import React from 'react'

export default class Mention extends React.Component {
  render() {
    return (
      <span style={{color: '#a71d5d'}}>
        {this.props.children}
      </span>
    );
  }
}