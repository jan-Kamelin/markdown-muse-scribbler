
// Simple utility functions for markdown editor

// For saving markdown content to localStorage
export const saveToLocalStorage = (content: string) => {
  try {
    localStorage.setItem('markdown-content', content);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// For loading markdown content from localStorage
export const loadFromLocalStorage = (): string => {
  try {
    const content = localStorage.getItem('markdown-content');
    return content || getDefaultContent();
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return getDefaultContent();
  }
};

// Insert markdown syntax for common formatting
export const insertMarkdown = (
  content: string, 
  selectionStart: number, 
  selectionEnd: number,
  markdownType: string
): string => {
  const selectedText = content.substring(selectionStart, selectionEnd);
  let modifiedText = '';
  let newCursorPos = 0;

  switch (markdownType) {
    case 'bold':
      modifiedText = `**${selectedText}**`;
      newCursorPos = 2;
      break;
    case 'italic':
      modifiedText = `*${selectedText}*`;
      newCursorPos = 1;
      break;
    case 'heading1':
      modifiedText = `# ${selectedText}`;
      newCursorPos = 2;
      break;
    case 'heading2':
      modifiedText = `## ${selectedText}`;
      newCursorPos = 3;
      break;
    case 'heading3':
      modifiedText = `### ${selectedText}`;
      newCursorPos = 4;
      break;
    case 'link':
      modifiedText = `[${selectedText || 'link text'}](url)`;
      newCursorPos = selectedText ? modifiedText.length - 1 : 10;
      break;
    case 'image':
      modifiedText = `![${selectedText || 'alt text'}](image-url)`;
      newCursorPos = selectedText ? modifiedText.length - 1 : 10;
      break;
    case 'code':
      modifiedText = `\`${selectedText}\``;
      newCursorPos = 1;
      break;
    case 'codeblock':
      modifiedText = `\`\`\`\n${selectedText}\n\`\`\``;
      newCursorPos = 3;
      break;
    case 'quote':
      modifiedText = `> ${selectedText}`;
      newCursorPos = 2;
      break;
    case 'orderedList':
      modifiedText = `1. ${selectedText}`;
      newCursorPos = 3;
      break;
    case 'unorderedList':
      modifiedText = `- ${selectedText}`;
      newCursorPos = 2;
      break;
    case 'horizontalRule':
      modifiedText = `\n---\n${selectedText}`;
      newCursorPos = 5;
      break;
    case 'strikethrough':
      modifiedText = `~~${selectedText}~~`;
      newCursorPos = 2;
      break;
    default:
      modifiedText = selectedText;
      break;
  }

  // Replace selected text with modified text
  return content.substring(0, selectionStart) + modifiedText + content.substring(selectionEnd);
};

// Export markdown content as a file
export const exportMarkdown = (content: string, filename: string = 'document.md') => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/markdown' });
  
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Example/placeholder content for new users
export const getDefaultContent = (): string => {
  return `# Welcome to Markdown Muse

## A simple markdown editor

Write your content here using **markdown** syntax.

### Features:
- Real-time preview
- Basic formatting
- Local storage save
- Export to .md file

> Inspiration comes from simplicity

\`\`\`
// Code blocks are supported too
function hello() {
  console.log("Hello Markdown!");
}
\`\`\`

[Learn more about Markdown](https://www.markdownguide.org/)

Happy writing!
`;
};
