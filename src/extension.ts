import * as vscode from 'vscode';
import * as path from 'path';
import { TranslationLoader } from './translationLoader';
import { I18nInlineHintsProvider } from './inlineHintsProvider';
import { I18nHoverProvider } from './hoverProvider';

let translationLoader: TranslationLoader | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('i18n 翻译提示插件已激活');

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage('未找到工作区，i18n 翻译提示插件无法启动');
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  translationLoader = new TranslationLoader(workspaceRoot);

  const inlineHintsProvider = new I18nInlineHintsProvider(translationLoader);
  const hoverProvider = new I18nHoverProvider(translationLoader);

  const supportedLanguages = ['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'];

  context.subscriptions.push(
    vscode.languages.registerInlayHintsProvider(
      supportedLanguages.map(lang => ({ language: lang })),
      inlineHintsProvider
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      supportedLanguages,
      hoverProvider
    )
  );

  vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
    if (e.affectsConfiguration('i18nHint')) {
      if (translationLoader) {
        translationLoader.dispose();
      }
      translationLoader = new TranslationLoader(workspaceRoot);
    }
  });

  vscode.window.showInformationMessage('i18n 翻译提示插件已启动');
}

export function deactivate() {
  if (translationLoader) {
    translationLoader.dispose();
  }
}
