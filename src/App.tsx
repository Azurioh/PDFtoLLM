import type React from 'react';
import { useState } from 'react';
import type { UploadProps, UploadFile } from 'antd';
import { Button, Card, Flex, Upload, Spin } from 'antd';
import style from './App.module.css';
import { CopyOutlined, GithubOutlined, ScissorOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';
import { convertPdfToMarkdown, getResponseStream } from './utils/chat';
import { Buffer } from 'buffer';
import TextArea from 'antd/es/input/TextArea';

interface FileContent {
  file: UploadFile;
  markdownContent: string | null;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);

  window.Buffer = Buffer;

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    const newFiles = fileList.map(file => ({
      file,
      markdownContent: null
    }));
    setFiles(newFiles);
  };

  const props: UploadProps = {
    name: 'file',
    accept: '.pdf',
    multiple: true,
    onChange: handleChange,
    beforeUpload: () => {
      return false;
    },
    fileList: files.map(f => f.file),
  };

  const convertFile = async (fileContent: FileContent, index: number) => {
    try {
      const pdfBlob = fileContent.file.originFileObj;

      if (!(pdfBlob instanceof Blob)) {
        throw new Error('File is not a Blob object');
      }

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          if (reader.result) {
            const arrayBuffer = (await fileContent.file.originFileObj?.arrayBuffer()) as ArrayBuffer;
            const buffer = Buffer.from(arrayBuffer);
            resolve(buffer);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(pdfBlob);
      });

      const markdown = await convertPdfToMarkdown(pdfBuffer);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, markdownContent: markdown } : f
      ));
      console.log(`Markdown exported for file ${index + 1}`);
    } catch (error) {
      console.error('Error converting PDF:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, markdownContent: 'Error converting PDF. Please try again.' } : f
      ));
    }
  };

  const handleConversion = async () => {
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    setIsConverting(true);

    try {
      // Convert all files sequentially
      for (let i = 0; i < files.length; i++) {
        await convertFile(files[i], i);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleAskQuestion = async () => {
    const convertedFiles = files.filter(f => f.markdownContent && !f.markdownContent.includes('Error'));
    if (convertedFiles.length === 0 || !question.trim()) return;

    setIsStreaming(true);
    setResponse('');

    try {
      // Combine all markdown content with clear separation
      const combinedContent = convertedFiles
        .map(f => `=== Content from ${f.file.name} ===\n${f.markdownContent}`)
        .join('\n\n');

      const stream = await getResponseStream(combinedContent, question);

      for await (const event of stream) {
        const chunk = event.data.choices[0].delta.content as string;
        if (!chunk) {
          continue;
        }
        const ssePayload = `${chunk.replace(/\n/g, '\\n')}`;
        setResponse((prev) => (prev || '') + ssePayload);
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setResponse('Error getting response. Please try again.');
    } finally {
      setIsStreaming(false);
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
            <a href="https://github.com/Azurioh/PDFtoLLM" target="_blank" rel="noreferrer">
              <GithubOutlined className={style.githubIcon} />
              GitHub
            </a>
          </Flex>
        </Flex>
      </Flex>
      <Flex className={style.content}>
        <Flex className={style.contentHeader}>
          <h1>Make your PDF files friendly with LLM</h1>
          <p>Transform any PDF files into text that can be understood by an LLM (like ChatGPT, Deepseek and others).</p>
        </Flex>
        <Flex className={style.contentCard}>
          <Upload.Dragger {...props} className={style.uploadContainer}>
            <Button icon={<UploadOutlined />} className={style.uploadButton}>
              Upload PDFs
            </Button>
          </Upload.Dragger>
          <Button
            className={style.convertButton}
            icon={<ScissorOutlined />}
            disabled={files.length === 0 || isConverting}
            onClick={handleConversion}>
            {isConverting ? <Spin size="small" /> : 'Convert All'}
          </Button>
        </Flex>

        {files.some(f => f.markdownContent) && (
          <>
            <Flex className={style.contentResponse}>
              <Flex className={style.contentResponseTitle}>
                <h3>Converted Files</h3>
              </Flex>
              <Card className={style.contentResponseCard}>
                {files.map((fileContent) => (
                  fileContent.markdownContent && (
                    <div key={fileContent.file.name} className={style.fileContent}>
                      <h4>{fileContent.file.name}</h4>
                      <div className={style.markdownContent}>
                        {fileContent.markdownContent.split('\n').map((paragraph, i) => (
                          <p key={`${fileContent.file.name}-${i}`}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </Card>
            </Flex>

            <Flex className={style.questionSection} vertical>
              <h3>Ask a question about your documents</h3>
              <Flex className={style.questionInput}>
                <TextArea
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onPressEnter={handleAskQuestion}
                  disabled={isStreaming}
                />
                <Button
                  icon={<SendOutlined />}
                  onClick={handleAskQuestion}
                  loading={isStreaming}
                  disabled={!question.trim()}>
                  Ask
                </Button>
              </Flex>
            </Flex>

            {(response || isStreaming) && (
              <Flex className={style.contentResponse}>
                <Flex className={style.contentResponseTitle}>
                  <h3>Response</h3>
                  {response && (
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => navigator.clipboard.writeText(response)}
                      className={style.copyButton}
                    />
                  )}
                </Flex>
                <Card className={style.contentResponseCard}>
                  {isStreaming && !response ? <Spin /> : <p>{response}</p>}
                </Card>
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default App;
