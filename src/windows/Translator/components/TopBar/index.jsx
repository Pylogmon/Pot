import PodcastsRoundedIcon from '@mui/icons-material/PodcastsRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Box, IconButton, Tooltip } from '@mui/material';
import { listen, emit } from '@tauri-apps/api/event';
import { readText } from '@tauri-apps/api/clipboard';
import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { invoke } from '@tauri-apps/api/tauri';
import { get } from '../../../main';
import './style.css';

let unlisten = listen('tauri://blur', () => {
    if (appWindow.label == 'translator' || appWindow.label == 'popclip') {
        appWindow.close();
    }
});

export default function TopBar() {
    const [pined, setPined] = useState(get('default_pined') ?? true);
    const [ismacos, setIsmacos] = useState(false);
    const [listenCopy, setListenCopy] = useState(false);
    const [int, setInt] = useState();
    const [currentClipboard, setCurrentClipboard] = useState('');
    const theme = useTheme();

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsmacos(v);
        });
        if (appWindow.label == 'persistent') {
            appWindow.setAlwaysOnTop(pined);
        } else {
            // 使划词翻译窗口置顶，但是pined图标显示为false
            // 这样一来pin在划词翻译窗口的作用相当于控制是否在失去焦点的时候关闭
            // 而且对于划词翻译窗口确实需要使其一直处于置顶状态
            appWindow.setAlwaysOnTop(true);
            setPined(false);
        }
    }, []);

    return (
        <Box className={ismacos ? 'topbar-macos' : 'topbar'}>
            <Toaster />
            <Box>
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.setAlwaysOnTop(!pined).then((_) => {
                            if (!pined) {
                                unlisten.then((f) => {
                                    f();
                                });
                            } else {
                                unlisten = listen('tauri://blur', () => {
                                    if (appWindow.label == 'translator' || appWindow.label == 'popclip') {
                                        appWindow.close();
                                    }
                                });
                            }
                            setPined(!pined);
                        });
                    }}
                >
                    <PushPinRoundedIcon color={pined ? 'primary' : ''} />
                </IconButton>
                <IconButton
                    className='topbar-button'
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                        if (!listenCopy) {
                            if (!pined) {
                                appWindow.setAlwaysOnTop(true).then((_) => {
                                    unlisten.then((f) => {
                                        f();
                                    });
                                });
                                setPined(true);
                            }
                            setListenCopy(true);
                            setInt(
                                setInterval(async () => {
                                    const text = await readText();
                                    if (text && text != currentClipboard) {
                                        setCurrentClipboard(text);
                                        emit('new_selection', text);
                                    }
                                }, 200)
                            );
                            toast.success('开始监听剪切板...', {
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                        } else {
                            setListenCopy(false);
                            clearInterval(int);
                            toast.success('停止监听剪切板', {
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                        }
                    }}
                >
                    <Tooltip title='剪切板监听模式'>
                        <PodcastsRoundedIcon color={listenCopy ? 'primary' : ''} />
                    </Tooltip>
                </IconButton>
            </Box>
            {ismacos ? (
                <></>
            ) : (
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.close();
                    }}
                >
                    <CancelRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
}
