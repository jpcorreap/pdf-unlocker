import React, { useMemo, useState } from 'react';
import {
    TextField,
    ListItemText,
    IconButton,
    Grid,
    Chip,
} from '@mui/material';
import { LockOpen } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';

const FileRow = ({ key, filename, status, password, unlocked, handlePasswordChange, handleUnlock, uuid }) => {
    return (
        <Grid
            key={key}
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
                    primary={filename}
                />
            </Grid>
            <Grid
                container
                direction="row"
                xs={3}
                md={2}
                justifyContent="center"
                alignItems="center"
            >
                {
                    status == "Pending" ? <Chip label={status} variant='outlined' />
                    : status == "Unlocked" ? <Chip label={status} variant='filled' style={{backgroundColor: "#7ef284"}} />
                    : status == "Failed" ? <Chip label={status} variant='filled' style={{backgroundColor: "red"}} />
                    : <Chip label={status} variant='filled' />
                }
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
                    disabled={unlocked}
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
                    color="primary"
                    disabled={unlocked}
                    onClick={() => handleUnlock(key)}
                >
                    <LockOpen />
                </IconButton>
                <IconButton
                    aria-label="download"
                    color="primary"
                    disabled={!unlocked}
                    onClick={() => {
                        const len = unlocked.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = unlocked.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'application/pdf' });

                        // Create a download link for the unlocked PDF
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${filename}-${uuid}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                    }}
                >
                    <DownloadIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};

export default FileRow;
