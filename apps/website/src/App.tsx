import React, { useState } from 'react';
import type { UploadProps, UploadFile } from 'antd';
import { Button, Card, Flex, Upload } from 'antd';
import style from './App.module.css'
import { CopyOutlined, GithubOutlined, ScissorOutlined, UploadOutlined } from '@ant-design/icons';

const App: React.FC = () => {
  const [file, setFile] = useState<UploadFile | null>(null);
  const [response, setResponse] = useState<string | null>("coucou");

  const handleChange: UploadProps['onChange'] = ({ file }) => {
    switch (file.status) {
      case 'done':
        setFile(file);
        break;
      case 'removed':
        setFile(null);
        setResponse("coucou");
        break;
    }
  };

  const props: UploadProps = {
    name: 'file',
    accept: '.pdf',
    onChange: handleChange,
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    fileList: file ? [file] : [],
  };

  const copyToClipboard = () => {
    const textToCopy = document.querySelector('#pdf p')?.textContent;
    console.log(textToCopy);
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  return (
    <Flex className={style.container}>
      <Flex className={style.navbar}>
        <Flex className={style.navbarContainer}>
          <Flex className={style.headerTitle}>
          <a href="/">
            <h2>
              <span className={style.headerTitleBlue}>PDF</span>
              to
              <span className={style.headerTitleGreen}>LLM</span>
            </h2>
          </a>
        </Flex>
        <Flex className={style.headerLinks}>
          <GithubOutlined className={style.githubIcon} />
          <a href="https://github.com/Azurioh/PDFtoLLM" target='_blank'>GitHub</a>
        </Flex>
        </Flex>
      </Flex>
      <Flex className={style.content}>
        <Flex className={style.contentHeader}>
          <h1>Make your PDF file friendly with LLM</h1>
          <p>Transform any PDF file into text that can be understood by an LLM (like ChatGPT, Deepseek and others).</p>
        </Flex>
        <Flex className={style.contentCard}>
          <Upload.Dragger {...props} className={style.uploadContainer}>
            <Button icon={<UploadOutlined />} className={style.uploadButton}>Upload PDF</Button>
          </Upload.Dragger>
          <Button className={style.convertButton} icon={<ScissorOutlined />} disabled={!file}>Convert</Button>
        </Flex>
        <Flex className={style.contentResponse} style={{ display: response ? 'flex' : 'none' }}>
          <Flex className={style.contentResponseTitle}>
            <h3>PDF Content</h3>
            <Button icon={<CopyOutlined />} onClick={copyToClipboard} className={style.copyButton}></Button>
          </Flex>
          <Card id="pdf" className={style.contentResponseCard}>
            <p>Coucou mon ptit gab</p>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default App
