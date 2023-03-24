import * as puppeteer from 'puppeteer';
import type { PuppeteerLaunchOptions } from 'puppeteer';

export interface InstabotConfigInterface {
  loginInstagram: string;
  passwordInstagram: string;
  puppeteer_options?: PuppeteerLaunchOptions;
}
export interface CommentArgsInterface {
  link: string;
  author: string;
  mode?: number;
  page?: puppeteer.Page;
}
export interface CommonArgsInterface {
  page: puppeteer.Page;
  args: CommentArgsInterface;
}
