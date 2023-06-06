import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Box, IconButton, InputBase } from '@mui/material';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { atom, useAtom, useAtomValue } from 'jotai';
import { ocrInterfaceAtom, ocrLanguageAtom } from '../OcrController';
import * as ocrs from '../../../../interfaces_ocr';
import { imgUrlAtom } from '../ImageArea';
import './style.css';
export const resultTextAtom = atom('');

export default function TextArea() {
    const [loading, setLoading] = useState(false);
    const [resultText, setResultText] = useAtom(resultTextAtom);
    const imgUrl = useAtomValue(imgUrlAtom);
    const ocrLanguage = useAtomValue(ocrLanguageAtom);
    const ocrInterface = useAtomValue(ocrInterfaceAtom);
    const { t } = useTranslation();
    const theme = useTheme();

    // 复制内容
    function copy(who) {
        writeText(who).then((_) => {
            toast.success(t('info.writeclipboard'), {
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
        });
    }

    useEffect(() => {
        if (imgUrl !== '') {
            setLoading(true);
            setResultText('');
            let ocror = ocrs[ocrInterface];
            ocror.ocr(imgUrl, ocrLanguage).then(
                (v) => {
                    setResultText(v);
                    setLoading(false);
                },
                (e) => {
                    setResultText(e.toString());
                    console.log(e);
                    setLoading(false);
                }
            );
        }
    }, [imgUrl, ocrInterface, ocrLanguage]);

    return (
        <>
            <Box className='text-content'>
                <Toaster />
                <InputBase
                    multiline
                    fullWidth
                    value={resultText}
                    placeholder={t('ocr.placehold')}
                    onChange={(e) => {
                        setResultText(e.target.value);
                    }}
                />
            </Box>
            <Box className='text-control'>
                <IconButton
                    className='control-button'
                    onClick={() => {
                        copy(resultText);
                    }}
                >
                    <ContentCopyRoundedIcon />
                </IconButton>
                <PulseLoader
                    loading={loading}
                    color={theme.palette.text.primary}
                    size={10}
                    cssOverride={{
                        display: 'inline-block',
                        margin: 'auto',
                        marginLeft: '20px',
                    }}
                />
            </Box>
        </>
    );
}
