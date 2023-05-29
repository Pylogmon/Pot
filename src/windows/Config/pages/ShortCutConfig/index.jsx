import { TextField, Button, InputAdornment } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useAtom } from 'jotai';
import { shortcutTranslateAtom, shortcutPersistentAtom, shortcutOcrAtom } from '../..';
import ConfigItem from '../../components/ConfigItem';
import ConfigList from '../../components/ConfigList';
import { set } from '../../../../global/config';

const keyMap = {
    Backquote: '`',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Equal: '=',
    Minus: '-',
    Plus: 'PLUS',
    Period: '.',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    Backspace: 'Backspace',
    CapsLock: 'Capslock',
    ContextMenu: 'Contextmenu',
    Space: 'Space',
    Tab: 'Tab',
    Convert: 'Convert',
    Delete: 'Delete',
    End: 'End',
    Help: 'Help',
    Home: 'Home',
    PageDown: 'Pagedown',
    PageUp: 'Pageup',
    Escape: 'Esc',
    PrintScreen: 'Printscreen',
    ScrollLock: 'Scrolllock',
    Pause: 'Pause',
    Insert: 'Insert',
    Suspend: 'Suspend',
};

export default function ShortCutConfig() {
    const [shortcutTranslate, setShortcutTranslate] = useAtom(shortcutTranslateAtom);
    const [shortcutPersistent, setShortcutPersistent] = useAtom(shortcutPersistentAtom);
    const [shortcutOcr, setShortcutOcr] = useAtom(shortcutOcrAtom);
    const [isMacos, setIsMacos] = useState(false);
    const [isWayland, setIsWayland] = useState(false);

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsMacos(v);
        });
        invoke('is_wayland').then((v) => {
            setIsWayland(v);
        });
    });

    function keyDown(e, setKey) {
        if (e.keyCode == 8) {
            setKey('');
        } else {
            let newValue = '';
            if (e.ctrlKey) {
                newValue = 'Ctrl';
            }
            if (e.shiftKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}Shift`;
            }
            if (e.metaKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}${isMacos ? 'Command' : 'Super'}`;
            }
            if (e.altKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}Alt`;
            }
            let code = e.code;
            if (code.startsWith('Key')) {
                code = code.substring(3);
            } else if (code.startsWith('Digit')) {
                code = code.substring(5);
            } else if (code.startsWith('Numpad')) {
                code = 'Num' + code.substring(6);
            } else if (code.startsWith('Arrow')) {
                code = code.substring(5);
            } else if (code.startsWith('Intl')) {
                code = code.substring(4);
            } else if (/F\d+/.test(code)) {
                // F1-F12 不处理
            } else if (keyMap[code] !== undefined) {
                code = keyMap[code];
            } else {
                code = '';
            }
            setKey(`${newValue}${newValue.length > 0 && code.length > 0 ? '+' : ''}${code}`);
        }
    }

    return (
        <ConfigList label='翻译快捷键'>
            <ConfigItem
                label='划词翻译'
                help={isWayland && 'Wayland无法使用应用内快捷键，请通过系统快捷键设置，详细见官网文档'}
            >
                <TextField
                    disabled={isWayland}
                    size='small'
                    sx={{ width: '300px' }}
                    value={shortcutTranslate}
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    onKeyDown={(e) => {
                        keyDown(e, setShortcutTranslate);
                    }}
                    onFocus={() => {
                        setShortcutTranslate('');
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <Button
                                    size='small'
                                    variant='outlined'
                                    onClick={() => {
                                        set('shortcut_translate', shortcutTranslate);
                                    }}
                                >
                                    确认
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label='独立翻译窗口'
                help={isWayland && 'Wayland无法使用应用内快捷键，请通过系统快捷键设置，详细见官网文档'}
            >
                <TextField
                    size='small'
                    disabled={isWayland}
                    sx={{ width: '300px' }}
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    value={shortcutPersistent}
                    onKeyDown={(e) => {
                        keyDown(e, setShortcutPersistent);
                    }}
                    onFocus={() => {
                        setShortcutPersistent('');
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <Button
                                    size='small'
                                    variant='outlined'
                                    onClick={() => {
                                        set('shortcut_persistent', shortcutPersistent);
                                    }}
                                >
                                    确认
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            {/* <ConfigItem label="OCR">
                <TextField
                    fullWidth
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    value={shortcutOcr}
                    onKeyDown={(e) => { keyDown(e, shortcutOcr, setShortcutOcr) }}
                    onFocus={() => { setShortcutOcr('') }}
                />
            </ConfigItem> */}
            <p>
                想要更流畅的翻译体验，请查阅
                <a
                    href='https://pot.pylogmon.com/docs/tutorial/config/plugin_config'
                    target='_blank'
                >
                    插件调用
                </a>
                文档
            </p>

            <img
                src='plugin.gif'
                style={{ width: '100%' }}
            ></img>
        </ConfigList>
    );
}
