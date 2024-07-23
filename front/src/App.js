import React, { useState } from 'react';
import {
  Button,
  TextField,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import { CloudUpload, LockOpen } from '@mui/icons-material';

const App = () => {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFiles((prevFiles) => [
          ...prevFiles,
          { name: file.name, base64: base64String, status: 'Pending' },
        ]);
      };
      reader.readAsDataURL(file);
      return file;
    });
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleUnlock = async (index) => {
    const file = files[index];
    if (!file || !password) {
      alert('Please provide a PDF file and a password.');
      return;
    }

    const payload = {
      pdf: file.base64,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:3001/unlock-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to unlock PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unlocked-${file.name}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index].status = 'Unlocked';
        return updatedFiles;
      });
    } catch (error) {
      console.error('Failed to unlock PDF:', error);
      alert('Failed to unlock PDF');
    }
  };

  return (
    <Container>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: 20, marginBottom: 35 }}
        >
          <Grid item>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Upload PDFs
              <input
                type="file"
                accept="application/pdf"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Copy first password
              <input
                type="file"
                accept="application/pdf"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Unlock all pending
              <input
                type="file"
                accept="application/pdf"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
        </Grid>

        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            style={{ marginBottom: 15 }}
          >
            <Grid
              container
              xs={9}
              md={4}
              justifyContent="center"
              alignItems="center"
            >
              <strong>PDF Name</strong>
            </Grid>
            <Grid
              container
              xs={3}
              md={2}
              justifyContent="center"
              alignItems="center"
            >
              <strong>Status</strong>
            </Grid>
            <Grid
              container
              xs={6}
              md={4}
              justifyContent="center"
              alignItems="center"
            >
              <strong>Password</strong>
            </Grid>
            <Grid
              container
              xs={3}
              md={2}
              justifyContent="center"
              alignItems="center"
            >
              <strong>Options</strong>
            </Grid>
          </Grid>
          {files.map((file, index) => (
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              style={{ marginBottom: 15 }}
            >
              <Grid
                item
                xs={9}
                md={4}>
                <ListItemText
                  primary={file.name}
                />
              </Grid>
              <Grid
                container
                direction="row"
                xs={3}
                md={2}
                justifyContent="center"
                alignItems="center"
                style={{ backgroundColor: "red" }}
              >
                <Chip label={file.status} variant="outlined" />
              </Grid>
              <Grid
                item
                xs={6}
                md={4}
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <TextField
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid
                container
                xs={6}
                md={2}
                justifyContent="center"
                alignItems="center"
              >
                <IconButton
                  aria-label="unlock"
                  color="secondary"
                  onClick={() => handleUnlock(index)}
                >
                  <LockOpen />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>
    </Container>
  );
};

export default App;
