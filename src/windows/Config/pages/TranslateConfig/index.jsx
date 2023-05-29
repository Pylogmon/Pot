import { Select, MenuItem, Box, Chip, Switch } from '@mui/material';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React from 'react';
import * as interfaces from '../../../../interfaces';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import language from '../../../../global/language';
import { set } from '../../../../global/config';
import {
    autoCopyAtom,
    dynamicTranslateAtom,
    deleteNewlineAtom,
    openaiStreamAtom,
    targetLanguageAtom,
    secondLanguageAtom,
    defaultInterfaceListAtom,
    rememberTargetLanguageAtom,
} from '../..';
import './style.css';

export default function TranslateConfig() {
    const [dynamicTranslate, setDynamicTranslate] = useAtom(dynamicTranslateAtom);
    const [deleteNewline, setDeleteNewline] = useAtom(deleteNewlineAtom);
    const [openaiStream, setOpenaiStream] = useAtom(openaiStreamAtom);
    const [autoCopy, setAutoCopy] = useAtom(autoCopyAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const [secondLanguage, setSecondLanguage] = useAtom(secondLanguageAtom);
    const [defaultInterfaceList, setDefaultInterfaceList] = useAtom(defaultInterfaceListAtom);
    const [rememberTargetLanguage, setRememberTargetLanguage] = useAtom(rememberTargetLanguageAtom);

    return (
        <ConfigList label='翻译设置'>
            <ConfigItem
                label='动态翻译'
                help='输入后实时翻译，无需其他操作'
            >
                <Switch
                    checked={dynamicTranslate}
                    onChange={async (e) => {
                        setDynamicTranslate(e.target.checked);
                        await set('dynamic_translate', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label='删除换行'
                help='取词后自动删除内容中的换行符及多余空格'
            >
                <Switch
                    checked={deleteNewline}
                    onChange={async (e) => {
                        setDeleteNewline(e.target.checked);
                        await set('delete_newline', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='记住目标语言'>
                <Switch
                    checked={rememberTargetLanguage}
                    onChange={async (e) => {
                        setRememberTargetLanguage(e.target.checked);
                        await set('remember_target_language', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label='OpenAI 流式输出'
                help='开启流式输出后无法使用软件内代理，只能开启全局代理'
            >
                <Switch
                    checked={openaiStream}
                    onChange={async (e) => {
                        setOpenaiStream(e.target.checked);
                        await set('openai_stream', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='默认接口'>
                <Select
                    multiple
                    size='small'
                    sx={{ width: '300px' }}
                    value={defaultInterfaceList}
                    onChange={async (e) => {
                        setDefaultInterfaceList(e.target.value);
                        await set('default_interface_list', e.target.value);
                    }}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip
                                    key={value}
                                    label={interfaces[value]['info']['name']}
                                />
                            ))}
                        </Box>
                    )}
                >
                    {Object.keys(interfaces).map((x) => {
                        return (
                            <MenuItem
                                value={x}
                                key={nanoid()}
                            >
                                <Box>
                                    <img
                                        src={`/${x}.svg`}
                                        className='interface-icon'
                                        alt='interface icon'
                                    />
                                    <span className='interface-name'>{interfaces[x]['info']['name']}</span>
                                </Box>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
            <ConfigItem label='目标语言'>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={targetLanguage}
                    onChange={async (e) => {
                        setTargetLanguage(e.target.value);
                        await set('target_language', e.target.value);
                    }}
                >
                    {language.map((x) => {
                        return (
                            <MenuItem
                                value={x.value}
                                key={nanoid()}
                            >
                                <span className={`fi fi-${x.code}`} />
                                <span>{x.label}</span>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>

            <ConfigItem
                label='第二目标语言'
                help='当检测到翻译结果与源语言相同时自动翻译为第二目标语言'
            >
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={secondLanguage}
                    onChange={async (e) => {
                        setSecondLanguage(e.target.value);
                        await set('second_language', e.target.value);
                    }}
                >
                    {language.map((x) => {
                        return (
                            <MenuItem
                                value={x.value}
                                key={nanoid()}
                            >
                                <span className={`fi fi-${x.code}`} />
                                <span>{x.label}</span>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
            <ConfigItem label='翻译后自动复制'>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={autoCopy}
                    onChange={async (e) => {
                        setAutoCopy(e.target.value);
                        await set('auto_copy', e.target.value);
                    }}
                >
                    <MenuItem value={1}>原文</MenuItem>
                    <MenuItem value={2}>译文</MenuItem>
                    <MenuItem value={3}>原文+译文</MenuItem>
                    <MenuItem value={4}>关闭</MenuItem>
                </Select>
            </ConfigItem>
        </ConfigList>
    );
}
