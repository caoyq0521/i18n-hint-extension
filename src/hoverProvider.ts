import * as vscode from 'vscode';
import { TranslationLoader } from './translationLoader';

export class I18nHoverProvider implements vscode.HoverProvider {
  private translationLoader: TranslationLoader;

  constructor(translationLoader: TranslationLoader) {
    this.translationLoader = translationLoader;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const config = vscode.workspace.getConfiguration('i18nHint');
    if (!config.get<boolean>('enableHover', true)) {
      return null;
    }

    const range = document.getWordRangeAtPosition(position, /\bt\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (!range) {
      return null;
    }

    const text = document.getText(range);
    const match = /\bt\s*\(\s*['"]([^'"]+)['"]\s*\)/.exec(text);
    
    if (!match) {
      return null;
    }

    const key = match[1];
    const translation = this.translationLoader.getTranslation(key);

    if (!translation) {
      return null;
    }

    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**i18n 翻译**\n\n`);
    markdown.appendMarkdown(`**Key:** \`${key}\`\n\n`);
    markdown.appendMarkdown(`**中文:** ${translation}\n\n`);
    markdown.isTrusted = true;

    return new vscode.Hover(markdown, range);
  }
}
