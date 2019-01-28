import React, { Component } from 'react';
import crypto from 'crypto-js';
import axios from 'axios';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import PdfViewer from './PdfViewer';
//import viewer from './viewer';

const expressAppUrl = 'https://paexpress.herokuapp.com';
class PagePDF extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
  }

  componentDidMount() {
    this.props.socket.on('video', () => {
      this.props.history.push('/PageVideo');
    });
  }

  submitFile = event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', this.state.file[0]);
    axios
      .post(`/test-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        // handle your response;
      })
      .catch(error => {
        console.log('ERROR in react post request');
      });
  };

  handleFileUpload = event => {
    this.setState({ file: event.target.files });
  };

  render() {
    return (
      <div>
        <Navbar />
        <h1>This is the PDF Viewer</h1>
        <li
          onClick={() => {
            this.props.socket.emit('video');
          }}
        >
          <Link to="/PageVideo/">Speech Flow Video Player</Link>
        </li>
        <form onSubmit={this.submitFile}>
          <input
            label="upload file"
            type="file"
            onChange={this.handleFileUpload}
          />
          <button type="submit">Send</button>
        </form>
        <div>
          {' '}
          <PdfViewer socket={this.props.socket} />{' '}
        </div>
      </div>
    );
  }
}
export default PagePDF;
