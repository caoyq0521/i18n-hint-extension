import * as vscode from 'vscode';
import { TranslationLoader } from './translationLoader';

export class I18nInlineHintsProvider implements vscode.InlayHintsProvider {
  private translationLoader: TranslationLoader;

  constructor(translationLoader: TranslationLoader) {
    this.translationLoader = translationLoader;
  }

  provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlayHint[]> {
    const config = vscode.workspace.getConfiguration('i18nHint');
    if (!config.get<boolean>('enableInlineHints', true)) {
      return [];
    }

    const hints: vscode.InlayHint[] = [];
    const text = document.getText(range);
    const rangeStartOffset = document.offsetAt(range.start);
    
    // 匹配 t('key') 或 t("key") 模式
    const regex = /\bt\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const key = match[1];
      const translation = this.translationLoader.getTranslation(key);

      if (translation) {
        const absoluteOffset = rangeStartOffset + match.index + match[0].length;
        const position = document.positionAt(absoluteOffset);
        
        const hint = new vscode.InlayHint(
          position,
          ` // ${translation}`,
          vscode.InlayHintKind.Type
        );
        
        hint.paddingLeft = true;
        hint.tooltip = `翻译: ${translation}\nKey: ${key}`;
        
        hints.push(hint);
      }
    }

    return hints;
  }
}
