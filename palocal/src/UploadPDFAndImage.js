import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import axios from 'axios';

class UploadPDFAndImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      uploadProgress: 0
    };
  }

  submitFile = event => {
    event.preventDefault();
    const formData = new FormData();
    for (var i = 0; i < this.state.file.length; i++) {
      formData.append('files', this.state.file[i]);
    }
    formData.append('userName', this.props.userName);
    var config = {
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        this.setState({ uploadProgress: percentCompleted });
      }.bind(this)
    };

    axios
      .post(`/upload-file`, formData, config, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        document.getElementById('SubmitFile').reset();
        window.location.reload();
      })
      .catch(error => {
        console.log('ERROR in react UploadPDFAndImage post request: ' + error);
      });
  };

  handleFileUpload = event => {
    this.setState({ file: event.target.files });
  };

  render() {
    return (
      <div>
        <MediaQuery query="(min-device-width: 1024px)">
          <form id="SubmitFile" onSubmit={this.submitFile}>
            <h5>Upload your PDF and images:</h5>
            <input
              label="upload file"
              type="file"
              multiple
              accept="application/pdf, image/*"
              onChange={this.handleFileUpload}
            />
            <button type="submit">Upload</button>
          </form>
          Progress: {this.state.uploadProgress} %
        </MediaQuery>
        <MediaQuery query="(max-device-width: 1023px)">
          <br />
        </MediaQuery>
      </div>
    );
  }
}

export default UploadPDFAndImage;
