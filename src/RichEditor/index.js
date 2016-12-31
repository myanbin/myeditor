import React from 'react';
import { Editor, EditorState, Entity, CompositeDecorator, RichUtils, AtomicBlockUtils, getDefaultKeyBinding, KeyBindingUtil, convertToRaw } from 'draft-js';

import './index.css';

// Custom overrides for "code" style.
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
};


const getBlockStyle = (block) => {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}


const findLinkEntities = (contentBlock, callback) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url} style={{color: '#3b5998', textDecoration: 'none', borderBottom: '1px solid'}}>
      {props.children}
    </a>
  );
};



const Image = (props) => {
  return (
    <div>
      <img src={props.src} alt={props.description} />
      <figcaption>{props.description}</figcaption>
    </div>
  );
}

const Video = (props) => {
  return (
    <div>
      <video controls src={props.src} style={{maxWidth: '100%'}} />
      <figcaption>{props.description}</figcaption>
    </div>
  );
}

const Media = (props) => {
  const entity = Entity.get(props.block.getEntityAt(0));
  const type = entity.getType();
  const {url, description} = entity.getData();

  switch(type) {
    case 'IMAGE': return <Image src={url} description={description} />;
    case 'VIDEO': return <Video src={url} description={description} />;
    default: return null;
  }
}


const myMediaBlockRenderer = (block) => {
  const type = block.getType();
  if (type === 'atomic') {
    return {
      component: Media,
      editable: false,
    };
  }
  return null;
}


class MediaPrompt extends React.Component {
  constructor() {
    super();
    this.state = {
      url: '',
      description: '',
    };
    this.handleUrlChange = (e) => {

      // setState 是异步执行的函数，所以对 newState 的操作应该放到回调函数中
      // http://stackoverflow.com/questions/33088482/onchange-in-react-doesnt-capture-the-last-character-of-text
      this.setState({url: e.target.value}, () => this.props.onChange(this.state));
    };
    this.handleDescriptionChange = (e) => {
      this.setState({description: e.target.value}, () => this.props.onChange(this.state));
    };
  }

  render() {
    const mediaMap = new Map([
      ['LINK', '链接'],
      ['IMAGE', '图片'],
      ['VIDEO', '视频'],
    ]);
    const type = this.props.type;
    return (
      <div className="RichEditor-prompt">
        <div style={{display: 'flex'}}>
          <input value={this.state.url} onChange={this.handleUrlChange} autoFocus placeholder={`请输入${mediaMap.get(type)}地址`} />
          <span onMouseDown={this.props.onConfirm}>确定</span>
          <span onMouseDown={this.props.onCancel}>取消</span>
        </div>
        {type !== 'LINK' ?
          <div style={{display: 'flex'}}>
            <input value={this.state.description} onChange={this.handleDescriptionChange} placeholder={`请输入${mediaMap.get(type)}描述（可选）`} />
          </div>
          : null
        }
      </div>
    );
  }
}



class RichEditor extends React.Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      showEntityDataPrompt: false,
      entityType: '',
      entityData: {},
    };

    this.focus = (e) => {
      this.refs.editor.focus();
      this.setState({showEntityDataPrompt: false, entityType: ''});
    }
    this.onChange = (editorState) => this.setState({editorState});

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);

    this.undo = () => this._undo();
    this.redo = () => this._redo();

    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);

    this.insertLink = () => this._promptForMedia('LINK');
    this.insertImage = () => this._promptForMedia('IMAGE');
    this.insertVideo = () => this._promptForMedia('VIDEO');

    this.promptForMedia = (type) => this._promptForMedia(type);

    this.handleChange = (data) => this.setState({
      entityData: data,
    });
    this.handleCancel = () => this.setState({
      showEntityDataPrompt: false,
      entityType: '',
      entityData: {},
    });
    this.insertMedia = () => this._insertMedia();
  }

  myKeyBindingFn(e) {
    if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
      return 'save';
    } else if (e.keyCode === 75 /* `K` key */ && KeyBindingUtil.hasCommandModifier(e)) {
      return 'insert-link';
    }
    return getDefaultKeyBinding(e);
  }
  _handleKeyCommand(command) {
    const {editorState} = this.state;

    if (command === 'save') {
      console.log(convertToRaw(editorState.getCurrentContent()));
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

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _undo () {
    const {editorState} = this.state;
    this.onChange(
      EditorState.undo(editorState)
    );
  }
  _redo () {
    const {editorState} = this.state;
    this.onChange(
      EditorState.redo(editorState)
    );
  }


  _insertMedia() {
    const {editorState, entityType, entityData} = this.state;
    const entityKey = Entity.create(entityType, entityType !== 'LINK' ? 'IMMUTABLE' : 'MUTABLE', entityData);
    switch(entityType) {
      case 'LINK'  : this.onChange(RichUtils.toggleLink(editorState, editorState.getSelection(), entityKey)); break;
      case 'IMAGE' :
      case 'VIDEO' : this.onChange(AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ')); break;
      default : console.log('no match any type');
    }
    this.setState({
      showEntityDataPrompt: false,
      entityType: '',
      entityData: {},
    });
  }

  _promptForMedia(type) {
    this.setState({
      showEntityDataPrompt: true,
      entityType: type,
      entityData: {
        url: '',
        description: '',
      },
    });
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
    console.log('change inline style: ', inlineStyle);
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }


  render() {
    const {editorState, showEntityDataPrompt, entityType} = this.state;
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
            <SpanButton label="链接" active={entityType === 'LINK'} onToggle={this.insertLink} />
            <SpanButton label="图片" active={entityType === 'IMAGE'} onToggle={this.insertImage} />
            <SpanButton label="视频" active={entityType === 'VIDEO'} onToggle={this.insertVideo} />
          </div>
        </div>
        {showEntityDataPrompt ?
          <MediaPrompt
            type={entityType}
            onChange={this.handleChange}
            onConfirm={this.insertMedia}
            onCancel={this.handleCancel}
          />
          : null
        }
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            blockRendererFn={myMediaBlockRenderer}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.myKeyBindingFn}
            onChange={this.onChange}
            onTab={this.onTab}
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
  // {label: 'H5', style: 'header-five'},
  // {label: 'H6', style: 'header-six'},
  {label: '引用', style: 'blockquote'},
  {label: '无序列表', style: 'unordered-list-item'},
  {label: '有序列表', style: 'ordered-list-item'},
  // {label: 'Code Block', style: 'code-block'},
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
  {label: '删除线', style: 'STRIKETHROUGH'},
  // {label: 'Monospace', style: 'CODE'},
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
