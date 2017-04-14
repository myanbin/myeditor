import React from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil, convertToRaw } from 'draft-js';

import './index.css';

// Custom overrides for inline-content style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  UNDERLINE: {
    textDecoration: 'none',
    borderBottom: '1px solid',
  },
}

// 映射自定义的键盘快捷键
const myKeyBindingFn = (e) => {
  if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    return 'save';
  }
  return getDefaultKeyBinding(e);
}

class BasicEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.focus = (e) => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({editorState});

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;

    if (command === 'save') {
      console.log(convertToRaw(editorState.getCurrentContent()));
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  render() {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'BasicEditor-editor';
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' BasicEditor-hidePlaceholder';
      }
    }

    return (
      <div className="BasicEditor-root">
        <div className={className} onClick={this.focus}>
          <Editor
            customStyleMap={styleMap}
            keyBindingFn={myKeyBindingFn}
            handleKeyCommand={this.handleKeyCommand}
            editorState={editorState}
            onChange={this.onChange}
            placeholder="Tell a story..."
            ref="editor"
            stripPastedStyles={true}
          />
        </div>
      </div>
    );
  }
}

export default BasicEditor