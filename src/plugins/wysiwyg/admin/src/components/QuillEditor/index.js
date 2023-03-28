import React, {Fragment} from 'react';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill.custom.css';
import MediaLib from './MediaLib';

var Size = Quill.import('attributors/style/size');
Size.whitelist = ['14px', false, '16px', '18px'];
Quill.register(Size, true);

class QuillEditor extends React.Component {
  formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]

  constructor(props) {
    super(props);

    this.quillRef = null;
    this.reactQuillRef = null;

    this.state = {
      isFocused: false,
      isMediaLibraryOpened: false
    }

    this.focus = () => {
      this.setState({isFocused: true});
      this.reactQuillRef.focus();
    }

    this.blur = () => {
      this.setState({isFocused: false});
      this.reactQuillRef.blur();
    }
  }

  componentDidMount() {
    this.attachQuillRefs();

    if (this.props.autoFocus) {
      this.focus();
    }
  }

  componentDidUpdate() {
    this.attachQuillRefs();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.resetProps !== this.props.resetProps) {
      return true;
    }

    if (nextProps.value !== this.props.value) {
      return true;
    }

    if (nextState.isFocused !== this.state.isFocused) {
      return true;
    }

    if (nextState.isMediaLibraryOpened !== this.state.isMediaLibraryOpened) {
      return true;
    }

    return false;
  }

  toggleMediaLib = () => {
    this.setState(prevState => ({
      ...prevState,
      isMediaLibraryOpened: !prevState.isMediaLibraryOpened
    }));
  }

  imageHandler = (image, callback) => {
    this.setState({isMediaLibraryOpened: true});
  }

  modules = {
    toolbar: {
      container: [
        [{'header': [3, 4, false]}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'color': []}, {'background': []}],
        [{'align': 'justify'}, {'align': ''}, {'align': 'center'}, {'align': 'right'}],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: this.imageHandler,
      }
    },
  }

  attachQuillRefs = () => {
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    this.quillRef = this.reactQuillRef.getEditor();
  }

  render() {
    const {isMediaLibraryOpened} = this.state;
    const {onChange, name, disabled, value} = this.props;
    return (
      <>
        <ReactQuill
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          readOnly={disabled}
          value={value}
          onChange={(content, _, source, editor) => {
            onChange({target: {name, value: content}})
          }}
          ref={(el) => {
            this.reactQuillRef = el
          }}
        />
        {
            isMediaLibraryOpened
                &&
            <MediaLib
                isOpen={isMediaLibraryOpened}
                onToggle={this.toggleMediaLib}
                onChange={onChange}
                name={name}
                value={value}
            />
        }
      </>
    )
  }
}

export default QuillEditor;
