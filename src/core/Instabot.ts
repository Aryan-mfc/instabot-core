import { URL } from 'url';
import { randomInt } from 'crypto';
import * as puppeteer from 'puppeteer';
import pensador from 'pensador-promise';
import axios from 'axios';

import type { PuppeteerLaunchOptions } from 'puppeteer';

import { sleep } from '../shared/helpers';
import { EmojiServiceImpl, CommentService } from '../services';

import { Logger } from '../utils/Logger';

import { INSTAGRAM_LOGIN_URL } from '../shared/constants/instagram.constant';

import { ModeEnum } from '../shared/enums/Instabot.enum';
import default_phrases from '../shared/json/default-phrases';
import type { CommentArgsInterface, InstabotConfigInterface } from '../shared/interfaces/comment.interface';
import type { ConfigureLinkArgs, ConfigureLinkReturn, LoginArgs, Page } from '../shared/types/comment.type';

export class Instabot {
  private logger: Logger = new Logger(Instabot.name);
  private emojiServiceImpl: EmojiServiceImpl = new EmojiServiceImpl();
  private commentService: CommentService;

  private mode: ModeEnum = ModeEnum.DEFAULT;

  public constructor(private instabotConfig: InstabotConfigInterface) {
    this.logger.info(`Starting`);
    this.commentService = new CommentService({ ...instabotConfig });
    this.commentService.execute = this.comment.bind(this);
  }
  public set setMode(mode: ModeEnum) {
    this.mode = mode;
  }
  public get getMode(): ModeEnum {
    return this.mode;
  }

  public async comment(args: CommentArgsInterface): Promise<void> {
    const browser_launched = await this.browser();
    try {
      await this.configure(args);
      const page = await this.configurePage(browser_launched);

      await this.login({ page, args });

      await page.goto(args.link);

      const quaint = randomInt(5, 10100);
      for (let i = 0; i < quaint; i++) {
        const randEmoji = randomInt(0, 7);
        const emoji = await this.emojiServiceImpl.execute(randEmoji);
        this.logger.info('Waiting');
        await page.waitForTimeout(randomInt(30678, 35678));
        const phrase = await this.getPhrase(args.author);
        const comment = `${phrase} ${emoji.replace(/['"]+/g, '')}`;
        this.logger.info(`Comment: ${comment}, author: ${args.author}`);
        this.logger.info('Commenting');

        for (let j = 0; j < 2; j++) {
          comment;
        }
        await page.type('textarea', comment, { delay: 567 });
        await page.click("button[type='submit']");
      }
      await browser_launched.close();
      this.logger.info(new Date().toDateString());
    } catch (error) {
      if (browser_launched) await browser_launched.close();
      if (error instanceof Error) {
        this.logger.error(error.message);
        throw process.exit(0);
      }
      throw error;
    } finally {
      browser_launched.close();
      await sleep(randomInt(3000000, 3120000));
    }
  }
  private async getPhrase(author: string): Promise<string> {
    const MAX_PHRASES = 50;
    const randPhrase = randomInt(0, MAX_PHRASES);
    let phrase: string;
    const pensador_phrase = await pensador({
      term: author || 'Jesus+Cristo',
      max: MAX_PHRASES,
    });
    if (pensador_phrase.total === 0) {
      const defaultPhrases = default_phrases[randomInt(0, randPhrase)];
      phrase = defaultPhrases.text;
    }
    phrase = pensador_phrase.phrases[randomInt(0, randPhrase)].text;
    return phrase;
  }
  private async verifyRedirect(args: CommentArgsInterface): Promise<void> {
    const configuredLink = await this.configureLink({
      args,
      page: args.page as Page,
    });
    if (configuredLink.current_url.includes(args.link) !== false) {
      const message = 'Instagram redirected incorrectly';
      this.logger.error(message);
      return Promise.reject(message);
    }
  }

  private async configure(args: CommentArgsInterface): Promise<void> {
    this.logger.info('Configuring');
    try {
      if (!args.link) return Promise.reject(new Error('Link is required'));
      if (!args.author) args.author = 'Jesus';
      if (!this.instabotConfig.loginInstagram || !this.instabotConfig.passwordInstagram)
        return Promise.reject(new Error('Login or password is required!'));

      return Promise.resolve();
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw error;
    }
  }
  private async configureLink(configureLinkArgs: ConfigureLinkArgs): Promise<ConfigureLinkReturn> {
    const current_url = configureLinkArgs.page.url();
    const login_url = INSTAGRAM_LOGIN_URL(configureLinkArgs.args.link);
    await this.handleWithNotFound(configureLinkArgs.args.link);
    return {
      current_url,
      login_url,
    };
  }
  public async configurePage(browser_launched: puppeteer.Browser): Promise<Page> {
    this.logger.info('Configuring page');
    const page = await browser_launched.newPage();
    page.setDefaultNavigationTimeout(60000);
    return page;
  }
  private async login(loginArgs: LoginArgs): Promise<Page> {
    const { page, args } = loginArgs;
    const post_url = new URL(args.link);
    const login_url = INSTAGRAM_LOGIN_URL(post_url.href);
    await page.goto(login_url.href);
    this.logger.info('Made login');
    await page.waitForSelector('form.HmktE');
    this.logger.info('Typing credentials');
    await page.type("input[name='username']", this.instabotConfig.loginInstagram, { delay: 567 });
    await page.type("input[name='password']", this.instabotConfig.passwordInstagram, { delay: 434 });
    await page.click("button[type='submit']");
    this.logger.info('Logging in');
    await page.waitForSelector('section._aa55');
    await page.click('button._acan');
    this.logger.info('Logged in');
    await page.waitForSelector("textarea[aria-label='Adicione um comentário...']");
    return Promise.resolve(page);
  }
  private async handleWithNotFound(link: string): Promise<string> {
    this.logger.info('Verifying link');
    const response = await axios(link);
    const { data } = response;
    const notFound = data.includes('não encontrada') || data.includes('Not Found');
    if (notFound) throw new Error('Page Not Found');
    return Promise.resolve(link);
  }
  public async browser(options?: PuppeteerLaunchOptions) {
    const launch = await puppeteer.launch({
      ...options,
      headless: options?.headless || false,
      args: ['--start-maximized'],
      defaultViewport: options?.defaultViewport || null,
    });
    return launch;
  }
}
export default Instabot;
