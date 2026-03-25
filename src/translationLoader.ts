import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export class TranslationLoader {
  private translations: Map<string, TranslationMap> = new Map();
  private workspaceRoot: string;
  private localesPath: string;
  private watcher: vscode.FileSystemWatcher | undefined;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    const config = vscode.workspace.getConfiguration('i18nHint');
    this.localesPath = config.get<string>('localesPath', 'src/locales/lang');
    this.loadAllTranslations();
    this.setupFileWatcher();
  }

  private setupFileWatcher() {
    const localesFullPath = path.join(this.workspaceRoot, this.localesPath);
    const pattern = new vscode.RelativePattern(localesFullPath, '**/*.ts');
    
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);
    
    this.watcher.onDidChange(() => this.loadAllTranslations());
    this.watcher.onDidCreate(() => this.loadAllTranslations());
    this.watcher.onDidDelete(() => this.loadAllTranslations());
  }

  private loadAllTranslations() {
    this.translations.clear();
    const config = vscode.workspace.getConfiguration('i18nHint');
    const defaultLocale = config.get<string>('defaultLocale', 'zh-CN');
    
    const localesFullPath = path.join(this.workspaceRoot, this.localesPath);
    
    if (!fs.existsSync(localesFullPath)) {
      console.warn(`翻译文件路径不存在: ${localesFullPath}`);
      return;
    }

    const localeDirs = fs.readdirSync(localesFullPath).filter(file => {
      const fullPath = path.join(localesFullPath, file);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const locale of localeDirs) {
      const localeDir = path.join(localesFullPath, locale);
      const translations = this.loadLocaleTranslations(localeDir);
      this.translations.set(locale, translations);
    }
  }

  private loadLocaleTranslations(localeDir: string): TranslationMap {
    const translations: TranslationMap = {};

    const loadDirectory = (dir: string, prefix: string = '') => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          loadDirectory(fullPath, prefix ? `${prefix}.${file}` : file);
        } else if (file.endsWith('.ts') && !file.startsWith('.')) {
          const moduleName = file.replace('.ts', '');
          const moduleKey = prefix ? `${prefix}.${moduleName}` : moduleName;
          
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const moduleTranslations = this.parseTranslationFile(content);
            this.mergeTranslations(translations, moduleKey, moduleTranslations);
          } catch (error) {
            console.error(`解析翻译文件失败: ${fullPath}`, error);
          }
        }
      }
    };

    loadDirectory(localeDir);
    return translations;
  }

  private parseTranslationFile(content: string): TranslationMap {
    const cleanContent = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/import\s+.*?;/g, '')
      .replace(/export\s+default\s+/, 'return ');

    try {
      const fn = new Function(cleanContent);
      return fn() || {};
    } catch (error) {
      console.error('解析翻译内容失败:', error);
      return {};
    }
  }

  private mergeTranslations(target: TranslationMap, key: string, value: TranslationMap) {
    const keys = key.split('.');
    let current: any = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  public getTranslation(key: string, locale?: string): string | undefined {
    const config = vscode.workspace.getConfiguration('i18nHint');
    const targetLocale = locale || config.get<string>('defaultLocale', 'zh-CN');
    
    const localeTranslations = this.translations.get(targetLocale);
    if (!localeTranslations) {
      return undefined;
    }

    const keys = key.split('.');
    let current: any = localeTranslations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  public getAllTranslations(locale?: string): TranslationMap | undefined {
    const config = vscode.workspace.getConfiguration('i18nHint');
    const targetLocale = locale || config.get<string>('defaultLocale', 'zh-CN');
    return this.translations.get(targetLocale);
  }

  public dispose() {
    if (this.watcher) {
      this.watcher.dispose();
    }
  }
}
