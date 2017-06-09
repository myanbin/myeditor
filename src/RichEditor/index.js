import React from 'react';
import { Editor, EditorState, CompositeDecorator, RichUtils, getDefaultKeyBinding, KeyBindingUtil, convertFromRaw, convertToRaw } from 'draft-js';


import Link from '../components/Link'
import { findLinkEntities, addLink } from '../modifiers/link'
import Mention from '../components/Mention'
import { findMentionEntities } from '../modifiers/mention'

import MediaBlock from '../components/MediaBlock'
import { addImage } from '../modifiers/image'

import { counter } from '../utils/counter'

import './index.css';

// 加载编辑器 rawContent 数据
import rawContent from '../data/content'

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

// Custom overrides for block-content style
const getBlockStyle = (block) => {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}


const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
  {
    strategy: findMentionEntities,
    component: Mention,
  },
])


const myMediaBlockRenderer = (block) => {
  if (block.getType() === 'atomic') {
    return {
      component: MediaBlock,
      editable: false,
    };
  }

  return null;
}

// 映射自定义的键盘快捷键
const myKeyBindingFn = (e) => {
  if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    return 'save';
  } else if (e.keyCode === 75 /* `K` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    return 'insert-link';
  }
  return getDefaultKeyBinding(e);
}


class RichEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createWithContent(convertFromRaw(rawContent), decorator),
    };

    this.focus = (e) => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({editorState});

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);

    this.undo = () => this._undo();
    this.redo = () => this._redo();

    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);

    this.insertLink = () => this._insertLink();
    this.insertImage = () => this._insertImage();
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;

    if (command === 'save') {
      console.log(convertToRaw(editorState.getCurrentContent()));
      console.log(counter(editorState));
    } else if (command === 'insert-link') {
      this.insertLink();
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _undo () {
    const { editorState} = this.state;
    this.onChange(
      EditorState.undo(editorState)
    );
  }
  _redo () {
    const { editorState } = this.state;
    this.onChange(
      EditorState.redo(editorState)
    );
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {

    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _insertLink() {
    const data = {
      src: 'https://myanbin.github.io/',
      description: 'my blog',
    }
    this.onChange(
      addLink(this.state.editorState, data)
    )
  }

  _insertImage() {
    const data = {
      src: 'http://www.xlzx.cn/newsite/upimg/allimg/1011/48_29105448.jpg',
      description: '白鸟之死',
    }
    this.onChange(
      addImage(this.state.editorState, data)
    )
  }

  render() {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        <div className="RichEditor-control">
          <div className="RichEditor-controls">
            <SpanButton label="撤销" onToggle={this.undo} />
            <SpanButton label="重做" onToggle={this.redo} />
          </div>
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <div className="RichEditor-controls">
            <SpanButton label="链接" onToggle={this.insertLink} />
            <SpanButton label="图片" onToggle={this.insertImage} />
          </div>
        </div>
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            blockRendererFn={myMediaBlockRenderer}
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


class SpanButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}


const BLOCK_TYPES = [
  {label: '一级标题', style: 'header-one'},
  {label: '二级标题', style: 'header-two'},
  {label: '三级标题', style: 'header-three'},
  {label: '四级标题', style: 'header-four'},
  // {label: '五级标题', style: 'header-five'},
  // {label: '六级标题', style: 'header-six'},
  {label: '引用', style: 'blockquote'},
  {label: '无序列表', style: 'unordered-list-item'},
  {label: '有序列表', style: 'ordered-list-item'},
  {label: '代码块', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <SpanButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};


const INLINE_STYLES = [
  {label: '加粗', style: 'BOLD'},
  {label: '倾斜', style: 'ITALIC'},
  {label: '下划线', style: 'UNDERLINE'},
  // {label: '删除线', style: 'STRIKETHROUGH'},
  {label: '等宽字体', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <SpanButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};


export default RichEditor