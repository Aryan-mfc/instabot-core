import * as puppeteer from 'puppeteer';

import type {
  CommentArgsInterface,
  CommonArgsInterface,
  InstabotConfigInterface,
} from '../interfaces/comment.interface';

export type PuppeteerLaunchOptions = puppeteer.PuppeteerLaunchOptions;
export type Page = puppeteer.Page;

export type ConfigurePageType = {
  defaultNavigationTimeout?: number;
};
export type LoginArgs = CommonArgsInterface;
export type ConfigureLinkArgs = CommonArgsInterface;
export type ConfigureLinkReturn = {
  current_url: string;
  login_url: URL;
};
export type VerifyRedirectArgs = ConfigureLinkReturn;

export type HandleWithModeArgs = {
  browser_launched: puppeteer.Browser;
  loginArgs: LoginArgs;
  args: CommentArgsInterface;
};
const TypeOfBrowser = puppeteer.launch;
export type Browser = typeof TypeOfBrowser;

export type TCommentServiceExecuteArgs = {
  link: string;
  author: string;
};
export type TCommentServiceArgs = InstabotConfigInterface;
export type TypeCommentService = (args: TCommentServiceExecuteArgs) => void;
