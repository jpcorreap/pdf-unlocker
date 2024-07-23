import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, TextareaAutosize } from '@mui/material';


export default function PasswordEditor({ open, handleClose, passwords, handleChangePasswords }) {
    const [passwordString, setNewPasswordString] = React.useState("");

    React.useEffect(() => setNewPasswordString(passwords.filter(password => password != "").join("\n")), [passwords])

    const handleNewPasswords = () => {
        handleChangePasswords(passwordString.split("\n"));
        handleClose();
    }

  return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Password editor"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
        >
            <Grid item xs={6}>
                <TextareaAutosize
                    aria-label="textarea"
                    value={passwordString}
                    onChange={(event) => setNewPasswordString(event.target.value)}
                    style={{ width: "20vw", height: "45vh", fontFamily: "Roboto", fontSize: "1em"}}
                />
            </Grid>
            <Grid item xs={6}>
                <p>{}</p>
            </Grid>
            </Grid>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewPasswords} autoFocus>
            Done
          </Button>
        </DialogActions>
      </Dialog>
  );
}
