
const counter = (editorState) => {
    const plainText = editorState.getCurrentContent().getPlainText('');
    return plainText.replace(/\s+/, '').length;
}

export { counter }