import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import Hidden from '@mui/material/Hidden';
import { CloudUpload } from '@mui/icons-material';
import PasswordIcon from '@mui/icons-material/Password';
import FileRow from './components/FileRow';
import PasswordEditor from './components/PasswordEditor';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


const BASE_URL = "http://localhost:3001/";


const App = () => {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = React.useState(false);

  const handleAddFiles = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFiles((prevFiles) => [
          ...prevFiles,
          { name: file.name, uuid: uuidv4(), original: base64String, status: 'Pending', password: "", unlocked: "" }
        ]);
      };
      reader.readAsDataURL(file);
      return file;
    });
  };

  const handleChangePasswords = (newPasswords) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      for (let index = 0; index < newFiles.length; index++) {
        newFiles[index]["password"] = newPasswords[index];
      }
      return newFiles;
    });
  };

  const handleClearCompleted = () => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      return newFiles.filter(file => file.status != "Unlocked")
    });
  };

  const handleChangeFileProperty = (index, key, value) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index][key] = value;
      return newFiles;
    });
  };

  const handleUnlock = async (index) => {
    const file = files[index];

    try {
      const response = await fetch(`${BASE_URL}/unlock-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf: file.original,
          password: file.password
        }),
      });

      if (!response.ok) {
        setFiles((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index].status = 'Failed';
          return updatedFiles;
        });
        throw new Error('Failed to unlock PDF');
      }

      const data = await response.json();
      const unlockedPdfBase64 = data.pdf;

      // Convert Base64 string to Uint8Array and create a Blob
      const binaryString = window.atob(unlockedPdfBase64);

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index].status = 'Unlocked';
        updatedFiles[index].unlocked = binaryString;
        return updatedFiles;
      });
    } catch (error) {
      console.error('Failed to unlock PDF:', error);
    }
  };

  const handleDownloadAll = useCallback(() => {
    const zipFile = new JSZip();
    let i = 0;
    // console.info("ENTRÓ");
    // console.info(files);
    while( i < files.length ) {
      const file = files[i];
      console.log(`Iterating over ${file.name}`);
      console.log(file.unlocked != "");
      if (file.unlocked) {
        const buffer = new ArrayBuffer(file.unlocked.length);
        const view = new Uint8Array(buffer);
        for (var k = 0; k < file.unlocked.length; k++) {
          view[k] = file.unlocked.charCodeAt(k);
        }
        // console.info(`Va a guardar ${file.uuid}`);
        zipFile.file(`${file.name}-${file.uuid}.pdf`, buffer);
      }

      i++;
    }

    zipFile.generateAsync({ type: 'blob' }).then((zipBlob) => saveAs(zipBlob, 'unlocked.zip'));
  }, [files]);


  return (
    <>
      <Box
        p={2}
        borderRadius={5}
        display={"grid"}
      >
        <Paper elevation={10}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            style={{ padding: 20 }}
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
                  onChange={handleAddFiles}
                />
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                component="label"
                startIcon={<PasswordIcon />}
                onClick={() => setOpen(true)}
                disabled={!files?.length}
              >
                Password editor
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                disabled={!files?.length}
                onClick={() => files.forEach((file, index) => {
                  if (file.status != "Unlocked")
                    handleUnlock(index);
                })}
              >
                Unlock pending
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                disabled={!files?.length}
                onClick={() => handleDownloadAll()}
              >
                Download all
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                disabled={!files?.length}
                onClick={handleClearCompleted}
              >
                Clear completed
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Container>


        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          style={{ display: files.length ? "block" : "none" }}
        >
          <Hidden only={"xs"}>
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
          </Hidden>

          {files.map((file, index) => (
            <FileRow
              key={index}
              filename={file.name}
              status={file.status}
              unlocked={file.unlocked}
              password={file.password}
              handlePasswordChange={(event) => handleChangeFileProperty(index, "password", event.target.value)}
              handleUnlock={() => handleUnlock(index)}
              uuid={file.uuid}
            />
          ))}
        </Grid>
        <PasswordEditor
          open={open}
          handleClose={() => setOpen(false)}
          passwords={files.map(file => file.password)}
          handleChangePasswords={(newPasswords) => handleChangePasswords(newPasswords)}
        />
      </Container>

    </>
  );
};

export default App;
